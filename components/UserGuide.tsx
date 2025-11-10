import React, { useState } from 'react';

interface UserGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const steps = [
  {
    icon: 'waving_hand',
    title: '欢迎来到医美统计学应用指南！',
    content: '让我们花一分钟时间，快速了解如何使用这个强大的工具来赋能您的业务决策。',
  },
  {
    icon: 'explore',
    title: '在知识的海洋中航行',
    content:
      '使用左侧的侧边栏（在手机上点击左上角菜单按钮展开），可以轻松切换到不同功能区，如【决策仪表盘】、【数据模型】和【学习路径】。',
  },
  {
    icon: 'analytics',
    title: '探索交互式模型',
    content:
      '应用的核心在于【数据模型】。在这里，您可以深入了解每一种统计模型，查看它们在医美行业的具体应用，并与动态图表进行交互。',
  },
  {
    icon: 'psychology',
    title: '您的专属AI助教',
    content:
      '有任何疑问吗？随时点击右下角的AI图标，向您的专属助教提问。您甚至可以在浏览时划词，让AI即时解释！',
  },
  {
    icon: 'palette',
    title: '打造您的专属空间',
    content:
      '点击右上角的【设置】图标，您可以更换应用的主题颜色、调整字号，甚至定制AI的沟通风格。现在，开始您的探索之旅吧！',
  },
];

const UserGuide: React.FC<UserGuideProps> = ({ isOpen, onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);

  if (!isOpen) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] animate-fade-in-up">
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-md m-4 transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-[color:rgb(var(--color-primary)/0.1)] mb-4">
            <span className="material-symbols-outlined text-4xl text-[color:rgb(var(--color-primary))]">
              {step.icon}
            </span>
          </div>
          <h3 className="text-xl font-bold text-[color:var(--color-text-base)]">{step.title}</h3>
          <p className="mt-2 text-md text-[color:var(--color-text-muted)]">{step.content}</p>
        </div>

        <div className="p-4 flex flex-col space-y-2">
          <div className="flex justify-center space-x-2 mb-2">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentStep ? 'bg-[color:rgb(var(--color-primary))]' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="w-full px-4 py-2.5 bg-[color:var(--color-bg-muted)] text-[color:var(--color-text-muted)] text-sm font-semibold rounded-lg hover:bg-[color:var(--color-border)] transition"
              >
                上一步
              </button>
            )}
            <button
              onClick={handleNext}
              className="w-full px-4 py-2.5 bg-[color:rgb(var(--color-primary))] text-white text-sm font-semibold rounded-lg hover:opacity-90 transition"
            >
              {currentStep === steps.length - 1 ? '完成' : '下一步'}
            </button>
          </div>
          <button
            onClick={onClose}
            className="w-full text-center py-2 text-xs text-slate-400 hover:text-slate-600"
          >
            跳过指南
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserGuide;
