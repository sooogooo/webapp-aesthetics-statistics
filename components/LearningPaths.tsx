import React, { useState } from 'react';
import type { Page } from '../types';
import { learningPathData } from '../data/learningPaths';
import type { Distribution } from '../types';
import { useUserHistory } from '../contexts/UserHistoryContext';

interface LearningPathsProps {
  setCurrentPage: (page: Page) => void;
  setSelectedId: (id: number) => void;
  distributions: Distribution[];
}

const LearningPaths: React.FC<LearningPathsProps> = ({
  setCurrentPage,
  setSelectedId,
  distributions,
}) => {
  const [activePathId, setActivePathId] = useState<string>(learningPathData[0].id);
  const { logPathStepCompletion } = useUserHistory();

  const handleNavigation = (modelId: number, pathId: string, stepIndex: number) => {
    logPathStepCompletion(pathId, stepIndex);
    setSelectedId(modelId);
    setCurrentPage('models');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const activePath = learningPathData.find((p) => p.id === activePathId) || learningPathData[0];

  return (
    <div className="animate-fade-in-up space-y-10">
      <header>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-text-base)] tracking-tight">
          学习路径
        </h1>
        <p className="text-lg text-[color:var(--color-text-muted)] mt-2">
          从目标出发，将零散知识串联成解决实际问题的能力。
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Path Selector */}
        <aside className="md:w-1/3 lg:w-1/4">
          <h2 className="text-lg font-bold text-[color:var(--color-text-base)] mb-4">
            选择您的角色
          </h2>
          <div className="space-y-2">
            {learningPathData.map((path) => (
              <button
                key={path.id}
                onClick={() => setActivePathId(path.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-all duration-200 ${
                  activePathId === path.id
                    ? 'bg-white shadow-md border border-[color:rgb(var(--color-primary)/0.5)]'
                    : 'bg-white/50 hover:bg-white border'
                }`}
              >
                <span className="material-symbols-outlined text-xl p-2 bg-[color:var(--color-bg-muted)] rounded-full text-[color:rgb(var(--color-primary))]">
                  {path.icon}
                </span>
                <div>
                  <p className="font-semibold text-sm text-[color:var(--color-text-base)]">
                    {path.audience}
                  </p>
                  <p className="text-xs text-[color:var(--color-text-muted)]">{path.title}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Path Details */}
        <main className="flex-1">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="text-xl font-bold text-[color:var(--color-text-base)]">
              {activePath.title}
            </h2>
            <p className="text-[color:var(--color-text-muted)] mt-1">{activePath.description}</p>
            <div className="mt-6">
              <div className="relative">
                {/* Dotted line */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-slate-200 border-l-2 border-dashed border-slate-300"></div>
                {/* Steps */}
                <div className="space-y-8">
                  {activePath.steps.map((step, index) => {
                    const model = distributions.find((d) => d.id === step.modelId);
                    return (
                      <div key={index} className="relative flex items-start space-x-4">
                        <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full bg-[color:rgb(var(--color-primary))] text-white font-bold z-10">
                          {index + 1}
                        </div>
                        <div className="flex-1 pt-1">
                          <h3 className="font-bold text-[color:var(--color-text-base)]">
                            {step.title}
                          </h3>
                          <p className="text-sm text-[color:var(--color-text-muted)] mt-1 mb-2">
                            {step.description}
                          </p>
                          {model && (
                            <button
                              onClick={() => handleNavigation(model.id, activePath.id, index)}
                              className="flex items-center space-x-1 text-sm font-medium text-[color:rgb(var(--color-primary))] hover:underline"
                            >
                              <span>学习模型: {model.name}</span>
                              <span className="material-symbols-outlined text-base">
                                arrow_forward
                              </span>
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default LearningPaths;
