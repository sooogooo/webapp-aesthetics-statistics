import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from '@google/genai';
import { useLoading } from '../contexts/LoadingContext';

interface PlanCategory {
    id: 'standard' | 'quick' | 'advanced';
    title: string;
    description: string;
    icon: string;
    duration: string;
    prompt: string;
}

const planCategories: PlanCategory[] = [
    {
        id: 'standard',
        title: '标准科班版',
        description: '适合希望系统、全面地建立统计学知识体系的用户。从基础到应用，稳扎稳打。',
        icon: 'school',
        duration: '建议周期：8周',
        prompt: `You are a university professor specializing in statistics and data science, designing a curriculum for medical aesthetics professionals. Create a comprehensive, structured, 8-week "Standard Academic" learning plan. The goal is to build a solid, foundational understanding of statistics and its application in the medical aesthetics industry. **Plan Requirements:** 1. **Structure:** Organize by week (Week 1, ... Week 8). 2. **Weekly Theme:** Each week must have a clear theme, progressing logically from fundamentals to more complex topics. 3. **Daily Tasks:** Provide 3-4 specific, actionable daily tasks for each week. 4. **In-App Actions:** Explicitly guide the user to use this application's features, such as "Read the introduction for the 'Normal Distribution' model," "Explore the interactive chart for 'Poisson Distribution'," "Ask the AI assistant: 'What's the difference between t-distribution and normal distribution?'". 5. **Theory and Practice:** Balance theoretical learning with practical application exercises (e.g., "Think about how Pareto distribution applies to your clinic's customer base"). 6. **Tone:** Professional, academic, and encouraging. Start with a welcoming message explaining the value of a systematic approach. 7. **Format:** Use Markdown for clear formatting.`,
    },
    {
        id: 'quick',
        title: '速成通俗版',
        description: '适合希望快速掌握最核心、最实用的数据模型，以立即解决业务问题的管理者或运营人员。',
        icon: 'rocket_launch',
        duration: '建议周期：2周',
        prompt: `You are a pragmatic business consultant and data coach for the medical aesthetics industry. Your client wants to quickly grasp the most impactful data concepts to improve their business immediately. Create a high-impact, easy-to-understand, 2-week "Quick & Popular" learning plan. The focus is entirely on practical application and immediate business value. **Plan Requirements:** 1. **Structure:** Organize by day (Day 1, ... Day 14). Focus on one key business problem each day. 2. **Problem-Oriented:** Frame each day's task around a real-world business question (e.g., "Day 1: Who are my most valuable customers?"). 3. **80/20 Focus:** Prioritize models with the highest ROI, such as Pareto, RFM, A/B testing, and basic regression. 4. **In-App Actions:** Guide the user to the most relevant models and tools in the application for each problem. 5. **Actionable Takeaways:** Each day must end with a clear, actionable "Takeaway" that the user can apply to their work immediately. 6. **Tone:** Energetic, direct, and results-oriented. Use simple analogies and avoid jargon. Start with a motivational message about making an immediate impact. 7. **Format:** Use Markdown for clear formatting.`,
    },
    {
        id: 'advanced',
        title: '高级进阶版',
        description: '适合已有一定统计基础，希望深入学习机器学习、AI赋能等前沿数据科学应用的用户。',
        icon: 'neurology',
        duration: '建议周期：6周',
        prompt: `You are a senior data scientist and AI strategist from a top tech company, mentoring an experienced professional in the medical aesthetics industry who wants to leverage advanced analytics and AI. Create a challenging, forward-looking, 6-week "Advanced" learning plan. The user is assumed to have a basic understanding of statistics. The goal is to master machine learning and advanced modeling techniques for a competitive edge. **Plan Requirements:** 1. **Structure:** Organize by week (Week 1, ... Week 6). 2. **Thematic Modules:** Each week should be a module focusing on an advanced topic (e.g., "Week 1: Predictive Modeling", "Week 2: Customer Segmentation & Personalization", "Week 3: Optimizing Marketing ROI"). 3. **Advanced Topics:** Cover models like Logistic Regression, Random Forest, K-Means, Survival Analysis, Uplift Modeling, and Cox Proportional Hazards. 4. **In-App Actions:** Guide the user to the corresponding advanced models within the application. Encourage them to use the "Statistical Copilot" for complex queries. 5. **Strategic Thinking:** Prompt the user to think about how to build data infrastructure, what data to collect, and how to integrate these models into strategic decision-making. 6. **Tone:** Professional, insightful, and challenging. Acknowledge the user's existing knowledge and guide them toward a higher level of expertise. 7. **Format:** Use Markdown for clear formatting.`,
    }
];

