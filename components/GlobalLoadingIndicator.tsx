import React from 'react';
import { useLoading } from '../contexts/LoadingContext';

const GlobalLoadingIndicator: React.FC = () => {
  const { isLoading } = useLoading();

  if (!isLoading) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 right-0 h-1 z-[9999] overflow-hidden bg-[color:rgb(var(--color-primary)/0.2)]">
      <div className="absolute top-0 left-0 h-full w-full animate-loading-bar bg-[color:rgb(var(--color-primary))]"></div>
    </div>
  );
};

export default GlobalLoadingIndicator;
