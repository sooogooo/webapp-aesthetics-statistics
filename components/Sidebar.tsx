import React, { useState, useMemo } from 'react';
import type { Distribution, Page } from '../types';

interface SidebarProps {
  distributions: Distribution[];
  selectedId: number;
  setSelectedId: (id: number) => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  setCurrentPage: (page: Page) => void;
  currentPage: Page;
}

const groupTitles: { [key: number]: string } = {
  1: '商业基础',
  2: '进阶决策模型',
  3: '高级与专业模型',
  4: '人工智能与统计学',
  5: '战略框架与元模型',
  6: '综合应用案例',
  7: '决策工具箱',
};

const Sidebar: React.FC<SidebarProps> = ({ distributions, selectedId, setSelectedId, isOpen, setIsOpen, setCurrentPage, currentPage }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDistributions = useMemo(() => {
    const trimmedSearchTerm = searchTerm.trim();
    if (!trimmedSearchTerm) return distributions;

    const lowercasedTerm = trimmedSearchTerm.toLowerCase();

    return distributions.filter(dist => 
      dist.name.toLowerCase().includes(lowercasedTerm) ||
      dist.id.toString().includes(trimmedSearchTerm) ||
      dist.title.toLowerCase().includes(lowercasedTerm) ||
      dist.description.toLowerCase().includes(lowercasedTerm) ||
      dist.takeaway.toLowerCase().includes(lowercasedTerm) ||
      dist.application.some(app => app.toLowerCase().includes(lowercasedTerm))
    );
  }, [distributions, searchTerm]);

  // FIX: Explicitly convert numeric group to string for object key to avoid potential type issues.
  const groupedDistributions = filteredDistributions.reduce<Record<string, Distribution[]>>((acc, dist) => {
    const group = dist.group.toString();
    if (!acc[group]) acc[group] = [];
    acc[group].push(dist);
    return acc;
  }, {});

  const handleSelectDistribution = (id: number) => {
    setSelectedId(id);
    setCurrentPage('models'); // Always switch to model view on selection
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const handleSelectPage = (page: Page) => {
    setCurrentPage(page);
    if (window.innerWidth < 768) {
      setIsOpen(false);
    }
  };

  const NavItem: React.FC<{page: Page, icon: string, children: React.ReactNode}> = ({page, icon, children}) => {
    const isActive = currentPage === page;
    return (
      <li>
        <button
          onClick={() => handleSelectPage(page)}
          className={`w-full flex items-center space-x-3 px-2 py-2 rounded-md text-sm font-medium transition-colors ${
            isActive
              ? 'bg-[color:rgb(var(--color-primary)/0.1)] text-[color:rgb(var(--color-primary))]'
              : 'text-[color:var(--color-text-base)] hover:bg-[color:var(--color-bg-muted)]'
          }`}
        >
          <span className="material-symbols-outlined text-lg">{icon}</span>
          <span>{children}</span>
        </button>
      </li>
    )
  }

  const sidebarContent = (
    <>
       <div className="p-4 border-b border-[color:var(--color-border)]">
        <div className="flex items-center space-x-2">
          <img src="https://docs.bccsw.cn/logo.png" alt="Logo" className="h-8 w-8 object-contain"/>
          <div>
            <h1 className="text-base font-bold text-[color:var(--color-text-base)]">统计学应用指南</h1>
            <p className="text-xs text-[color:var(--color-text-muted)]">医美行业版</p>
          </div>
        </div>
      </div>

      <nav className="px-4 py-3 border-b border-[color:var(--color-border)]">
        <ul className="space-y-1">
          <NavItem page="dashboard" icon="dashboard">决策仪表盘</NavItem>
          <NavItem page="models" icon="dataset">数据模型</NavItem>
          <NavItem page="copilot" icon="query_stats">智能统计</NavItem>
          <NavItem page="paths" icon="school">学习路径</NavItem>
          <NavItem page="plan" icon="checklist">我的学习计划</NavItem>
          <NavItem page="guide" icon="lightbulb">决策参谋</NavItem>
          <NavItem page="designer" icon="palette">AI 设计室</NavItem>
          <NavItem page="article" icon="article">专题文章</NavItem>
        </ul>
      </nav>

      <div className="p-4">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[color:var(--color-text-muted)] text-lg">search</span>
          <input
            type="text"
            placeholder="在模型中搜索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[color:var(--color-bg-muted)] border border-[color:var(--color-border)] rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
          />
        </div>
      </div>
      <nav className="flex-1 px-4 pb-4 overflow-y-auto">
        {Object.keys(groupedDistributions).length > 0 ? (
          <ul>
            {(Object.entries(groupedDistributions) as [string, Distribution[]][]).sort(([a], [b]) => parseInt(a) - parseInt(b)).map(([group, dists]) => (
              <li key={group} className="mb-4">
                <h2 className="text-xs font-semibold text-[color:var(--color-text-muted)] uppercase tracking-wider mb-2 px-2">
                  {groupTitles[parseInt(group, 10)]}
                </h2>
                <ul>
                  {dists.map((dist) => (
                    <li key={dist.id}>
                      <button
                        onClick={() => handleSelectDistribution(dist.id)}
                        className={`w-full text-left px-2 py-1.5 rounded-md text-sm transition-all duration-200 flex items-center space-x-2 ${
                          selectedId === dist.id && currentPage === 'models'
                            ? 'bg-[color:rgb(var(--color-primary)/0.1)] text-[color:rgb(var(--color-primary))] font-medium'
                            : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-muted)]'
                        }`}
                      >
                        <span className="opacity-60 text-xs w-5 text-center">{dist.id}</span>
                        <span>{dist.name}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center p-4 text-sm text-[color:var(--color-text-muted)]">
            <p>未找到匹配的模型。</p>
          </div>
        )}
      </nav>
    </>
  );

  return (
    <>
       {isOpen && <div onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/90 backdrop-blur-sm z-30 md:hidden transition-opacity" />}
      <aside className={`fixed top-0 left-0 w-72 h-full bg-white border-r border-[color:var(--color-border)] flex flex-col transition-transform duration-300 ease-in-out z-40 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {sidebarContent}
      </aside>
    </>
  );
};

export default Sidebar;