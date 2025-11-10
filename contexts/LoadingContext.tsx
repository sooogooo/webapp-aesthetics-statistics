import React, { createContext, useContext, useState, useMemo, useCallback } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  startLoading: () => void;
  stopLoading: () => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loadingCount, setLoadingCount] = useState(0);

  const startLoading = useCallback(() => {
    setLoadingCount(prevCount => prevCount + 1);
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingCount(prevCount => Math.max(0, prevCount - 1));
  }, []);

  const value = useMemo(() => ({
    isLoading: loadingCount > 0,
    startLoading,
    stopLoading,
  }), [loadingCount, startLoading, stopLoading]);

  return (
    <LoadingContext.Provider value={value}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = () => {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
};
