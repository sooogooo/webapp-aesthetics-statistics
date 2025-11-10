import React, { useState, useMemo } from 'react';
import type { Page } from '../types';
import { useUserHistory } from '../contexts/UserHistoryContext';

interface QuickReturnProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  setSelectedId: (id: number) => void;
}

const QuickReturn: React.FC<QuickReturnProps> = ({
  currentPage,
  setCurrentPage,
  setSelectedId,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const { history } = useUserHistory();

  const lastViewedModelId = useMemo(() => {
    const { viewedModelIds } = history;
    if (viewedModelIds.length > 0) {
      // Find the last model ID that is not the currently selected one on the 'models' page
      const currentModelId =
        currentPage === 'models' ? viewedModelIds[viewedModelIds.length - 1] : -1;
      for (let i = viewedModelIds.length - 2; i >= 0; i--) {
        if (viewedModelIds[i] !== currentModelId) {
          return viewedModelIds[i];
        }
      }
      // If only one unique model has been viewed
      if (viewedModelIds.length > 0 && viewedModelIds[0] !== currentModelId) {
        return viewedModelIds[0];
      }
    }
    return null;
  }, [history.viewedModelIds, currentPage]);

  const lastViewedModel = useMemo(() => {
    if (lastViewedModelId === null) return null;
    // We need access to distributionsData to get the name, but this component doesn't have it.
    // Let's just show a generic name. A better implementation might pass distributionsData down.
    return { id: lastViewedModelId };
  }, [lastViewedModelId]);

  if (currentPage === 'dashboard') {
    return null;
  }

  const handleDashboardClick = () => {
    setCurrentPage('dashboard');
    setIsOpen(false);
  };

  const handleLastModelClick = () => {
    if (lastViewedModelId !== null) {
      setSelectedId(lastViewedModelId);
      setCurrentPage('models');
      setIsOpen(false);
    }
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />}
      <div className="fixed bottom-[8.5rem] md:bottom-24 right-6 z-50">
        <div className={`flex flex-col items-center transition-all duration-300 ease-in-out`}>
          <div
            className={`flex flex-col items-center space-y-2 mb-2 transition-all duration-300 ease-in-out ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
          >
            {lastViewedModel !== null && (
              <button
                onClick={handleLastModelClick}
                disabled={!isOpen}
                className="flex items-center space-x-2 bg-white text-[color:var(--color-text-base)] px-3 py-2 rounded-lg shadow-md hover:bg-slate-100 transition-transform transform hover:scale-105"
                title="返回上次浏览的模型"
              >
                <span className="material-symbols-outlined text-lg">visibility</span>
                <span className="text-sm font-medium">上次模型</span>
              </button>
            )}
            <button
              onClick={handleDashboardClick}
              disabled={!isOpen}
              className="flex items-center space-x-2 bg-white text-[color:var(--color-text-base)] px-3 py-2 rounded-lg shadow-md hover:bg-slate-100 transition-transform transform hover:scale-105"
              title="返回决策仪表盘"
            >
              <span className="material-symbols-outlined text-lg">dashboard</span>
              <span className="text-sm font-medium">仪表盘</span>
            </button>
          </div>
          <button
            onClick={() => setIsOpen(!isOpen)}
            className={`bg-[color:rgb(var(--color-primary))] text-white p-3 rounded-full shadow-lg hover:opacity-90 focus:outline-none transition-transform duration-300`}
            aria-label="快速返回"
          >
            <span
              className={`material-symbols-outlined text-3xl transition-transform duration-300 ${isOpen ? 'rotate-45' : 'rotate-0'}`}
            >
              add
            </span>
          </button>
        </div>
      </div>
    </>
  );
};

export default QuickReturn;
