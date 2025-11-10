import React from 'react';
import type { Page } from '../types';

interface FooterProps {
  currentPage: Page;
  setCurrentPage: (page: Page) => void;
}

const Footer: React.FC<FooterProps> = ({ currentPage, setCurrentPage }) => {
  const navItemClass = (page: Page) =>
    `flex flex-col items-center justify-center space-y-1 w-full transition-colors duration-200 ${
      currentPage === page
        ? 'text-[color:rgb(var(--color-primary))] font-bold'
        : 'text-[color:var(--color-text-muted)] hover:text-[color:var(--color-text-base)] font-medium'
    }`;

  return (
    <>
      <footer className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-[color:var(--color-border)] grid grid-cols-5 md:hidden items-center justify-around z-20 shadow-[0_-2px_5px_-1px_rgba(0,0,0,0.05)]">
        <button onClick={() => setCurrentPage('dashboard')} className={navItemClass('dashboard')}>
          <span className="material-symbols-outlined">dashboard</span>
          <span className="text-xs">仪表盘</span>
        </button>
        <button onClick={() => setCurrentPage('models')} className={navItemClass('models')}>
          <span className="material-symbols-outlined">dataset</span>
          <span className="text-xs">数据模型</span>
        </button>
        <button onClick={() => setCurrentPage('copilot')} className={navItemClass('copilot')}>
          <span className="material-symbols-outlined">query_stats</span>
          <span className="text-xs">智能统计</span>
        </button>
        <button onClick={() => setCurrentPage('paths')} className={navItemClass('paths')}>
          <span className="material-symbols-outlined">school</span>
          <span className="text-xs">学习路径</span>
        </button>
        <button onClick={() => setCurrentPage('guide')} className={navItemClass('guide')}>
          <span className="material-symbols-outlined">lightbulb</span>
          <span className="text-xs">决策参谋</span>
        </button>
      </footer>
      <div className="text-center text-xs text-[color:var(--color-text-muted)] opacity-60 py-4 px-4 mt-0 md:mt-8 mb-16 md:mb-0 space-y-1">
        <p>公司：重庆联合丽格科技有限公司 | 地址：重庆市渝中区临江支路28号</p>
        <p>电子邮件：yuxiaodong@beaucare.org | 联系电话：023-63326559</p>
        <a
          href="https://beian.miit.gov.cn/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-[color:rgb(var(--color-primary))]"
        >
          渝 ICP 备 2024023473 号
        </a>
        <div className="flex justify-center pt-2">
          <img
            src="https://docs.bccsw.cn/logo.png"
            alt="系统Logo"
            className="h-12 w-auto object-contain"
          />
        </div>
      </div>
    </>
  );
};

export default Footer;
