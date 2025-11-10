import React from 'react';
import type { Page, Distribution } from '../types';

interface BreadcrumbsProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  selectedDistribution: Distribution;
}

const pageTitles: Record<Page, string> = {
  dashboard: '决策仪表盘',
  models: '数据模型',
  paths: '学习路径',
  article: '专题文章',
  copilot: '智能统计',
  designer: 'AI 设计室',
  plan: '我的学习计划',
  guide: '决策参谋',
};

const BreadcrumbLink: React.FC<{ onClick: () => void; children: React.ReactNode }> = ({ onClick, children }) => (
  <li>
    <div className="flex items-center">
      <button onClick={onClick} className="text-sm font-medium text-[color:var(--color-text-muted)] hover:text-[color:rgb(var(--color-primary))] transition-colors">
        {children}
      </button>
      <span className="material-symbols-outlined text-lg text-[color:var(--color-text-muted)] mx-1" aria-hidden="true">chevron_right</span>
    </div>
  </li>
);

const BreadcrumbCurrent: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <li aria-current="page">
    <div className="flex items-center">
      <span className="text-sm font-medium text-[color:var(--color-text-base)]">
        {children}
      </span>
    </div>
  </li>
);

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ currentPage, setCurrentPage, selectedDistribution }) => {
  // Hide breadcrumbs on dashboard, as it's the root
  if (currentPage === 'dashboard') {
      return null;
  }
  
  const path = () => {
    switch (currentPage) {
      case 'models':
        return [
          <BreadcrumbLink key="dashboard" onClick={() => setCurrentPage('dashboard')}>{pageTitles.dashboard}</BreadcrumbLink>,
          // Since there's no models list page, this link goes to the dashboard as the parent section.
          <BreadcrumbLink key="models" onClick={() => setCurrentPage('dashboard')}>{pageTitles.models}</BreadcrumbLink>,
          <BreadcrumbCurrent key="current">{selectedDistribution.name.split(' (')[0]}</BreadcrumbCurrent>,
        ];
      default:
        return [
          <BreadcrumbLink key="dashboard" onClick={() => setCurrentPage('dashboard')}>{pageTitles.dashboard}</BreadcrumbLink>,
          <BreadcrumbCurrent key="current">{pageTitles[currentPage]}</BreadcrumbCurrent>,
        ];
    }
  };

  return (
    <nav className="mb-4" aria-label="Breadcrumb">
      <ol className="inline-flex items-center">
        {path()}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;