import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import type { Distribution, Page } from '../types';
import { GoogleGenAI, Type } from '@google/genai';
import DistributionChart from './DistributionChart';
import { useLoading } from '../contexts/LoadingContext';
import Feedback from './Feedback';

interface AiPopupState {
  x: number;
  y: number;
  text: string;
  loading: boolean;
  action: '解释' | '总结' | '润色' | null;
  result: string | null;
}

interface IntelligentArticleProps {
  distribution: Distribution;
  distributions: Distribution[];
  setCurrentPage: (page: Page) => void;
  setSelectedId: (id: number) => void;
}

const ArticleGenerator: React.FC<{
  distributions: Distribution[];
  onGenerate: (article: string, titles: string[]) => void;
  setIsGenerating: (isGenerating: boolean) => void;
  setError: (error: string | null) => void;
  isGenerating: boolean;
}> = ({ distributions, onGenerate, setIsGenerating, setError, isGenerating }) => {
  const [topic, setTopic] = useState('如何利用AI提升客户复购率');
  const [structure, setStructure] = useState('问题-方案-效益');
  const [audience, setAudience] = useState('高层管理者');
  const [keywords, setKeywords] = useState('AI, 客户留存, 增长');

  // New granular controls
  const [authorStyle, setAuthorStyle] = useState('商业周刊');
  const [tone, setTone] = useState('专业严谨');
  const [wordCount, setWordCount] = useState('标准深度 (约1500字)');
  const [titleStyle, setTitleStyle] = useState('“如何”式');
  const [symbolStyle, setSymbolStyle] = useState('标准圆点 (•)');

  const { startLoading, stopLoading } = useLoading();

  const structureOptions = [
    '深度解析',
    '对比分析',
    '问题-方案-效益',
    '趋势预测',
    'SWOT分析',
    '案例研究',
  ];
  const audienceOptions = ['高层管理者', '市场运营团队', '行业投资者', '技术型医生', '终端消费者'];
  const authorOptions = ['鲁迅', '王小波', '刘慈欣', '商业周刊', '小红书爆款笔记'];
  const toneOptions = ['专业严谨', '轻松幽默', '循循善诱', '犀利尖锐', '富有同理心'];
  const wordCountOptions = ['短篇速读 (约800字)', '标准深度 (约1500字)', '全面详尽 (约3000字)'];
  const titleStyleOptions = ['设问式', '陈述式', '“如何”式', '列表式', '夸张对比式'];
  const symbolStyleOptions = ['标准圆点 (•)', '数字编号 (1.)', '箭头符号 (➤)', '勾选符号 (✓)'];

  const handleGenerate = async () => {
    if (!topic.trim()) {
      setError('请输入文章主题。');
      return;
    }
    setIsGenerating(true);
    setError(null);
    startLoading();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const modelNames = distributions.map((d) => d.name).join(', ');

      const prompt = `你是一位博学多才、适应性极强的世界级内容创作者和策略师，能够精准模仿各种写作风格。请根据以下详细要求，撰写一篇专业的医美行业专题文章，并提供三个备选标题。

**核心要求:**
1.  **主题**: ${topic}
2.  **目标读者**: ${audience}。请根据这个读者的知识背景和关注点，调整内容的深度、口吻和专业术语的使用。
3.  **文章框架**: ${structure}。请严格遵循此框架来组织文章内容。
4.  **作者风格**: 请模仿 **${authorStyle}** 的风格进行创作。
5.  **口吻调性**: 文章整体应呈现 **${tone}** 的感觉。
6.  **文章长度**: ${wordCount}。
7.  **标题风格**: 主标题和备选标题都应符合 **${titleStyle}** 的风格。
8.  **符号格式**: 文章中的列表请使用 **${symbolStyle.split(' ')[1]}** 这种符号。
9.  **格式**: 使用Markdown格式，包含主标题、各级分标题、列表、粗体等，以增强可读性。
10. **模型引用**: 在文章中，必须自然地引用并解释以下列表中的相关统计模型，并将模型名称用粗体（**模型名称**）标出：${modelNames}。引用要与上下文紧密结合。
11. **关键词**: ${keywords ? `请确保文章中包含以下关键词：${keywords}` : '无特定关键词要求。'}

**输出格式要求**:
你的全部回答必须是一个严格遵循以下结构的JSON对象，不要在JSON对象之外添加任何文字或markdown标记。
\`\`\`json
{
  "articleContent": "这里是完整的、使用Markdown格式的文章正文...",
  "alternativeTitles": [
    "备选标题一",
    "备选标题二",
    "备选标题三"
  ]
}
\`\`\``;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          articleContent: {
            type: Type.STRING,
            description: '完整的、使用Markdown格式的文章正文。',
          },
          alternativeTitles: {
            type: Type.ARRAY,
            description: '一个包含三个备选标题的字符串数组。',
            items: { type: Type.STRING },
          },
        },
        required: ['articleContent', 'alternativeTitles'],
      };

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });
      const parsedResult = JSON.parse(response.text);
      onGenerate(parsedResult.articleContent, parsedResult.alternativeTitles);
    } catch (error) {
      console.error('Article generation failed:', error);
      setError(
        `抱歉，文章生成失败。请检查您的输入或稍后再试。错误: ${error instanceof Error ? error.message : String(error)}`
      );
    } finally {
      setIsGenerating(false);
      stopLoading();
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 not-prose">
      <h2 className="text-xl font-bold text-[color:var(--color-text-base)]">结构化文章生成器</h2>
      <p className="text-sm text-[color:var(--color-text-muted)] mt-1 mb-4">
        输入一个主题，选择一个分析框架，AI 将为您生成一篇专业的专题文章。
      </p>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-base)] mb-1">
            文章主题
          </label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="例如：如何利用AI提升客户复购率"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-text-base)] mb-1">
              文章结构
            </label>
            <select
              value={structure}
              onChange={(e) => setStructure(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
            >
              {structureOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-text-base)] mb-1">
              目标读者
            </label>
            <select
              value={audience}
              onChange={(e) => setAudience(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
            >
              {audienceOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-text-base)] mb-1">
              作者风格
            </label>
            <select
              value={authorStyle}
              onChange={(e) => setAuthorStyle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
            >
              {authorOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-text-base)] mb-1">
              口吻调性
            </label>
            <select
              value={tone}
              onChange={(e) => setTone(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
            >
              {toneOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-text-base)] mb-1">
              文章长度
            </label>
            <select
              value={wordCount}
              onChange={(e) => setWordCount(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
            >
              {wordCountOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-text-base)] mb-1">
              标题风格
            </label>
            <select
              value={titleStyle}
              onChange={(e) => setTitleStyle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
            >
              {titleStyleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[color:var(--color-text-base)] mb-1">
              符号格式
            </label>
            <select
              value={symbolStyle}
              onChange={(e) => setSymbolStyle(e.target.value)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
            >
              {symbolStyleOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-[color:var(--color-text-base)] mb-1">
            包含关键词 (可选, 逗号分隔)
          </label>
          <input
            type="text"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            placeholder="例如：客户留存, AI, 增长"
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
          />
        </div>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full bg-[color:rgb(var(--color-primary))] text-white font-bold py-2.5 px-4 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:bg-slate-400"
        >
          {isGenerating && (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          )}
          <span>{isGenerating ? '正在生成中...' : '生成文章'}</span>
        </button>
      </div>
    </div>
  );
};

const IntelligentArticle: React.FC<IntelligentArticleProps> = ({
  distribution,
  distributions,
  setCurrentPage,
  setSelectedId,
}) => {
  const [aiPopup, setAiPopup] = useState<AiPopupState | null>(null);
  const [applicationAiResponses, setApplicationAiResponses] = useState<Record<string, string>>({});
  const [loadingAiResponseForApp, setLoadingAiResponseForApp] = useState<string | null>(null);
  const { startLoading, stopLoading } = useLoading();

  // New state for article generation
  const [generatedArticle, setGeneratedArticle] = useState<string | null>(null);
  const [alternativeTitles, setAlternativeTitles] = useState<string[] | null>(null);
  const [articleId, setArticleId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNavigateToModel = (id: number) => {
    setSelectedId(id);
    setCurrentPage('models');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleMouseUp = (event: React.MouseEvent | React.TouchEvent) => {
    if (
      event.target instanceof Element &&
      (event.target.closest('.ai-popup-container') || event.target.closest('button'))
    ) {
      return;
    }
    const selection = window.getSelection();
    if (selection && selection.toString().trim().length > 5) {
      const range = selection.getRangeAt(0);
      const rect = range.getBoundingClientRect();
      setAiPopup({
        x: rect.left + window.scrollX + rect.width / 2,
        y: rect.top + window.scrollY - 10,
        text: selection.toString(),
        loading: false,
        action: null,
        result: null,
      });
    } else {
      setAiPopup(null);
    }
  };

  const handleAiPopupAction = async (action: '解释' | '总结' | '润色', text: string) => {
    setAiPopup((prev) => (prev ? { ...prev, loading: true, action: action, result: null } : null));
    startLoading();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let prompt = '';

      switch (action) {
        case '解释':
          prompt = `在医美商业的背景下，请用通俗易懂的语言解释术语“${text}”。回答要简洁，直接给出解释。`;
          break;
        case '总结':
          prompt = `请将以下关于医美商业的段落总结为一句话，突出其核心观点："{text}"`;
          break;
        case '润色':
          prompt = `请将以下句子润色，使其在医美行业的专业语境下更书面化、更流畅："{text}"`;
          break;
      }
      prompt = prompt.replace('{text}', text);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setAiPopup((prev) => (prev ? { ...prev, loading: false, result: response.text } : null));
    } catch (error) {
      console.error('AI popup action failed:', error);
      setAiPopup((prev) =>
        prev ? { ...prev, loading: false, result: '抱歉，AI处理失败，请稍后再试。' } : null
      );
    } finally {
      stopLoading();
    }
  };

  const handleApplicationAiQuery = async (question: string, context: string) => {
    if (loadingAiResponseForApp) return;
    setLoadingAiResponseForApp(question);
    startLoading();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `我正在阅读一篇关于医美商业统计学的文章，其中一个要点是关于“${context}”。针对这个要点，文章提出了一个引导思考的问题：“${question}”。请你作为AI专家，给我一个有深度的、启发性的回答。回答要精炼。`;
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });
      setApplicationAiResponses((prev) => ({ ...prev, [question]: response.text }));
    } catch (error) {
      console.error('AI追问失败:', error);
      setApplicationAiResponses((prev) => ({
        ...prev,
        [question]: '抱歉，AI暂时无法回答，请稍后再试。',
      }));
    } finally {
      setLoadingAiResponseForApp(null);
      stopLoading();
    }
  };

  const handleQuickGenerate = async () => {
    setIsGenerating(true);
    setError(null);
    setAlternativeTitles(null);
    startLoading();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `作为一名顶级的医美行业内容专家和商业策略师，请为当前显示的统计模型“${distribution.name}”生成一篇科普文章。

**核心要求:**
1.  **主题**: 深度解析 “${distribution.name}” (${distribution.title})。
2.  **目标读者**: 高层管理者。内容应侧重于战略价值、商业洞察和投资回报率(ROI)，而非纯粹的技术细节。
3.  **文章框架**: 深度解析。文章应包含以下部分：
    *   **引言**: 用一个引人入胜的商业问题，点出该模型的重要性。
    *   **核心原理的直观解释**: 用一个生动的医美场景比喻，帮助管理者直观理解模型的核心思想。
    *   **在医美行业的具体应用场景**: 提供3-5个具体的、可落地的应用案例。
    *   **核心优势与战略价值**: 阐述该模型能为机构带来的独特竞争优势。
    *   **潜在风险与规避策略**: 指出在应用该模型时可能遇到的陷阱，并提供建议。
    *   **总结**: 总结该模型对于医美机构决策者的核心启示。
4.  **格式**: 使用Markdown格式，结构清晰，可读性强。
5.  **语言**: 专业、精炼、有说服力。`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
      });
      setArticleId(`article-${Date.now()}`);
      setGeneratedArticle(response.text);
    } catch (error) {
      console.error('Quick article generation failed:', error);
      setError('抱歉，文章生成失败。可能是网络问题或API繁忙，请稍后再试。');
    } finally {
      setIsGenerating(false);
      stopLoading();
    }
  };

  const AiFollowUpButton: React.FC<{ question: string; context: string }> = ({
    question,
    context,
  }) => (
    <div className="flex flex-col items-start mt-4 not-prose">
      <button
        onClick={() => handleApplicationAiQuery(question, context)}
        disabled={!!loadingAiResponseForApp}
        className="px-2 py-0.5 text-xs bg-sky-100 text-sky-700 rounded-full hover:bg-sky-200 transition disabled:opacity-50 flex items-center space-x-1.5"
      >
        {loadingAiResponseForApp === question ? (
          <span className="w-3 h-3 border-2 border-sky-500 border-t-transparent rounded-full animate-spin"></span>
        ) : (
          <span className="material-symbols-outlined !text-sm">psychology_alt</span>
        )}
        <span>AI追问: {question}</span>
      </button>
      {applicationAiResponses[question] && (
        <div className="mt-2 p-3 text-sm bg-sky-50 border border-sky-200 rounded-lg text-sky-800 w-full animate-fade-in-up">
          <ReactMarkdown>{applicationAiResponses[question]}</ReactMarkdown>
        </div>
      )}
    </div>
  );

  const FeaturedArticle = () => {
    const paretoDist = distributions.find((d) => d.id === 2);
    const lognormalDist = distributions.find((d) => d.id === 5);
    const rfmDist = distributions.find((d) => d.id === 36);
    const poissonDist = distributions.find((d) => d.id === 3);
    const regressionDist = distributions.find((d) => d.id === 37);

    return (
      <article className="prose max-w-full text-[color:var(--color-text-muted)] leading-relaxed space-y-8">
        <header className="not-prose mb-8">
          <p className="font-semibold text-[color:rgb(var(--color-primary))] mb-1">精选文章</p>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-text-base)] tracking-tight !mb-2">
            医美的金钱统计学：用五大模型看透你的利润
          </h1>
          <p className="text-lg text-[color:var(--color-text-muted)]">
            数据不是冰冷的数字，而是通往利润的地图。本文将带您解锁五个核心统计模型，让您看懂客户、预测收入、做出更赚钱的决策。
          </p>
        </header>

        <section>
          <h2
            onClick={() => handleNavigateToModel(2)}
            className="text-2xl font-bold text-[color:var(--color-text-base)] cursor-pointer hover:text-[color:rgb(var(--color-primary))] transition-colors duration-200"
          >
            1. 你的钱从哪里来？— 帕累托分布的启示
          </h2>
          <p>
            在任何一家医美机构，客户的价值都不是均等的。“二八定律”，即帕累托分布，告诉我们一个残酷而现实的真相：大约20%的VIP客户，贡献了机构80%的收入。这意味着，你的大部分利润，来自于一小撮高价值客户。识别并服务好这部分客户，是提升利润率的关键。你的营销预算、服务资源、甚至是院长的精力，都应该优先向他们倾斜。
          </p>
          {paretoDist && (
            <div className="not-prose my-6">
              <DistributionChart distribution={paretoDist} />
            </div>
          )}
          <AiFollowUpButton
            question="如果我的业务不符合80/20，说明了什么？"
            context="帕累托分布与客户价值"
          />
        </section>

        <section>
          <h2
            onClick={() => handleNavigateToModel(5)}
            className="text-2xl font-bold text-[color:var(--color-text-base)] cursor-pointer hover:text-[color:rgb(var(--color-primary))] transition-colors duration-200"
          >
            2. 为什么少数人的消费能力如此惊人？ — 对数正态分布的洞察
          </h2>
          <p>
            与正态分布不同，客户的消费金额往往不是对称的。大多数客户进行常规消费，但总有少数“超级VIP”一次掷千金，将整体平均值拉高。这就是对数正态分布，它揭示了收入和消费领域普遍存在的长尾效应。如果你的平均客单价是2万元，可能不是因为大部分人都消费2万，而是因为90%的人消费1万，而10%的人消费11万。理解这一点，能帮助你设计出更有层次感的产品和服务体系，既有服务大众的基础项目，也有为头部客户量身定制的高利润尊享服务。
          </p>
          {lognormalDist && (
            <div className="not-prose my-6">
              <DistributionChart distribution={lognormalDist} />
            </div>
          )}
          <AiFollowUpButton
            question="我的客单价分布不符合对数正态，更像正态分布，这代表什么商业模式？"
            context="对数正态分布与客单价"
          />
        </section>

        <section>
          <h2
            onClick={() => handleNavigateToModel(36)}
            className="text-2xl font-bold text-[color:var(--color-text-base)] cursor-pointer hover:text-[color:rgb(var(--color-primary))] transition-colors duration-200"
          >
            3. 谁是你最值得花时间的客户？ — RFM模型的精准导航
          </h2>
          <p>
            不是所有客户都值得你花同样的精力去维护。RFM模型是一个经典且强大的客户分层工具，它通过三个维度来评估客户价值：R(Recency)
            - 最近一次消费时间，F(Frequency) - 消费频率，M(Monetary) -
            消费金额。通过这三个指标，你可以快速将客户分为“重要价值客户”、“潜力客户”、“流失风险客户”等不同群体，并采取截然不同的运营策略。与其对所有客户群发同样的信息，不如为“重要挽留客户”打一通关怀电话，效果会天差-别。
          </p>
          {rfmDist && (
            <div className="not-prose my-6">
              <DistributionChart distribution={rfmDist} />
            </div>
          )}
          <AiFollowUpButton
            question="RFM模型看起来很有效，但它的缺点或局限性是什么？"
            context="RFM模型与客户分层"
          />
        </section>

        <section>
          <h2
            onClick={() => handleNavigateToModel(3)}
            className="text-2xl font-bold text-[color:var(--color-text-base)] cursor-pointer hover:text-[color:rgb(var(--color-primary))] transition-colors duration-200"
          >
            4. 客户什么时候来？— 泊松分布的预测力
          </h2>
          <p>
            “今天下午会来多少人？”这个问题，泊松分布可以给你一个科学的答案。它能预测在固定的时间段内，某个随机事件（比如客户到店、电话咨询）发生的次数。基于历史数据，你可以预测出周一到周日、上午和下午的平均客流量。这有什么用？你可以据此优化咨询师和医生的排班，避免在高峰期人手不足导致客户等待过久，或是在低谷期人力闲置造成成本浪费。
          </p>
          {poissonDist && (
            <div className="not-prose my-6">
              <DistributionChart distribution={poissonDist} />
            </div>
          )}
          <AiFollowUpButton
            question="除了到店人数，泊松分布还能预测医美行业的哪些事件？"
            context="泊松分布与运营效率"
          />
        </section>

        <section>
          <h2
            onClick={() => handleNavigateToModel(37)}
            className="text-2xl font-bold text-[color:var(--color-text-base)] cursor-pointer hover:text-[color:rgb(var(--color-primary))] transition-colors duration-200"
          >
            5. 广告费花得值吗？— 线性回归的答案
          </h2>
          <p>
            市场部每个月都申请大量的广告预算，但这些钱真的花在了刀刃上吗？线性回归可以帮你找到“广告投入”和“新客数量”之间的关系。通过分析历史数据，它可以画出一条趋势线，告诉你平均每多花一万元广告费，能带来多少新客户。这个模型虽然简单，却是衡量营销ROI（投资回报率）最基础、最直观的工具，能让你的营销决策从“拍脑袋”变成“看数据”。
          </p>
          {regressionDist && (
            <div className="not-prose my-6">
              <DistributionChart distribution={regressionDist} />
            </div>
          )}
          <AiFollowUpButton
            question="如果我的数据点很散乱，线性回归还准确吗？"
            context="线性回归与广告ROI"
          />
        </section>

        <footer className="mt-12 pt-6 border-t border-[color:var(--color-border)]">
          <h3 className="text-xl font-bold text-[color:var(--color-text-base)]">总结</h3>
          <p>
            从帕累托分布看清利润来源，用对数正态分布理解消费分层，以RFM模型精准定位客户，靠泊松分布优化运营节奏，拿线性回归评估营销回报——这五大模型，分别从“价值、结构、对象、效率、增长”五个核心维度，为医美机构的经营者提供了数据驱动的决策框架。掌握它们，就是掌握了用数据赚钱的钥匙。
          </p>
        </footer>
      </article>
    );
  };

  return (
    <div className="animate-fade-in-up" onMouseUp={handleMouseUp} onTouchEnd={handleMouseUp}>
      {aiPopup && (
        <div
          className="fixed bg-slate-800 text-white rounded-lg shadow-xl p-2 z-50 animate-fade-in-up w-64 ai-popup-container"
          style={{ top: aiPopup.y, left: aiPopup.x, transform: 'translate(-50%, -100%)' }}
        >
          {aiPopup.loading ? (
            <div className="flex items-center justify-center space-x-2 text-xs text-slate-300 p-2">
              <div className="w-3 h-3 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>
              <span>AI 正在处理...</span>
            </div>
          ) : aiPopup.result ? (
            <div className="text-xs">
              <p className="font-bold mb-1 border-b border-slate-600 pb-1 text-slate-300">
                AI {aiPopup.action}
              </p>
              <div className="max-h-40 overflow-y-auto p-1 text-slate-200 prose prose-sm prose-invert">
                <ReactMarkdown>{aiPopup.result}</ReactMarkdown>
              </div>
              <button
                onClick={() => setAiPopup(null)}
                className="absolute -top-2 -right-2 bg-slate-600 rounded-full w-5 h-5 flex items-center justify-center text-white text-xs"
              >
                ✕
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-around">
              <button
                onClick={() => handleAiPopupAction('解释', aiPopup.text)}
                className="px-2 py-1 text-xs hover:bg-slate-700 rounded"
              >
                解释
              </button>
              <button
                onClick={() => handleAiPopupAction('总结', aiPopup.text)}
                className="px-2 py-1 text-xs hover:bg-slate-700 rounded"
              >
                总结
              </button>
              <button
                onClick={() => handleAiPopupAction('润色', aiPopup.text)}
                className="px-2 py-1 text-xs hover:bg-slate-700 rounded"
              >
                润色
              </button>
            </div>
          )}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-xl font-bold text-[color:var(--color-text-base)]">AI 专题速写</h2>
            <p className="text-sm text-[color:var(--color-text-muted)] mt-1">
              为当前模型{' '}
              <strong className="text-[color:rgb(var(--color-primary))]">
                {distribution.name}
              </strong>{' '}
              生成一篇深度解析文章。
            </p>
          </div>
          <button
            onClick={handleQuickGenerate}
            disabled={isGenerating}
            className="w-full sm:w-auto bg-[color:rgb(var(--color-primary))] text-white font-bold py-2.5 px-6 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:bg-slate-400 whitespace-nowrap"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>正在生成...</span>
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">auto_stories</span>
                <span>一键生成深度解析</span>
              </>
            )}
          </button>
        </div>
      </div>

      <ArticleGenerator
        distributions={distributions}
        onGenerate={(article, titles) => {
          setGeneratedArticle(article);
          setAlternativeTitles(titles);
          setArticleId(`article-${Date.now()}`);
        }}
        setIsGenerating={setIsGenerating}
        setError={setError}
        isGenerating={isGenerating}
      />

      {isGenerating && (
        <div className="flex flex-col items-center justify-center p-8 bg-white rounded-xl shadow-sm border border-slate-200 mt-8">
          <div className="w-8 h-8 border-4 border-[color:rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-lg font-semibold text-[color:var(--color-text-base)]">
            AI 正在撰写文章...
          </p>
          <p className="text-sm text-[color:var(--color-text-muted)]">
            这可能需要一点时间，请稍候。
          </p>
        </div>
      )}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-800 not-prose mt-8">
          <p className="font-bold">生成失败</p>
          <p>{error}</p>
        </div>
      )}

      {generatedArticle && !isGenerating && !error && (
        <div className="mt-8">
          <article className="prose max-w-full text-[color:var(--color-text-muted)] leading-relaxed space-y-4 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <ReactMarkdown>{generatedArticle}</ReactMarkdown>
            {articleId && (
              <footer className="mt-6 pt-4 border-t border-slate-200 not-prose">
                <Feedback contentId={articleId} contentType="generated_article" />
              </footer>
            )}
          </article>
          {alternativeTitles && (
            <div className="mt-6 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
              <h3 className="text-md font-bold text-[color:var(--color-text-base)] mb-3">
                AI 推荐备选标题
              </h3>
              <ul className="list-disc pl-5 space-y-2">
                {alternativeTitles.map((title, index) => (
                  <li key={index} className="text-sm text-slate-700">
                    {title}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {!generatedArticle && !isGenerating && !error && <FeaturedArticle />}
    </div>
  );
};
export default IntelligentArticle;
