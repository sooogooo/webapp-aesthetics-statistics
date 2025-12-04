
import React, { useState, useMemo, useEffect } from 'react';
import type { Distribution, Page } from '../types';
import DistributionChart from './DistributionChart';
import { deepAnalysisData } from '../data/deepAnalysis';
import { enhancedApplicationData } from '../data/enhancedApplications';
import { generateMockData, convertToCSV } from '../data/mockData';
import { useChat } from '../contexts/ChatContext';
import ReactMarkdown from 'react-markdown';
import Feedback from './Feedback';
import { GoogleGenAI, Type } from '@google/genai';
import { useLoading } from '../contexts/LoadingContext';

interface ContentDisplayProps {
  distribution: Distribution;
  distributions: Distribution[];
  setSelectedId: (id: number) => void;
}

const ContentDisplay: React.FC<ContentDisplayProps> = ({ distribution, distributions, setSelectedId }) => {
  const [activeTab, setActiveTab] = useState('application');
  const { setInitialInput, setIsChatOpen } = useChat();
  const { startLoading, stopLoading } = useLoading();
  const [aiGeneratedCases, setAiGeneratedCases] = useState<string[] | null>(null);
  const [isGeneratingCases, setIsGeneratingCases] = useState<boolean>(false);
  const [copiedText, setCopiedText] = useState('');

  useEffect(() => {
    setAiGeneratedCases(null);
    setIsGeneratingCases(false);
    setActiveTab('application');
  }, [distribution.id]);

  const handleRelatedModelClick = (id: number) => {
    setSelectedId(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const mockData = useMemo(() => generateMockData(distribution.name), [distribution.name]);

  const handleDownloadCSV = () => {
    const csv = convertToCSV(mockData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${distribution.name.split(' ')[0]}_mock_data.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleGenerateCases = async () => {
    setIsGeneratingCases(true);
    setAiGeneratedCases(null);
    startLoading();

    try {
        const ai = new GoogleGenAI({ apiKey: import.meta.env.VITE_GOOGLE_GENAI_API_KEY });
        const prompt = `你是一位顶级的医美行业商业策略顾问和数据科学家。
        
        当前的模型是“${distribution.name}”，其核心思想是“${distribution.takeaway}”。

        请基于此模型，为医美行业生成 **2个** 具体的、创新的、可操作的商业应用案例。

        要求：
        1.  每个案例都必须非常具体，包含明确的业务场景和可执行的步骤。
        2.  案例要体现出对模型的深刻理解，并能带来实际的商业价值。
        3.  语言要专业、精炼。
        4.  你的回答必须是一个严格的JSON数组，其中包含两个字符串，每个字符串就是一个案例。不要添加任何额外的解释或markdown标记。

        例如:
        [
          "案例一：利用[模型名称]...具体描述...",
          "案例二：结合[模型名称]与...具体描述..."
        ]
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-2.5-pro',
            contents: prompt,
            config: {
                responseMimeType: 'application/json',
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            }
        });

        const cases = JSON.parse(response.text);
        setAiGeneratedCases(cases);

    } catch (error) {
        console.error("Failed to generate AI cases:", error);
        setAiGeneratedCases(["抱歉，案例生成失败，请稍后再试。"]);
    } finally {
        setIsGeneratingCases(false);
        stopLoading();
    }
  };
  
  const handleAiExplain = (detailType: 'parameters' | 'formula') => {
    let prompt = '';
    if (detailType === 'parameters') {
      prompt = `请用通俗易懂的语言，结合医美行业的例子，解释一下统计模型“${distribution.name}”的核心参数“${distribution.parameters}”分别是什么意思，以及它们如何影响模型的形状和应用。`;
    } else {
      prompt = `请帮我拆解并解释一下“${distribution.name}”的数学公式“${distribution.formula}”。不需要进行复杂的数学推导，重点是让我理解公式里每个符号的含义，以及它们是如何共同作用来描述这个分布的。最好能用一个医美的例子来说明。`;
    }
    setInitialInput(prompt);
    setIsChatOpen(true);
  };
  
  const handleCopy = (text: string) => {
    const plainText = text.replace(/\*\*/g, ''); // Simple markdown removal for bold
    navigator.clipboard.writeText(plainText).then(() => {
        setCopiedText(text);
        setTimeout(() => setCopiedText(''), 2000);
    });
  };

  const deepAnalysis = deepAnalysisData[distribution.id];
  const enhancedApplications = enhancedApplicationData[distribution.id] || [];

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-text-base)] tracking-tight">{distribution.name}</h1>
        <p className="text-lg text-[color:var(--color-text-muted)] mt-2">{distribution.title}</p>
      </header>
      
      <section>
        <DistributionChart distribution={distribution} />
      </section>

      <section>
        <div className="prose max-w-full text-[color:var(--color-text-base)]">
            <ReactMarkdown>{distribution.description}</ReactMarkdown>
        </div>
      </section>
      
      {distribution.id === 1 && (
        <section>
          <div className="bg-sky-50/80 border border-sky-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
               <span className="material-symbols-outlined text-3xl text-sky-600 p-2 bg-sky-100 rounded-full">function</span>
               <div>
                  <h3 className="font-bold text-sky-800">探索核心参数: μ 和 σ</h3>
                  <p className="text-sm text-sky-700 mt-1">了解均值 (μ) 和标准差 (σ) 如何共同决定正态分布的“山峰”位置和“胖瘦”。</p>
               </div>
            </div>
            <button 
              onClick={() => handleAiExplain('parameters')} 
              className="flex-shrink-0 w-full sm:w-auto flex items-center justify-center space-x-1.5 bg-sky-600 text-white font-semibold px-4 py-2 rounded-lg hover:bg-sky-700 transition-colors"
            >
              <span className="material-symbols-outlined !text-lg">psychology</span>
              <span>让 AI 深入解释</span>
            </button>
          </div>
        </section>
      )}

      <section className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <h2 className="text-xl font-bold mb-4 text-[color:var(--color-text-base)]">核心洞察 (Takeaway)</h2>
        <div className="border-l-4 border-[color:rgb(var(--color-primary))] pl-4">
            <p className="text-md font-medium text-[color:var(--color-text-muted)] italic">{distribution.takeaway}</p>
        </div>
      </section>

      {distribution.relatedModels && distribution.relatedModels.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-4">关联模型</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {distribution.relatedModels.map(model => {
              const relatedDist = distributions.find(d => d.id === model.id);
              return (
                <button
                  key={model.id}
                  onClick={() => handleRelatedModelClick(model.id)}
                  className="w-full text-left p-4 bg-white rounded-lg shadow-sm border border-slate-200/80 transition-all duration-300 hover:shadow-md hover:border-[color:rgb(var(--color-primary)/0.5)]"
                >
                  <p className="font-bold text-[color:rgb(var(--color-primary))] hover:underline">{model.name}</p>
                  <p className="text-sm text-slate-600 mt-1">{model.reason}</p>
                  {relatedDist && <p className="text-xs text-slate-400 mt-2 line-clamp-2">{relatedDist.description}</p>}
                </button>
              );
            })}
          </div>
        </section>
      )}

      <section>
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-6" aria-label="Tabs">
            <button onClick={() => setActiveTab('application')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'application' ? 'border-[color:rgb(var(--color-primary))] text-[color:rgb(var(--color-primary))]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              应用场景
            </button>
            <button onClick={() => setActiveTab('analysis')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'analysis' ? 'border-[color:rgb(var(--color-primary))] text-[color:rgb(var(--color-primary))]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              AI 深度解读
            </button>
             <button onClick={() => setActiveTab('data')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'data' ? 'border-[color:rgb(var(--color-primary))] text-[color:rgb(var(--color-primary))]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              模拟数据
            </button>
             <button onClick={() => setActiveTab('details')} className={`whitespace-nowrap py-3 px-1 border-b-2 font-semibold text-sm ${activeTab === 'details' ? 'border-[color:rgb(var(--color-primary))] text-[color:rgb(var(--color-primary))]' : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'}`}>
              技术细节
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'application' && (
            <div className="space-y-4">
              {distribution.application.map((app, index) => {
                  const enhancedApp = enhancedApplications.find(e => e.original === app);
                  return (
                    <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-slate-200/80">
                      <p className="text-slate-700">{app}</p>
                      {enhancedApp && (
                          <div className="mt-3 pt-3 border-t border-dashed border-slate-200">
                               <p className="text-xs font-semibold text-sky-600 mb-1">AI 优化思路:</p>
                               <p className="text-sm text-sky-800 bg-sky-50/80 p-2 rounded-md">{enhancedApp.enhancement}</p>
                          </div>
                      )}
                    </div>
                  );
              })}

               <div className="mt-8 pt-6 border-t border-dashed border-slate-200">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-bold text-[color:var(--color-text-base)] flex items-center">
                            <span className="material-symbols-outlined text-xl text-[color:rgb(var(--color-primary))] align-bottom mr-2">auto_awesome</span>
                            AI 生成案例
                        </h3>
                        <button
                            onClick={handleGenerateCases}
                            disabled={isGeneratingCases}
                            className="px-3 py-1 text-sm font-semibold bg-[color:rgb(var(--color-primary))] text-white rounded-full hover:opacity-90 transition disabled:bg-slate-400 flex items-center space-x-1.5"
                        >
                            {isGeneratingCases && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                            <span>{isGeneratingCases ? '生成中...' : (aiGeneratedCases ? '重新生成' : '点击生成')}</span>
                        </button>
                    </div>

                    <div className="mt-4 space-y-4">
                        {isGeneratingCases && (
                            <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500 text-sm">
                                <p>AI 正在根据 <strong>{distribution.name}</strong> 的特点，为您构思创新的商业应用场景...</p>
                            </div>
                        )}
                        {aiGeneratedCases && aiGeneratedCases.map((caseText, index) => (
                            <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-slate-200/80 animate-fade-in-up">
                                <div className="text-sm text-indigo-800 bg-indigo-50/80 p-3 rounded-md prose prose-sm max-w-full">
                                    <ReactMarkdown>{caseText}</ReactMarkdown>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

            </div>
          )}
          {activeTab === 'analysis' && deepAnalysis && (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <div className="prose max-w-full">
                    {deepAnalysis.trim().split(/\n####\s+/).filter(s => s.trim()).map((section, index) => {
                        const [title, ...contentParts] = section.split('\n');
                        const content = contentParts.join('\n').trim();
                        const isAIFutureSection = title.includes('AI赋能展望');

                        return (
                            <div key={index} className="relative group">
                                <h4>{title}</h4>
                                <ReactMarkdown>{content}</ReactMarkdown>
                                {isAIFutureSection && (
                                    <button
                                        onClick={() => handleCopy(content)}
                                        className="absolute top-0 right-0 flex items-center space-x-1 bg-slate-100 hover:bg-slate-200 text-slate-600 px-2 py-1 rounded-full text-xs font-semibold transition-opacity opacity-0 group-hover:opacity-100 focus:opacity-100 not-prose"
                                        title="复制引用"
                                    >
                                        <span className="material-symbols-outlined !text-sm">format_quote</span>
                                        <span>{copiedText === content ? '已复制!' : '引用'}</span>
                                    </button>
                                )}
                            </div>
                        );
                    })}
                </div>
                <div className="pt-6 border-t border-slate-200 mt-6 not-prose">
                    <Feedback contentId={`deep-analysis-${distribution.id}`} contentType="deep_analysis" />
                </div>
            </div>
          )}
          {activeTab === 'analysis' && !deepAnalysis && (
            <p className="text-slate-500">此模型暂无AI深度解读。</p>
          )}
          {activeTab === 'data' && mockData.length > 0 && (
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold">模拟数据预览</h3>
                <button onClick={handleDownloadCSV} className="text-xs font-semibold text-[color:rgb(var(--color-primary))]">下载CSV</button>
              </div>
              <div className="overflow-x-auto max-h-80">
                <table className="w-full text-sm text-left">
                  <thead className="bg-slate-50">
                    <tr>
                      {Object.keys(mockData[0]).map(key => <th key={key} className="p-2 font-medium">{key}</th>)}
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {mockData.slice(0, 10).map((row, i) => (
                      <tr key={i}>
                        {Object.values(row).map((val, j) => <td key={j} className="p-2 whitespace-nowrap">{typeof val === 'number' ? val.toLocaleString() : String(val)}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'data' && mockData.length === 0 && (
            <p className="text-slate-500">此模型暂无模拟数据。</p>
          )}
          {activeTab === 'details' && (
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200/80">
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-[color:var(--color-text-base)]">核心参数</h3>
                      <button 
                          onClick={() => handleAiExplain('parameters')} 
                          className="flex items-center space-x-1 text-xs font-semibold text-[color:rgb(var(--color-primary))] hover:bg-[color:rgb(var(--color-primary)/0.1)] p-1 rounded-md transition-colors"
                          aria-label={`用 AI 解释 ${distribution.name} 的核心参数`}
                          title="用 AI 解释核心参数"
                      >
                          <span className="material-symbols-outlined !text-sm">psychology</span>
                          <span>AI 解释</span>
                      </button>
                  </div>
                  <p className="mt-2 text-md text-[color:var(--color-text-muted)]">{distribution.parameters}</p>
              </div>

              <div className="p-4 bg-white rounded-lg shadow-sm border border-slate-200/80">
                  <div className="flex justify-between items-center">
                      <h3 className="font-bold text-[color:var(--color-text-base)]">数学公式</h3>
                      <button 
                          onClick={() => handleAiExplain('formula')} 
                          className="flex items-center space-x-1 text-xs font-semibold text-[color:rgb(var(--color-primary))] hover:bg-[color:rgb(var(--color-primary)/0.1)] p-1 rounded-md transition-colors"
                          aria-label={`用 AI 解释 ${distribution.name} 的数学公式`}
                          title="用 AI 解释数学公式"
                      >
                          <span className="material-symbols-outlined !text-sm">psychology</span>
                          <span>AI 解释</span>
                      </button>
                  </div>
                  <div className="mt-2 p-3 bg-slate-50 rounded text-center overflow-x-auto">
                      <code className="text-sm text-slate-700">{distribution.formula}</code>
                  </div>
              </div>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default ContentDisplay;
