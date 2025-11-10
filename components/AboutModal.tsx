import React from 'react';

interface AboutModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, setIsOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in-up" onClick={() => setIsOpen(false)}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">关于本应用</h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-6 prose prose-sm max-h-[70vh] overflow-y-auto">
            <h4>欢迎使用“医美统计学应用指南”！</h4>
            <p>本应用旨在成为您口袋里的数据科学顾问，将复杂的统计学模型转化为医美行业可落地、可执行的商业洞察。</p>
            
            <h4>核心功能：</h4>
            <ul>
                <li><strong>交互式模型库：</strong> 探索超过40种统计模型，每种都配有“费曼式”解释、动态图表和医美行业专属应用案例。</li>
                <li><strong>AI 助教：</strong> 随时随地与AI对话，深入理解任何您感兴趣的概念。</li>
                <li><strong>AI 设计室：</strong> 输入您的创意，让AI为您生成符合医美美学的宣传图片或设计素材。</li>
                <li><strong>划词AI：</strong> 在浏览时选中任意文字，即可获得即时解释、总结或润色，学习无障碍。</li>
                <li><strong>高度个性化：</strong> 在“设置”中，您可以随心切换主题、调整字号，甚至定制AI的沟通风格，打造专属您的学习环境。</li>
            </ul>

            <h4>如何使用？</h4>
            <p><strong>对于初学者：</strong> 跟随首页的“新用户导航”，从一个经典案例或一个业务问题开始探索。</p>
            <p><strong>对于管理者：</strong> 利用“决策导航”和“战略框架”模块，为您的商业决策寻找数据支持。</p>
            <p><strong>对于市场/运营人员：</strong> 深入“AI赋能模型”，学习如何通过预测模型提升营销ROI和客户生命周期价值。</p>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;
