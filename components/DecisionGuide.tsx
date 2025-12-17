import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI, Type } from '@google/genai';
import type { Distribution, LearningPath, Page } from '../types';
import { useLoading } from '../contexts/LoadingContext';
import Feedback from './Feedback';
import { decisionGuideData } from '../data/decisionGuide';

interface DecisionGuideProps {
  distributions: Distribution[];
  learningPaths: LearningPath[];
  setCurrentPage: (page: Page) => void;
  setSelectedId: (id: number) => void;
}

interface AiSuggestion {
  question: string;
  keywords: string[];
}

interface AiQuestionCategory {
  category: string;
  icon: string;
  questions: string[];
}

interface RecommendedModel {
  id?: number;
  name: string;
  reason: string;
}

interface RecommendedPath {
  id?: number;
  name: string;
  reason: string;
}

interface AnalysisResult {
  problemSummary: string;
  recommendedModels: RecommendedModel[];
  recommendedPaths?: RecommendedPath[];
  nextSteps?: string[];
}

interface WindowWithSpeechRecognition {
  SpeechRecognition?: typeof SpeechRecognition;
  webkitSpeechRecognition?: typeof SpeechRecognition;
}

const LoadingSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-8">
    <div>
      <div className="h-6 bg-slate-200 rounded-md w-1/3 mb-4"></div>
      <div className="space-y-4">
        <div className="h-24 bg-slate-100 rounded-xl"></div>
        <div className="h-24 bg-slate-100 rounded-xl"></div>
      </div>
    </div>
    <div>
      <div className="h-6 bg-slate-200 rounded-md w-1/4 mb-4"></div>
      <div className="h-24 bg-slate-100 rounded-xl"></div>
    </div>
  </div>
);

const CameraModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onCapture: (base64: string) => void;
}> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices
        .getUserMedia({ video: true })
        .then((stream) => {
          streamRef.current = stream;
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch((err) => {
          console.error('Camera access error:', err);
          setError('无法访问摄像头。请检查浏览器权限。');
        });
    } else {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
      onCapture(canvas.toDataURL('image/jpeg'));
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl p-4 w-full max-w-lg m-4"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-bold mb-2">拍照上传</h3>
        {error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full rounded-md bg-slate-200 aspect-video object-cover"
          ></video>
        )}
        <canvas ref={canvasRef} className="hidden"></canvas>
        <div className="mt-4 flex justify-end space-x-2">
          <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md">
            取消
          </button>
          <button
            onClick={handleCapture}
            disabled={!!error}
            className="px-4 py-2 bg-[color:rgb(var(--color-primary))] text-white rounded-md disabled:bg-slate-400"
          >
            拍摄
          </button>
        </div>
      </div>
    </div>
  );
};

const blobToBase64 = (blob: Blob): Promise<{ mimeType: string; data: string }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const [header, data] = base64String.split(',');
      const mimeType = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
      resolve({ mimeType, data });
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

