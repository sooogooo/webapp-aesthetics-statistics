import React, { useState } from 'react';
import SettingsModal from './SettingsModal';
import AboutModal from './AboutModal';
import type { Page } from '../types';

interface HeaderProps {
  onMenuClick: () => void;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

interface NavButtonProps {
  page: Page;
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
  icon: string;
  children: React.ReactNode;
}

const NavButton: React.FC<NavButtonProps> = ({
  page,
  currentPage,
  setCurrentPage,
  icon,
  children,
}) => (
  <button
    onClick={() => setCurrentPage(page)}
    className={`flex items-center lg:space-x-2 p-2 lg:px-3 lg:py-1.5 rounded-full text-sm font-medium transition-colors duration-200 ${
      currentPage === page
        ? 'bg-[color:rgb(var(--color-primary)/0.1)] text-[color:rgb(var(--color-primary))]'
        : 'text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-muted)]'
    }`}
  >
    <span className="material-symbols-outlined text-lg">{icon}</span>
    <span className="hidden lg:inline">{children}</span>
  </button>
);

const Header: React.FC<HeaderProps> = ({ onMenuClick, currentPage, setCurrentPage }) => {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[color:var(--color-border)] z-30 shadow-sm">
        <div className="h-full flex items-center justify-between px-4 sm:px-6 md:px-8">
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="md:hidden text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-base)] mr-2"
              aria-label="Open menu"
            >
              <span className="material-symbols-outlined">menu</span>
            </button>
            <div className="hidden md:flex items-center space-x-2 ml-72">
              <NavButton
                page="dashboard"
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                icon="dashboard"
              >
                决策仪表盘
              </NavButton>
              <NavButton
                page="models"
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                icon="dataset"
              >
                数据模型
              </NavButton>
              <NavButton
                page="copilot"
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                icon="query_stats"
              >
                智能统计
              </NavButton>
              <NavButton
                page="paths"
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                icon="school"
              >
                学习路径
              </NavButton>
              <NavButton
                page="plan"
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                icon="checklist"
              >
                我的学习计划
              </NavButton>
              <NavButton
                page="guide"
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                icon="lightbulb"
              >
                决策参谋
              </NavButton>
              <NavButton
                page="designer"
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                icon="palette"
              >
                AI 设计室
              </NavButton>
              <NavButton
                page="article"
                currentPage={currentPage}
                setCurrentPage={setCurrentPage}
                icon="article"
              >
                专题文章
              </NavButton>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="p-2 rounded-full text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-muted)] hover:text-[color:var(--color-text-base)] transition"
              aria-label="Settings"
              title="显示与AI设置"
            >
              <span className="material-symbols-outlined">settings</span>
            </button>
            <button
              onClick={() => setIsAboutOpen(true)}
              className="p-2 rounded-full text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-muted)] hover:text-[color:var(--color-text-base)] transition"
              aria-label="About"
              title="关于本应用"
            >
              <span className="material-symbols-outlined">help_outline</span>
            </button>
          </div>
        </div>
      </header>
      <SettingsModal isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
      <AboutModal isOpen={isAboutOpen} setIsOpen={setIsAboutOpen} />
    </>
  );
};

export default Header;