const LearningPlan: React.FC = () => {
    const [stage, setStage] = useState<'selection' | 'plan'>('selection');
    const [selectedCategory, setSelectedCategory] = useState<PlanCategory | null>(null);
    const [generatedPlan, setGeneratedPlan] = useState<string>('');
    const { startLoading, stopLoading, isLoading } = useLoading();

    const generatePlan = async (category: PlanCategory) => {
        setSelectedCategory(category);
        setGeneratedPlan('');
        setStage('plan');
        startLoading();
        try {
            const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-pro',
                contents: category.prompt,
            });
            setGeneratedPlan(response.text);
        } catch (error) {
            console.error("Plan generation failed:", error);
            setGeneratedPlan("# 生成失败\n\n抱歉，生成您的学习计划时遇到问题。请稍后重试。");
        } finally {
            stopLoading();
        }
    };

    const renderContent = () => {
        if (stage === 'plan') {
            return (
                <div className="p-4 sm:p-6 md:p-8 max-w-4xl mx-auto w-full">
                    <button onClick={() => setStage('selection')} className="flex items-center space-x-1 text-sm text-slate-500 hover:text-[color:rgb(var(--color-primary))] mb-4">
                        <span className="material-symbols-outlined">arrow_back</span>
                        <span>返回并选择其他计划</span>
                    </button>
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-slate-200">
                        {isLoading && (
                            <div className="text-center p-10">
                                <div className="w-8 h-8 border-4 border-[color:rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto"></div>
                                <p className="mt-4 font-semibold text-[color:var(--color-text-base)]">AI 正在为您定制学习计划...</p>
                                <p className="text-sm text-[color:var(--color-text-muted)]">请稍候，这通常需要10-20秒。</p>
                            </div>
                        )}
                        {generatedPlan && (
                            <article className="prose max-w-full">
                                <ReactMarkdown>{generatedPlan}</ReactMarkdown>
                            </article>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="p-4 sm:p-6 md:p-8">
                <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-text-base)] tracking-tight">定制您的专属学习计划</h1>
                    <p className="text-lg text-[color:var(--color-text-muted)] mt-4">请根据您的学习目标和基础，选择一个最适合您的学习计划类型。AI将为您生成一份个性化的学习蓝图。</p>
                </div>
                <div className="mt-10 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
                    {planCategories.map(category => (
                        <div key={category.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col hover:shadow-xl hover:border-[color:rgb(var(--color-primary)/0.5)] transition-all duration-300 transform hover:-translate-y-1">
                            <div className="flex items-center space-x-3 mb-3">
                                <span className="material-symbols-outlined text-2xl p-3 bg-[color:var(--color-bg-muted)] rounded-full text-[color:rgb(var(--color-primary))]">{category.icon}</span>
                                <h2 className="font-bold text-xl text-[color:var(--color-text-base)]">{category.title}</h2>
                            </div>
                            <p className="text-sm text-[color:var(--color-text-muted)] flex-grow">{category.description}</p>
                            <p className="text-xs font-semibold text-[color:var(--color-text-muted)] mt-4 mb-4">{category.duration}</p>
                            <button onClick={() => generatePlan(category)} className="w-full py-2.5 bg-[color:rgb(var(--color-primary))] text-white font-semibold rounded-lg hover:opacity-90 transition">
                                生成学习计划
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        );
    };
    
    return (
        <div className="animate-fade-in-up">
            {renderContent()}
        </div>
    );
};

export default LearningPlan;
