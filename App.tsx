import React, { useState, useMemo, useEffect, lazy, Suspense } from 'react';
import Sidebar from './components/Sidebar';
import Chatbot from './components/Chatbot';
import {
  getDistributionIndex,
  loadDistribution,
  type DistributionIndexEntry,
} from './services/distributionLoader';
import type { Distribution } from './types';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import type { Page } from './types';
import Breadcrumbs from './components/Breadcrumbs';
import { LoadingProvider } from './contexts/LoadingContext';
import GlobalLoadingIndicator from './components/GlobalLoadingIndicator';
import { ChatProvider } from './contexts/ChatContext';
import useLocalStorage from './hooks/useLocalStorage';
import UserGuide from './components/UserGuide';
import { UserHistoryProvider } from './contexts/UserHistoryContext';
import { learningPathData } from './data/learningPaths';
import QuickReturn from './components/QuickReturn';
import ErrorBoundary from './components/ErrorBoundary';

// Lazy load page components for better performance
const Dashboard = lazy(() =>
  import('./components/Dashboard').then((module) => ({ default: module.Dashboard }))
);
const ContentDisplay = lazy(() => import('./components/ContentDisplay'));
const StatisticalCopilot = lazy(() => import('./components/StatisticalCopilot'));
const AiDesigner = lazy(() => import('./components/AiDesigner'));
const IntelligentArticle = lazy(() => import('./components/IntelligentArticle'));
const LearningPaths = lazy(() => import('./components/LearningPaths'));
const LearningPlan = lazy(() => import('./components/LearningPlan'));
const DecisionGuide = lazy(() => import('./components/DecisionGuide'));

const AppContent: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { settings } = useSettings();

  // User Guide State
  const [hasSeenGuide, setHasSeenGuide] = useLocalStorage('hasSeenUserGuide', false);
  const [isGuideOpen, setIsGuideOpen] = useState(!hasSeenGuide);

  // Distribution data loading
  const [distributionsData, setDistributionsData] = useState<Distribution[]>([]);
  const [isLoadingDistributions, setIsLoadingDistributions] = useState(true);

  // Load distribution index first, then all groups in parallel
  useEffect(() => {
    const loadAllDistributions = async () => {
      try {
        // Load all groups in parallel (7 groups, 1-8KB each)
        const groupPromises = [1, 2, 3, 4, 5, 6, 7].map((groupNum) =>
          import(`./data/distributions/group-${groupNum}.json`).then((m) => m.default),
        );

        const groups = await Promise.all(groupPromises);
        const allDistributions = groups.flat();

        setDistributionsData(allDistributions);
        setIsLoadingDistributions(false);
      } catch (error) {
        console.error('Failed to load distributions:', error);
        setIsLoadingDistributions(false);
      }
    };

    loadAllDistributions();
  }, []);

  useEffect(() => {
    // Check for modelId in URL on initial load to support sharing
    if (!isLoadingDistributions && distributionsData.length > 0) {
      const params = new URLSearchParams(window.location.search);
      const modelId = params.get('modelId');
      if (modelId) {
        const id = parseInt(modelId, 10);
        if (!isNaN(id) && distributionsData.some((d) => d.id === id)) {
          setSelectedId(id);
          setCurrentPage('models');
        }
      }
    }
  }, [isLoadingDistributions, distributionsData]);

  const selectedDistribution = useMemo(() => {
    if (distributionsData.length === 0) return null;
    return distributionsData.find((d) => d.id === selectedId) || distributionsData[0];
  }, [selectedId, distributionsData]);

  // Loading fallback component
  const PageLoader = () => (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-12 h-12 border-4 border-[color:rgb(var(--color-primary)/0.2)] border-t-[color:rgb(var(--color-primary))] rounded-full animate-spin"></div>
        <p className="text-sm text-[color:var(--color-text-muted)]">加载中...</p>
      </div>
    </div>
  );

  const mainContent = () => {
    // Show loading state while distributions are being loaded
    if (isLoadingDistributions) {
      return <PageLoader />;
    }

    return (
      <ErrorBoundary>
        <Suspense fallback={<PageLoader />}>
          {(() => {
            switch (currentPage) {
              case 'dashboard':
                return (
                  <Dashboard
                    distributions={distributionsData}
                    setCurrentPage={setCurrentPage}
                    setSelectedId={setSelectedId}
                  />
                );
              case 'models':
                return (
                  <ContentDisplay
                    distribution={selectedDistribution}
                    distributions={distributionsData}
                    setSelectedId={setSelectedId}
                  />
                );
              case 'copilot':
                return <StatisticalCopilot />;
              case 'designer':
                return <AiDesigner />;
              case 'article':
                return (
                  <IntelligentArticle
                    distribution={selectedDistribution}
                    distributions={distributionsData}
                    setCurrentPage={setCurrentPage}
                    setSelectedId={setSelectedId}
                  />
                );
              case 'paths':
                return (
                  <LearningPaths
                    setCurrentPage={setCurrentPage}
                    setSelectedId={setSelectedId}
                    distributions={distributionsData}
                  />
                );
              case 'plan':
                return <LearningPlan />;
              case 'guide':
                return (
                  <DecisionGuide
                    distributions={distributionsData}
                    learningPaths={learningPathData}
                    setCurrentPage={setCurrentPage}
                    setSelectedId={setSelectedId}
                  />
                );
              default:
                return (
                  <Dashboard
                    distributions={distributionsData}
                    setCurrentPage={setCurrentPage}
                    setSelectedId={setSelectedId}
                  />
                );
            }
          })()}
        </Suspense>
      </ErrorBoundary>
    );
  };

  const handleCloseGuide = () => {
    setIsGuideOpen(false);
    setHasSeenGuide(true);
  };

  return (
    <div className={`flex flex-col min-h-screen ${settings.fontSize}`}>
      <UserGuide isOpen={isGuideOpen} onClose={handleCloseGuide} />
      <GlobalLoadingIndicator />
      <Header
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)}
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
      />

      <div className="flex flex-1">
        <Sidebar
          distributions={distributionsData}
          selectedId={selectedId}
          setSelectedId={setSelectedId}
          isOpen={isSidebarOpen}
          setIsOpen={setIsSidebarOpen}
          setCurrentPage={setCurrentPage}
          currentPage={currentPage}
        />
        <div className="flex-1 w-full pt-16 pb-16 md:pb-0 transition-all duration-300 md:pl-72">
          <div className="p-4 sm:p-6 md:p-8 lg:p-10">
            <Breadcrumbs
              currentPage={currentPage}
              setCurrentPage={setCurrentPage}
              selectedDistribution={selectedDistribution}
            />
            <main>{mainContent()}</main>
          </div>
        </div>
      </div>

      <QuickReturn
        currentPage={currentPage}
        setCurrentPage={setCurrentPage}
        setSelectedId={setSelectedId}
      />
      <Chatbot selectedDistribution={selectedDistribution} />
      <Footer currentPage={currentPage} setCurrentPage={setCurrentPage} />
    </div>
  );
};

const App: React.FC = () => (
  <SettingsProvider>
    <LoadingProvider>
      <ChatProvider>
        <UserHistoryProvider>
          <AppContent />
        </UserHistoryProvider>
      </ChatProvider>
    </LoadingProvider>
  </SettingsProvider>
);

export default App;
