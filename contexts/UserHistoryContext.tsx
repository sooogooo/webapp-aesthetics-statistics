import React, { createContext, useContext, useMemo, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import type { UserHistory } from '../types';

interface UserHistoryContextType {
  history: UserHistory;
  logModelView: (modelId: number) => void;
  logPathStepCompletion: (pathId: string, stepIndex: number) => void;
  getViewedModelIds: () => Set<number>;
}

const UserHistoryContext = createContext<UserHistoryContextType | undefined>(undefined);

const MAX_HISTORY_SIZE = 50; // To prevent localStorage from growing indefinitely

export const UserHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [history, setHistory] = useLocalStorage<UserHistory>('user-history', {
    viewedModelIds: [],
    completedPathSteps: {},
  });

  const logModelView = useCallback((modelId: number) => {
    setHistory(prev => {
      // Avoid duplicates and keep the most recent at the end
      const newViewed = prev.viewedModelIds.filter(id => id !== modelId);
      newViewed.push(modelId);
      // Limit history size
      if (newViewed.length > MAX_HISTORY_SIZE) {
        newViewed.shift();
      }
      return { ...prev, viewedModelIds: newViewed };
    });
  }, [setHistory]);

  const logPathStepCompletion = useCallback((pathId: string, stepIndex: number) => {
    setHistory(prev => {
      const pathSteps = new Set(prev.completedPathSteps[pathId] || []);
      pathSteps.add(stepIndex);
      return {
        ...prev,
        completedPathSteps: {
          ...prev.completedPathSteps,
          [pathId]: Array.from(pathSteps),
        },
      };
    });
  }, [setHistory]);

  const getViewedModelIds = useCallback(() => {
    return new Set(history.viewedModelIds);
  }, [history.viewedModelIds]);

  const value = useMemo(() => ({
    history,
    logModelView,
    logPathStepCompletion,
    getViewedModelIds,
  }), [history, logModelView, logPathStepCompletion, getViewedModelIds]);

  return (
    <UserHistoryContext.Provider value={value}>
      {children}
    </UserHistoryContext.Provider>
  );
};

export const useUserHistory = () => {
  const context = useContext(UserHistoryContext);
  if (context === undefined) {
    throw new Error('useUserHistory must be used within a UserHistoryProvider');
  }
  return context;
};
