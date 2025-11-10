
import React, { useState, useMemo, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ContentDisplay from './components/ContentDisplay';
import Chatbot from './components/Chatbot';
import { distributionsData } from './data/distributions';
import { SettingsProvider, useSettings } from './contexts/SettingsContext';
import Header from './components/Header';
import Footer from './components/Footer';
import StatisticalCopilot from './components/StatisticalCopilot';
import AiDesigner from './components/AiDesigner';
import IntelligentArticle from './components/IntelligentArticle';
// FIX: Changed to a named import because Dashboard does not have a default export.
import { Dashboard } from './components/Dashboard';
import LearningPaths from './components/LearningPaths';
import LearningPlan from './components/LearningPlan';
import type { Page } from './types';
import Breadcrumbs from './components/Breadcrumbs';
import { LoadingProvider } from './contexts/LoadingContext';
import GlobalLoadingIndicator from './components/GlobalLoadingIndicator';
import { ChatProvider } from './contexts/ChatContext';
import useLocalStorage from './hooks/useLocalStorage';
import UserGuide from './components/UserGuide';
import { UserHistoryProvider } from './contexts/UserHistoryContext';
import DecisionGuide from './components/DecisionGuide';
import { learningPathData } from './data/learningPaths';
import QuickReturn from './components/QuickReturn';


const AppContent: React.FC = () => {
  const [selectedId, setSelectedId] = useState<number>(1);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { settings } = useSettings();

  // User Guide State
  const [hasSeenGuide, setHasSeenGuide] = useLocalStorage('hasSeenUserGuide', false);
  const [isGuideOpen, setIsGuideOpen] = useState(!hasSeenGuide);


  useEffect(() => {
    // Check for modelId in URL on initial load to support sharing
    const params = new URLSearchParams(window.location.search);
    const modelId = params.get('modelId');
    if (modelId) {
      const id = parseInt(modelId, 10);
      if (!isNaN(id) && distributionsData.some(d => d.id === id)) {
        setSelectedId(id);
        setCurrentPage('models');
      }
    }
  }, []); // Empty dependency array ensures this runs only once on mount

  const selectedDistribution = useMemo(() => {
    return distributionsData.find(d => d.id === selectedId) || distributionsData[0];
  }, [selectedId]);

  const mainContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard distributions={distributionsData} setCurrentPage={setCurrentPage} setSelectedId={setSelectedId} />;
      case 'models':
        return <ContentDisplay distribution={selectedDistribution} distributions={distributionsData} setSelectedId={setSelectedId} />;
      case 'copilot':
        return <StatisticalCopilot />;
      case 'designer':
        return <AiDesigner />;
      case 'article':
        return <IntelligentArticle distribution={selectedDistribution} distributions={distributionsData} setCurrentPage={setCurrentPage} setSelectedId={setSelectedId} />;
      case 'paths':
        return <LearningPaths setCurrentPage={setCurrentPage} setSelectedId={setSelectedId} />;
      case 'plan':
        return <LearningPlan />;
      case 'guide':
        return <DecisionGuide distributions={distributionsData} learningPaths={learningPathData} setCurrentPage={setCurrentPage} setSelectedId={setSelectedId} />;
      default:
        return <Dashboard distributions={distributionsData} setCurrentPage={setCurrentPage} setSelectedId={setSelectedId} />;
    }
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
            <main>
              {mainContent()}
            </main>
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