const DecisionGuide: React.FC<DecisionGuideProps> = ({
  distributions,
  learningPaths,
  setCurrentPage,
  setSelectedId,
}) => {
  const [problem, setProblem] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { startLoading, stopLoading, isLoading } = useLoading();
  const [resultId, setResultId] = useState<string | null>(null);

  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);
  const [isFetchingSuggestions, setIsFetchingSuggestions] = useState(false);

  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showCamera, setShowCamera] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  // State for the new section
  const [dsQuestions, setDsQuestions] = useState<AiQuestionCategory[]>([]);
  const [isLoadingDsQuestions, setIsLoadingDsQuestions] = useState(true);
  const [activeQuestion, setActiveQuestion] = useState<{
    category: string;
    question: string;
  } | null>(null);
  const [userContext, setUserContext] = useState('');
  const [contextFile, setContextFile] = useState<{
    base64: { mimeType: string; data: string };
    file: File;
  } | null>(null);
  const [generatedAnswer, setGeneratedAnswer] = useState<string | null>(null);
  const [isGeneratingAnswer, setIsGeneratingAnswer] = useState(false);
  const activeQuestionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activeQuestion && activeQuestionRef.current) {
      activeQuestionRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [activeQuestion]);

  const fetchDsQuestions = async () => {
    setIsLoadingDsQuestions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a senior data scientist and business strategist specializing in the medical aesthetics industry. Your task is to create a list of **specific, actionable, and representative** questions that a data scientist would ask to understand and optimize a medical aesthetics business. These questions should be **concrete and ready-to-use**, not generic templates or "fill-in-the-blank" style questions. They must reflect real-world business challenges.

Your output must be a valid JSON array of objects. Each object represents a category and must have 'category' (string, in Chinese), 'icon' (a valid Google Material Symbols Outlined icon name), and 'questions' (an array of 3-5 specific string questions, in Chinese).

Cover these key business areas: Operations & Efficiency, Marketing & Growth, Customer Relationship Management (CRM), and Strategic Planning.

**Crucially, avoid vague questions like "How to improve X?". Instead, ask targeted questions like "What is the optimal discount level for our membership renewal campaign to maximize both renewal rate and profit?".**

**Do not use placeholders like '[metric]', '[product]', or '[customer segment]'. Each question should be a complete, standalone business problem.**

Example of the required JSON output format:
[
  {
    "category": "客户关系管理 (CRM)",
    "icon": "groups",
    "questions": [
      "我们的客户可以被分为哪几个有意义的群体，各自的画像是什么？",
      "如何量化客户的忠诚度并预测其生命周期价值(CLV)？",
      "导致高价值客户流失的核心驱动因素是什么？"
    ]
  },
  {
    "category": "市场营销与增长",
    "icon": "campaign",
    "questions": [
       "我们应该如何为新上线的热玛吉项目科学定价，以实现市场份额和利润率的平衡？",
       "分析数据显示『水光针』和『M22光子嫩肤』经常被一起购买，设计一个捆绑套餐的ROI会有多高？",
       "哪个线上渠道（小红书 vs. 抖音）带来的客户，其长期留存率和终身价值更高？"
    ]
  }
]`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const questions = JSON.parse(response.text);
      setDsQuestions(questions);
    } catch (e) {
      console.error('Failed to fetch DS questions:', e);
      setDsQuestions([
        {
          category: '客户关系管理 (CRM)',
          icon: 'groups',
          questions: [
            '我们的客户可以被分为哪几个有意义的群体，各自的画像是什么？',
            '如何量化客户的忠诚度并预测其生命周期价值(CLV)？',
            '导致高价值客户流失的核心驱动因素是什么？',
          ],
        },
        {
          category: '市场营销与增长',
          icon: 'campaign',
          questions: [
            '我们应该如何为新上线的热玛吉项目科学定价，以实现市场份额和利润率的平衡？',
            '分析数据显示『水光针』和『M22光子嫩肤』经常被一起购买，设计一个捆绑套餐的ROI会有多高？',
            '哪个线上渠道（小红书 vs. 抖音）带来的客户，其长期留存率和终身价值更高？',
          ],
        },
      ]);
    } finally {
      setIsLoadingDsQuestions(false);
    }
  };

  const fetchAiSuggestions = async () => {
    setIsFetchingSuggestions(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `你是一位顶级的医美行业商业策略师。你的任务是生成发人深省的、可以用数据分析的商业问题。

请生成一个包含4个独立商业问题的JSON数组。
数组中的每个对象都应包含两个键："question"（字符串，用中文提问）和 "keywords"（一个包含2-3个简短相关关键词的字符串数组，用中文）。
- 问题应简洁，以诊所管理者或所有者可能会问的方式措辞。
- 关键词应概括问题的核心主题。
- 主题应涵盖市场营销、运营、客户关系管理和战略。

只返回JSON数组，不带任何其他文本或markdown标记。`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' },
      });

      const suggestions = JSON.parse(response.text);
      setAiSuggestions(suggestions);
    } catch (e) {
      console.error('Failed to fetch AI suggestions:', e);
      setAiSuggestions([
        { question: '我的新客转化率很低，如何提升？', keywords: ['转化率', '新客', '营销漏斗'] },
        { question: '如何为新项目科学定价？', keywords: ['定价策略', '价值感知', '竞品分析'] },
      ]);
    } finally {
      setIsFetchingSuggestions(false);
    }
  };

  useEffect(() => {
    fetchAiSuggestions();
    fetchDsQuestions();
  }, []);

  const handleAnalyze = async (promptText = problem) => {
    if (!promptText.trim()) {
      setError('请输入您的问题描述。');
      return;
    }
    startLoading();
    setError(null);
    setResult(null);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

      const modelList = distributions.map((d) => ({
        id: d.id,
        name: d.name,
        takeaway: d.takeaway,
      }));
      const pathList = learningPaths.map((p) => ({
        id: p.id,
        title: p.title,
        audience: p.audience,
        description: p.description,
      }));

      let problemDescription = `The user has described their problem in Chinese as follows: "${promptText}"`;
      if (uploadedImage) {
        problemDescription += `\nThey have also provided an image for context.`;
      }

      const prompt = `You are an expert business data strategist for the medical aesthetics industry. Analyze a user's business problem and provide a clear, actionable guide connecting it to relevant statistical models and learning paths. Your entire final response must be in Chinese.

Available models: ${JSON.stringify(modelList)}
Available learning paths: ${JSON.stringify(pathList)}
${problemDescription}

Provide a response in a structured JSON format. Your analysis must be insightful, referencing the provided models and paths by their exact IDs.
Recommend 2-3 of the MOST relevant models.
Recommend 1-2 of the MOST relevant learning paths.
Provide concrete, actionable next steps.
The entire JSON response, including all keys and values, must be in Chinese.`;

      const responseSchema = {
        type: Type.OBJECT,
        properties: {
          problemSummary: { type: Type.STRING, description: '对用户业务问题的简明总结。' },
          recommendedModels: {
            type: Type.ARRAY,
            description: '一个包含2-3个推荐统计模型的数组。',
            items: {
              type: Type.OBJECT,
              properties: {
                modelId: { type: Type.INTEGER },
                modelName: { type: Type.STRING },
                relevance: {
                  type: Type.STRING,
                  description: '解释为什么这个模型与解决用户的问题相关。',
                },
              },
              required: ['modelId', 'modelName', 'relevance'],
            },
          },
          recommendedPaths: {
            type: Type.ARRAY,
            description: '一个包含1-2个推荐学习路径的数组。',
            items: {
              type: Type.OBJECT,
              properties: {
                pathId: { type: Type.STRING },
                pathTitle: { type: Type.STRING },
                relevance: { type: Type.STRING, description: '解释为什么这个学习路径有帮助。' },
              },
              required: ['pathId', 'pathTitle', 'relevance'],
            },
          },
          nextSteps: {
            type: Type.ARRAY,
            description: '一个包含3-5个具体后续步骤的列表。',
            items: { type: Type.STRING },
          },
        },
        required: ['problemSummary', 'recommendedModels', 'nextSteps'],
      };

      const contents: {
        parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
      } = { parts: [{ text: prompt }] };
      if (uploadedImage) {
        contents.parts.unshift({
          inlineData: {
            mimeType: 'image/jpeg',
            data: uploadedImage.split(',')[1],
          },
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: contents,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });

      const resultJson = JSON.parse(response.text);
      setResult(resultJson);
      setResultId(`guide-result-${Date.now()}`);
    } catch (e) {
      console.error('Decision Guide analysis failed:', e);
      setError(
        `分析失败。请尝试调整您的问题描述或稍后再试。(${e instanceof Error ? e.message : String(e)})`
      );
      setResult(null);
    } finally {
      stopLoading();
    }
  };

  const handleNavigation = (page: Page, id?: number | string) => {
    if (typeof id === 'number') setSelectedId(id);
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
    isDsContext: boolean
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      if (isDsContext) {
        const base64 = await blobToBase64(file);
        setContextFile({ base64, file });
      } else {
        const reader = new FileReader();
        reader.onloadend = () => setUploadedImage(reader.result as string);
        reader.readAsDataURL(file);
      }
    }
  };

  const handleImageCapture = (imageBase64: string, isDsContext: boolean) => {
    if (isDsContext) {
      setContextFile({
        base64: { mimeType: 'image/jpeg', data: imageBase64.split(',')[1] },
        file: new File([], 'capture.jpg', { type: 'image/jpeg' }),
      });
    } else {
      setUploadedImage(imageBase64);
    }
    setShowCamera(false);
  };

  const handleMicClick = () => {
    if (isRecording) {
      recognitionRef.current?.stop();
      return;
    }
    const SpeechRecognition =
      (window as WindowWithSpeechRecognition).SpeechRecognition ||
      (window as WindowWithSpeechRecognition).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('抱歉，您的浏览器不支持语音识别。');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      console.error('Speech recognition error', event.error);
      setIsRecording(false);
    };
    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = event.results[0][0].transcript;
      setProblem((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };
    recognition.start();
    recognitionRef.current = recognition;
  };

  const handleQuestionClick = (category: string, question: string) => {
    if (activeQuestion?.question === question) {
      setActiveQuestion(null);
    } else {
      setActiveQuestion({ category, question });
      setUserContext('');
      setContextFile(null);
      setGeneratedAnswer(null);
    }
  };

  const handleGenerateAnswer = async () => {
    if (!activeQuestion) return;
    setIsGeneratingAnswer(true);
    setGeneratedAnswer(null);
    startLoading();
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a world-class data scientist and consultant for the medical aesthetics industry. A user is asking for an in-depth analysis of a specific business question.
- The original question from your knowledge base is: "${activeQuestion.question}".
- The user has provided the following additional context/data: "${userContext}".
- Your answer must be comprehensive, well-structured, and beautifully formatted in Markdown.
- Provide actionable steps, frameworks, and explain what data would be needed and what statistical models (e.g., **RFM模型**, **生存分析**) could be applied.
- Your entire response must be in Chinese.`;

      const contents: {
        parts: Array<{ text?: string; inlineData?: { mimeType: string; data: string } }>;
      } = { parts: [{ text: prompt }] };
      if (contextFile) {
        contents.parts.unshift({
          inlineData: {
            mimeType: contextFile.base64.mimeType,
            data: contextFile.base64.data,
          },
        });
      }

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: contents,
      });
      setGeneratedAnswer(response.text);
    } catch (e) {
      console.error('Answer generation failed:', e);
      setGeneratedAnswer(
        `### 分析失败\n\n抱歉，生成回答时遇到问题。请稍后重试。(${e instanceof Error ? e.message : String(e)})`
      );
    } finally {
      setIsGeneratingAnswer(false);
      stopLoading();
    }
  };

  return (
    <div className="animate-fade-in-up">
      <CameraModal
        isOpen={showCamera}
        onClose={() => setShowCamera(false)}
        onCapture={(img) => handleImageCapture(img, !!activeQuestion)}
      />
      <header className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-text-base)] tracking-tight">
          AI 决策参谋
        </h1>
        <p className="text-lg text-[color:var(--color-text-muted)] mt-2 max-w-3xl mx-auto">
          描述您的业务挑战，AI 将为您连接到最相关的模型、学习路径和行动方案。
        </p>
      </header>

      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-4 sm:p-6 rounded-2xl shadow-lg border border-slate-200">
          <div className="relative">
            <textarea
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              placeholder="请详细描述您遇到的业务挑战，或使用语音、图片输入..."
              className="w-full h-32 p-3 border border-slate-300 rounded-lg text-md focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)] resize-none"
            />
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileChange(e, false)}
                className="hidden"
                accept="image/*"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                title="上传图片"
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition"
              >
                <span className="material-symbols-outlined">upload_file</span>
              </button>
              <button
                onClick={() => setShowCamera(true)}
                title="拍照"
                className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition"
              >
                <span className="material-symbols-outlined">photo_camera</span>
              </button>
              <button
                onClick={handleMicClick}
                title="语音输入"
                className={`p-2 rounded-full hover:bg-slate-200 text-slate-500 transition ${isRecording ? 'bg-red-100 !text-red-600 animate-pulse' : ''}`}
              >
                <span className="material-symbols-outlined">
                  {isRecording ? 'mic' : 'mic_none'}
                </span>
              </button>
            </div>
          </div>

          {uploadedImage && (
            <div className="mt-3 relative w-32 h-32 border rounded-lg p-1">
              <img
                src={uploadedImage}
                alt="Uploaded preview"
                className="w-full h-full object-cover rounded-md"
              />
              <button
                onClick={() => setUploadedImage(null)}
                title="移除图片"
                className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
              >
                <span className="material-symbols-outlined !text-sm">close</span>
              </button>
            </div>
          )}

          <div className="mt-3">
            <button
              onClick={() => handleAnalyze()}
              disabled={isLoading}
              className="w-full bg-[color:rgb(var(--color-primary))] text-white font-bold py-2.5 px-6 rounded-lg hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:bg-slate-400"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <span className="material-symbols-outlined">lightbulb</span>
              )}
              <span>{isLoading ? '正在分析...' : 'AI 分析 & 建议'}</span>
            </button>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-200/60">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-semibold text-slate-500">
                没有灵感？试试这些 AI 生成的问题：
              </h3>
              <button
                onClick={fetchAiSuggestions}
                disabled={isFetchingSuggestions || isLoading}
                className="p-1 rounded-full hover:bg-slate-200 text-slate-500 transition disabled:opacity-50"
              >
                <span
                  className={`material-symbols-outlined text-base ${isFetchingSuggestions ? 'animate-spin' : ''}`}
                >
                  refresh
                </span>
              </button>
            </div>
            <div className="space-y-2">
              {isFetchingSuggestions && aiSuggestions.length === 0 ? (
                <p className="text-xs text-slate-400 w-full text-center py-2">AI 正在生成灵感...</p>
              ) : (
                aiSuggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setProblem(suggestion.question);
                      handleAnalyze(suggestion.question);
                    }}
                    disabled={isLoading}
                    className="w-full text-left px-3 py-2 bg-slate-50 rounded-lg hover:bg-slate-100 border border-transparent hover:border-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed group"
                  >
                    <p className="text-sm text-slate-800">{suggestion.question}</p>
                    <div className="flex flex-wrap gap-1.5 mt-1.5">
                      {suggestion.keywords.map((kw) => (
                        <span
                          key={kw}
                          className="px-2 py-0.5 text-xs bg-slate-200 text-slate-600 rounded-full group-hover:bg-[color:rgb(var(--color-primary)/0.1)] group-hover:text-[color:rgb(var(--color-primary))]"
                        >
                          {kw}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="mt-8">
          {isLoading && !result && <LoadingSkeleton />}
          {error && <p className="text-center text-red-600 bg-red-50 p-4 rounded-xl">{error}</p>}
          {result && (
            <div className="space-y-8 animate-fade-in-up">
              <section>
                <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-3">
                  AI 摘要与洞察
                </h2>
                <p className="text-md text-[color:var(--color-text-muted)] bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                  {result.problemSummary}
                </p>
              </section>

              <section>
                <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-3">
                  推荐的数据模型
                </h2>
                <div className="space-y-4">
                  {result.recommendedModels.map((model: RecommendedModel) => (
                    <button
                      key={model.modelId}
                      onClick={() => handleNavigation('models', model.modelId)}
                      className="w-full text-left p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-[color:rgb(var(--color-primary)/0.5)] transition-all"
                    >
                      <h3 className="font-bold text-[color:rgb(var(--color-primary))]">
                        {model.modelName}
                      </h3>
                      <p className="text-sm text-[color:var(--color-text-muted)] mt-1">
                        {model.relevance}
                      </p>
                    </button>
                  ))}
                </div>
              </section>

              {result.recommendedPaths && result.recommendedPaths.length > 0 && (
                <section>
                  <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-3">
                    推荐的学习路径
                  </h2>
                  <div className="space-y-4">
                    {result.recommendedPaths.map((path: RecommendedPath) => (
                      <button
                        key={path.pathId}
                        onClick={() => handleNavigation('paths')}
                        className="w-full text-left p-4 bg-white rounded-xl shadow-sm border border-slate-200 hover:shadow-md hover:border-[color:rgb(var(--color-primary)/0.5)] transition-all"
                      >
                        <h3 className="font-bold text-[color:rgb(var(--color-primary))]">
                          {path.pathTitle}
                        </h3>
                        <p className="text-sm text-[color:var(--color-text-muted)] mt-1">
                          {path.relevance}
                        </p>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              <section>
                <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-3">
                  建议的行动步骤
                </h2>
                <ul className="list-none space-y-3">
                  {result.nextSteps.map((step: string, index: number) => (
                    <li
                      key={index}
                      className="flex items-start p-3 bg-white rounded-xl border border-slate-200 shadow-sm"
                    >
                      <span className="material-symbols-outlined text-xl text-[color:rgb(var(--color-primary))] mr-3 mt-0.5">
                        check_circle
                      </span>
                      <span className="text-sm text-[color:var(--color-text-base)]">{step}</span>
                    </li>
                  ))}
                </ul>
              </section>

              {resultId && (
                <footer className="mt-6 pt-4 border-t border-slate-200">
                  <Feedback contentId={resultId} contentType="decision_guide_result" />
                </footer>
              )}
            </div>
          )}
        </div>
      </div>

      <section className="mt-16 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-extrabold text-[color:var(--color-text-base)]">
            常见业务问题导航
          </h2>
          <p className="text-md text-[color:var(--color-text-muted)] mt-1">
            从常见业务挑战出发，快速找到对应的解决方案和数据模型。
          </p>
        </div>
        <div className="space-y-4">
          {decisionGuideData.map((category) => (
            <details
              key={category.category}
              className="bg-white/50 border border-slate-200 p-3 rounded-xl transition-all duration-300 open:shadow-md open:bg-white"
              open={decisionGuideData.indexOf(category) === 0}
            >
              <summary className="font-bold text-md text-[color:var(--color-text-base)] cursor-pointer flex items-center space-x-2 list-none">
                <span className="material-symbols-outlined text-[color:rgb(var(--color-primary))]">
                  {category.icon}
                </span>
                <span>{category.category}</span>
              </summary>
              <div className="mt-4 space-y-3 pl-8">
                {category.problems.map((problem, index) => (
                  <div key={index} className="p-4 border-l-2 border-slate-200">
                    <h4 className="font-semibold text-slate-800">{problem.question}</h4>
                    <p className="text-sm text-slate-600 mt-2">{problem.explanation}</p>
                    <div className="mt-3 flex flex-wrap gap-2 items-center">
                      <span className="text-xs font-semibold text-slate-500">推荐模型:</span>
                      {problem.tools.map((tool) => (
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
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-16 max-w-4xl mx-auto">
        <div className="flex justify-center items-center gap-4 text-center mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-[color:var(--color-text-base)]">
              数据科学家如何理解医美业务
            </h2>
            <p className="text-md text-[color:var(--color-text-muted)] mt-1">
              从这些问题开始，像数据科学家一样思考您的业务，并获得AI的深度分析。
            </p>
          </div>
          <button
            onClick={fetchDsQuestions}
            disabled={isLoadingDsQuestions || isGeneratingAnswer}
            className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition disabled:opacity-50"
            title="刷新问题列表"
          >
            <span
              className={`material-symbols-outlined text-xl ${isLoadingDsQuestions ? 'animate-spin' : ''}`}
            >
              refresh
            </span>
          </button>
        </div>

        {isLoadingDsQuestions ? (
          <div className="space-y-4">
            <div className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
            <div className="h-12 bg-slate-200 rounded-lg animate-pulse"></div>
          </div>
        ) : (
          <div className="space-y-3">
            {dsQuestions.map((category) => (
              <details
                key={category.category}
                className="bg-white/50 border border-slate-200 p-3 rounded-xl transition-all duration-300 open:shadow-md open:bg-white"
                open={dsQuestions.indexOf(category) <= 1}
              >
                <summary className="font-bold text-md text-[color:var(--color-text-base)] cursor-pointer flex items-center space-x-2 list-none">
                  <span className="material-symbols-outlined text-[color:rgb(var(--color-primary))]">
                    {category.icon}
                  </span>
                  <span>{category.category}</span>
                </summary>
                <div className="mt-4 space-y-2">
                  {category.questions.map((question, index) => (
                    <div
                      key={index}
                      ref={activeQuestion?.question === question ? activeQuestionRef : null}
                    >
                      <button
                        onClick={() => handleQuestionClick(category.category, question)}
                        className="w-full text-left p-3 rounded-lg hover:bg-slate-50 transition"
                      >
                        <p className="font-medium text-sm text-slate-700">{question}</p>
                      </button>
                      {activeQuestion?.question === question && (
                        <div className="p-4 bg-slate-50 border-t border-slate-200 animate-fade-in-up">
                          {isGeneratingAnswer ? (
                            <div className="flex items-center space-x-2 text-sm text-slate-500">
                              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                              <span>AI 正在为您生成深度报告...</span>
                            </div>
                          ) : generatedAnswer ? (
                            <div>
                              <article className="prose prose-sm max-w-full">
                                <ReactMarkdown>{generatedAnswer}</ReactMarkdown>
                              </article>
                              <button
                                onClick={() => setActiveQuestion(null)}
                                className="mt-4 text-xs font-semibold text-[color:rgb(var(--color-primary))]"
                              >
                                收起回答
                              </button>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-sm font-medium text-slate-600">
                                请提供更多背景信息或上传相关文件 (可选):
                              </p>
                              <textarea
                                value={userContext}
                                onChange={(e) => setUserContext(e.target.value)}
                                rows={3}
                                className="w-full text-sm p-2 border rounded-md"
                                placeholder="例如：我们是一家位于市中心的皮肤管理诊所..."
                              ></textarea>
                              {contextFile && (
                                <div className="text-xs flex items-center space-x-2 bg-slate-200 p-1.5 rounded-md">
                                  <span className="material-symbols-outlined !text-base">
                                    description
                                  </span>
                                  <span className="flex-1 truncate">{contextFile.file.name}</span>
                                  <button onClick={() => setContextFile(null)}>
                                    <span className="material-symbols-outlined !text-base">
                                      close
                                    </span>
                                  </button>
                                </div>
                              )}
                              <div className="flex items-center space-x-2">
                                <input
                                  type="file"
                                  ref={fileInputRef}
                                  onChange={(e) => handleFileChange(e, true)}
                                  className="hidden"
                                />
                                <button
                                  onClick={() => fileInputRef.current?.click()}
                                  className="text-xs flex items-center space-x-1 px-2 py-1 bg-white border rounded-md hover:bg-slate-100"
                                >
                                  <span className="material-symbols-outlined !text-sm">
                                    upload_file
                                  </span>
                                  <span>上传文件</span>
                                </button>
                                <button
                                  onClick={() => setShowCamera(true)}
                                  className="text-xs flex items-center space-x-1 px-2 py-1 bg-white border rounded-md hover:bg-slate-100"
                                >
                                  <span className="material-symbols-outlined !text-sm">
                                    photo_camera
                                  </span>
                                  <span>拍照</span>
                                </button>
                              </div>
                              <button
                                onClick={handleGenerateAnswer}
                                className="w-full py-2 bg-[color:rgb(var(--color-primary))] text-white font-semibold rounded-md hover:opacity-90 transition"
                              >
                                提交并获取AI分析
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </details>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default DecisionGuide;
