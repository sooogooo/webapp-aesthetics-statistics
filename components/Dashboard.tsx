import React, { useMemo } from 'react';
import type { Distribution, Page } from '../types';
import { decisionGuideData } from '../data/decisionGuide';
import { useUserHistory } from '../contexts/UserHistoryContext';
import { learningPathData } from '../data/learningPaths';

interface DashboardProps {
  distributions: Distribution[];
  setCurrentPage: (page: Page) => void;
  setSelectedId: (id: number) => void;
}

const KPICard: React.FC<{
  icon: string;
  title: string;
  value: string;
  trend: string;
  modelId: number;
  onClick: (id: number) => void;
}> = ({ icon, title, value, trend, modelId, onClick }) => (
  <button
    onClick={() => onClick(modelId)}
    className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-[color:rgb(var(--color-primary))] transition-all duration-300 text-left w-full"
  >
    <div className="flex justify-between items-start">
      <div className="bg-[color:rgb(var(--color-primary)/0.1)] p-2 rounded-full">
        <span className="material-symbols-outlined text-xl text-[color:rgb(var(--color-primary))]">
          {icon}
        </span>
      </div>
      <span
        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${trend.startsWith('+') || trend === 'Top 1' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
      >
        {trend}
      </span>
    </div>
    <p className="text-sm text-[color:var(--color-text-muted)] mt-3">{title}</p>
    <p className="text-2xl font-bold text-[color:var(--color-text-base)]">{value}</p>
  </button>
);

export const Dashboard: React.FC<DashboardProps> = ({
  distributions,
  setCurrentPage,
  setSelectedId,
}) => {
  const { history } = useUserHistory();

  const handleNavigation = (page: Page, id?: number) => {
    if (id) setSelectedId(id);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Generate KPI data once on mount to avoid impure useMemo
  const [kpiData] = useState(() => {
    const newCustomers = 325 + Math.floor(Math.random() * 60 - 30); // 295 - 355
    const newCustTrend =
      newCustomers >= 325
        ? `+${((newCustomers / 325 - 1) * 100).toFixed(0)}%`
        : `-${((1 - newCustomers / 325) * 100).toFixed(0)}%`;

    const churnRisk = 12 + Math.floor(Math.random() * 8 - 4); // 8 - 16
    const churnTrend = churnRisk > 12 ? `+${churnRisk - 12}人` : `-${12 - churnRisk}人`;

    const clv = 85400 + Math.floor(Math.random() * 20000 - 10000); // 75400 - 95400
    const clvTrend =
      clv >= 85400
        ? `+${((clv / 85400 - 1) * 100).toFixed(1)}%`
        : `-${((1 - clv / 85400) * 100).toFixed(1)}%`;

    const topAssociation = [
      { name: '热玛吉 → 水光', id: 45 },
      { name: '玻尿酸 → 肉毒素', id: 45 },
      { name: '线雕 → 玻尿酸', id: 45 },
    ];
    const randomAssociation = topAssociation[Math.floor(Math.random() * topAssociation.length)];

    return {
      newCustomers: { value: `${newCustomers} 人`, trend: newCustTrend, modelId: 41 },
      churnRisk: { value: `${churnRisk} 人`, trend: churnTrend, modelId: 46 },
      association: { value: randomAssociation.name, trend: 'Top 1', modelId: randomAssociation.id },
      clv: { value: `¥${clv.toLocaleString()}`, trend: clvTrend, modelId: 43 },
    };
  });

  // Memoize recommended models based on user history
  const recommendedModels = useMemo(() => {
    const viewedModelIds = new Set(history.viewedModelIds);

    if (viewedModelIds.size === 0) {
      // For new users, recommend a fixed set of core models
      // Using a deterministic order to avoid impure useMemo
      const modelPool = [2, 36, 43, 44]; // Top 4 representative models
      return modelPool.map((id) => ({
        id,
        reason: '探索核心商业模型，开启您的数据驱动决策之旅。',
      }));
    }

    const recommendations = new Map<number, { id: number; reason: string }>();

    // Priority 1: Next uncompleted step in any learning path user has started
    Object.entries(history.completedPathSteps).forEach(([pathId, completedIndexes]) => {
      const path = learningPathData.find((p) => p.id === pathId);
      if (path && recommendations.size < 4) {
        for (let i = 0; i < path.steps.length; i++) {
          if (!(completedIndexes as number[]).includes(i)) {
            const nextStep = path.steps[i];
            if (!viewedModelIds.has(nextStep.modelId) && !recommendations.has(nextStep.modelId)) {
              recommendations.set(nextStep.modelId, {
                id: nextStep.modelId,
                reason: `继续您的《${path.title}》学习路径。`,
              });
              if (recommendations.size >= 4) break;
            }
          }
        }
      }
    });
    if (recommendations.size >= 4) return Array.from(recommendations.values());

    // Priority 2: Related models from the last viewed models
    const recentlyViewed = [...history.viewedModelIds].reverse();
    for (const viewedId of recentlyViewed) {
      if (recommendations.size >= 4) break;
      const lastViewedModel = distributions.find((d) => d.id === viewedId);
      if (lastViewedModel?.relatedModels) {
        for (const related of lastViewedModel.relatedModels) {
          if (!viewedModelIds.has(related.id) && !recommendations.has(related.id)) {
            recommendations.set(related.id, {
              id: related.id,
              reason: `因为您学习了“${lastViewedModel.name}”，推荐学习其关联模型。`,
            });
            if (recommendations.size >= 4) break;
          }
        }
      }
    }

    // Priority 3: Fill with other popular models not yet viewed
    const popularModels = [1, 3, 6, 45, 41, 38, 39, 40, 50, 51];
    for (const modelId of popularModels) {
      if (recommendations.size >= 4) break;
      if (!viewedModelIds.has(modelId) && !recommendations.has(modelId)) {
        recommendations.set(modelId, {
          id: modelId,
          reason: '探索我们最受欢迎的核心商业分析模型。',
        });
      }
    }

    // Final fallback: just add any un-viewed model
    if (recommendations.size < 4) {
      for (const model of distributions) {
        if (recommendations.size >= 4) break;
        if (!viewedModelIds.has(model.id) && !recommendations.has(model.id)) {
          recommendations.set(model.id, {
            id: model.id,
            reason: '拓宽您的知识面，探索新的统计模型。',
          });
        }
      }
    }

    return Array.from(recommendations.values());
  }, [history, distributions]);

  const decisionGuideSnippet = useMemo(() => {
    return decisionGuideData[0].problems[
      Math.floor(Math.random() * decisionGuideData[0].problems.length)
    ];
  }, []);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-text-base)] tracking-tight">
          决策仪表盘
        </h1>
        <p className="text-lg text-[color:var(--color-text-muted)] mt-2">
          欢迎回来！这是您的医美业务数据洞察中心。
        </p>
      </header>

      <section>
        <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-4">
          核心业务指标 (模拟)
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard
            icon="group_add"
            title="本月新客"
            {...kpiData.newCustomers}
            onClick={(id) => handleNavigation('models', id)}
          />
          <KPICard
            icon="trending_down"
            title="高价值流失风险"
            {...kpiData.churnRisk}
            onClick={(id) => handleNavigation('models', id)}
          />
          <KPICard
            icon="shopping_basket"
            title="Top 1 项目关联"
            {...kpiData.association}
            onClick={(id) => handleNavigation('models', id)}
          />
          <KPICard
            icon="payments"
            title="预测客户终身价值"
            {...kpiData.clv}
            onClick={(id) => handleNavigation('models', id)}
          />
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-4">
          {history.viewedModelIds.length > 0 ? '继续学习' : 'AI 智能推荐模型'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendedModels.map((rec) => {
            const model = distributions.find((d) => d.id === rec.id);
            if (!model) return null;
            return (
              <button
                key={model.id}
                onClick={() => handleNavigation('models', model.id)}
                className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 hover:shadow-lg hover:border-[color:rgb(var(--color-primary))] transition-all duration-300 text-left w-full h-full flex flex-col justify-between"
              >
                <div>
                  <p className="font-bold text-[color:rgb(var(--color-primary))]">{model.name}</p>
                  <p className="text-sm text-[color:var(--color-text-muted)] mt-1">{model.title}</p>
                </div>
                <div className="mt-3 pt-3 border-t border-slate-200/60">
                  <p className="text-xs text-slate-500 italic">“{rec.reason}”</p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <section className="lg:col-span-2">
          <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-4">快速开始</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleNavigation('paths')}
              className="group p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-left hover:bg-[color:rgb(var(--color-primary)/0.05)] transition"
            >
              <span className="material-symbols-outlined text-3xl text-[color:rgb(var(--color-primary))]">
                school
              </span>
              <h3 className="font-bold mt-2 text-lg">学习路径</h3>
              <p className="text-sm text-slate-500 mt-1">
                从您的角色出发，系统化学习解决实际问题的模型组合。
              </p>
            </button>
            <button
              onClick={() => handleNavigation('guide')}
              className="group p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-left hover:bg-[color:rgb(var(--color-primary)/0.05)] transition"
            >
              <span className="material-symbols-outlined text-3xl text-[color:rgb(var(--color-primary))]">
                lightbulb
              </span>
              <h3 className="font-bold mt-2 text-lg">决策参谋</h3>
              <p className="text-sm text-slate-500 mt-1">
                输入您的业务挑战，让AI为您匹配最合适的解决方案。
              </p>
            </button>
            <button
              onClick={() => handleNavigation('designer')}
              className="group p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-left hover:bg-[color:rgb(var(--color-primary)/0.05)] transition"
            >
              <span className="material-symbols-outlined text-3xl text-[color:rgb(var(--color-primary))]">
                palette
              </span>
              <h3 className="font-bold mt-2 text-lg">AI 设计室</h3>
              <p className="text-sm text-slate-500 mt-1">
                生成符合医美美学的高质量营销图片和设计素材。
              </p>
            </button>
            <button
              onClick={() => handleNavigation('copilot')}
              className="group p-4 bg-white rounded-xl shadow-sm border border-slate-200 text-left hover:bg-[color:rgb(var(--color-primary)/0.05)] transition"
            >
              <span className="material-symbols-outlined text-3xl text-[color:rgb(var(--color-primary))]">
                query_stats
              </span>
              <h3 className="font-bold mt-2 text-lg">智能统计</h3>
              <p className="text-sm text-slate-500 mt-1">
                上传您的业务数据，与AI对话，获得定制化的数据分析。
              </p>
            </button>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-4">
            决策导航精选
          </h2>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 h-full">
            <p className="text-sm font-semibold text-slate-500">业务问题:</p>
            <p className="font-bold text-lg my-2">{decisionGuideSnippet.question}</p>
            <p className="text-sm text-slate-600 mb-4">{decisionGuideSnippet.explanation}</p>
            <div className="flex flex-wrap gap-2">
              {decisionGuideSnippet.tools.map((tool) => (
                <button
                  key={tool.id}
                  onClick={() => handleNavigation('models', tool.id)}
                  className="px-2.5 py-1 bg-[color:rgb(var(--color-primary)/0.1)] text-[color:rgb(var(--color-primary))] text-xs font-semibold rounded-full hover:bg-[color:rgb(var(--color-primary)/0.2)] transition"
                >
                  {tool.name}
                </button>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};
