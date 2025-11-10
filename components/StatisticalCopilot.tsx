import React, { useState, useRef, useEffect } from 'react';
import type { ChatMessage } from '../types';
import ReactMarkdown from 'react-markdown';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Chart } from 'react-chartjs-2';
import { useLoading } from '../contexts/LoadingContext';
import useLocalStorage from '../hooks/useLocalStorage';
import Feedback from './Feedback';
import { apiService } from '../services/api';

ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler);

const categorizedPrompts = [
  {
    category: '运营分析',
    icon: 'monitoring',
    prompts: [
      { title: '季度营收分析', prompt: '请帮我分析这份季度营收数据(已上传)，找出增长点和潜在风险，并与上季度进行对比。', icon: 'trending_up' },
      { title: '客户流失预警', prompt: '我想建立一个客户流失预警模型。请告诉我需要哪些数据维度，并推荐一个合适的预测模型，说明其优缺点。', icon: 'person_off' },
      { title: '客户终身价值(CLV)预测', prompt: '请根据我上传的客户消费数据，预测不同客户群体的CLV，并建议如何提升高潜力客户的价值。', icon: 'monetization_on' },
      { title: '医生/咨询师业绩评估', prompt: '如何设计一个公平的医生或咨询师业绩评估体系？请结合手术量、客单价、满意度和复购率等指标给出建议。', icon: 'military_tech' },
      { title: '设备使用率分析', prompt: '请分析我上传的设备使用记录，找出使用率高峰和低谷，并为优化设备排期、提升ROI提出建议。', icon: 'precision_manufacturing' },
      { title: '耗材库存管理', prompt: '我们的耗材（如玻尿酸、肉毒素）库存成本很高，请推荐一个科学的库存管理模型，以降低成本并避免缺货。', icon: 'inventory_2' },
      { title: '预约取消率分析', prompt: '分析我们近半年的预约数据，找出导致客户取消预约的关键因素，并提出3条降低取消率的策略。', icon: 'event_busy' },
    ]
  },
  {
    category: '市场营销',
    icon: 'campaign',
    prompts: [
      { title: '广告ROI评估', prompt: '如何科学评估我们线上广告的ROI？我们主要的渠道是小红书和抖音，请给出分析框架和需要追踪的数据点。', icon: 'paid' },
      { title: '新项目定价策略', prompt: '我们准备上线一个新的抗衰项目，请帮我设计一个有竞争力的定价策略，需要考虑哪些因素？可以结合联合分析吗？', icon: 'sell' },
      { title: 'A/B测试方案设计', prompt: '我想测试两个不同优惠活动的效果，请帮我设计一个完整的A/B测试方案，包括如何划分流量、测试多长时间、以及如何判断结果。', icon: 'rule' },
      { title: '市场购物篮分析', prompt: '请分析我上传的订单数据，找出强关联的项目组合，并为交叉销售提供3条具体建议。', icon: 'shopping_basket' },
      { title: '渠道归因分析', prompt: '客户从了解到成交会经过多个渠道（小红书、抖音、大众点评），如何进行渠道归因，科学评估每个渠道的贡献？', icon: 'share' },
      { title: 'KOL营销效果评估', prompt: '我们合作了一批KOL，如何量化他们的带客效果和ROI？请设计一个评估模型。', icon: 'record_voice_over' },
      { title: '优惠券策略优化', prompt: '我们的优惠券核销率不高，请分析可能的原因，并设计3种不同的优惠券策略（例如针对新客、老客、高价值客户）进行测试。', icon: 'local_activity' },
    ]
  },
  {
    category: '客户洞察',
    icon: 'groups',
    prompts: [
        { title: '构建客户画像', prompt: '请根据我上传的用户数据，使用K-均值聚类帮我构建3-5个典型的客户画像，并描述每个群体的特征。', icon: 'face' },
        { title: '分析客户评论', prompt: '我上传了一份客户评论文本，请进行情感分析，总结出客户最满意的3个点和抱怨最多的3个点。', icon: 'reviews' },
        { title: '设计满意度问卷', prompt: '请帮我设计一份专业的客户满意度问卷，需要覆盖服务流程、医生技术、项目效果和价格感知等维度。', icon: 'quiz' },
        { title: '客户生命周期分析', prompt: '请帮我定义我们客户的生命周期阶段（如引入期、成长期、成熟期、休眠期、流失期），并为每个阶段的客户制定不同的运营策略。', icon: 'cycle' },
        { title: '客户路径分析', prompt: '客户从线上了解到线下成交，再到复购，经历了哪些关键触点？请帮我绘制一个典型的客户旅程地图，并找出可以优化的环节。', icon: 'route' },
        { title: '高价值客户特征分析', prompt: '请对比分析我们的高价值客户和普通客户，在人口统计学、消费行为和项目偏好上有哪些显著差异？', icon: 'diamond' },
    ]
  },
  {
    category: '战略规划',
    icon: 'emoji_objects',
    prompts: [
        { title: '竞品分析报告', prompt: '请帮我写一份关于[竞品名称]的分析报告框架，需要包含他们的产品线、定价策略、市场声量和优劣势分析。', icon: 'corporate_fare' },
        { title: 'SWOT分析', prompt: '请为我们的机构进行一次SWOT分析，我们的主要业务是皮肤管理和微整形。', icon: 'manage_search' },
        { title: '年度战略目标(OKR)', prompt: '请帮我制定下一年度的战略目标(OKR)，我希望聚焦于提升客户复购率和品牌影响力。', icon: 'flag' },
        { title: '新店选址模型', prompt: '我们计划开一家新分店，请帮我设计一个数据驱动的选址模型，需要考虑哪些因素（如商圈人流、竞品分布、目标客户密度等）？', icon: 'add_location' },
        { title: '市场趋势预测', prompt: '结合最新的行业报告和网络趋势，请预测未来1-2年医美市场的热门项目和技术方向。', icon: 'show_chart' },
        { title: '风险管理矩阵', prompt: '请为我们的机构构建一个风险管理矩阵，识别并评估我们可能面临的主要运营风险、市场风险和合规风险。', icon: 'security' },
    ]
  }
];


const blobToBase64 = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            resolve(base64String.split(',')[1]);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

const ChartTemplatesModal: React.FC<{
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    templates: any[];
    setTemplates: (templates: any[]) => void;
}> = ({ isOpen, setIsOpen, templates, setTemplates }) => {
    if (!isOpen) return null;

    const handleCopyJson = (chartData: any) => {
        navigator.clipboard.writeText(JSON.stringify(chartData, null, 2));
        alert('图表JSON已复制到剪贴板！');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('您确定要删除这个模板吗？')) {
            setTemplates(templates.filter(t => t.id !== id));
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in-up" onClick={() => setIsOpen(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg m-4" onClick={e => e.stopPropagation()}>
                <div className="p-5 border-b flex justify-between items-center">
                    <h2 className="text-lg font-bold">我的图表模板</h2>
                    <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800"><span className="material-symbols-outlined">close</span></button>
                </div>
                <div className="p-4 max-h-[60vh] overflow-y-auto">
                    {templates.length === 0 ? (
                        <p className="text-center text-slate-500 py-8">暂无已保存的模板。</p>
                    ) : (
                        <div className="space-y-3">
                            {templates.map(template => (
                                <div key={template.id} className="p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                                    <p className="font-medium text-sm text-slate-700">{template.name}</p>
                                    <div className="flex items-center space-x-2">
                                        <button onClick={() => handleCopyJson(template.chartData)} className="text-xs px-2 py-1 bg-white border rounded-md hover:bg-slate-100">复制JSON</button>
                                        <button onClick={() => handleDelete(template.id)} className="text-xs text-red-600 p-1 hover:bg-red-100 rounded-full"><span className="material-symbols-outlined !text-sm">delete</span></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};


const StatisticalCopilot: React.FC = () => {
    const [messages, setMessages] = useState<ChatMessage[]>([
        { role: 'model', text: '你好！我是您的智能医美统计助手。您可以上传您的业务数据（如 Excel, CSV, PDF, TXT），然后向我提问，让我为您进行分析。请问今天想分析什么问题？', id: 'copilot-init-1' },
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const chatEndRef = useRef<HTMLDivElement>(null);
    const { startLoading, stopLoading } = useLoading();
    const [savedTemplates, setSavedTemplates] = useLocalStorage<any[]>('chart-templates', []);
    const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
    const [expandedCategories, setExpandedCategories] = useState<string[]>([categorizedPrompts[0]?.category].filter(Boolean) as string[]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setUploadedFile(file);
            const confirmationMessage: ChatMessage = {
                role: 'model',
                text: `✅ 文件 **${file.name}** 已准备就绪。\n\n现在，请在下方输入您的问题，或选择一个预设功能来开始分析。`,
                id: `copilot-sys-${Date.now()}`
            };
            setMessages(prev => [...prev, confirmationMessage]);
        }
    };

    const handleSaveTemplate = (chartData: any) => {
        const name = prompt("请输入模板名称:", `模板 ${new Date().toLocaleString()}`);
        if (name && name.trim()) {
            setSavedTemplates(prev => [...prev, { id: Date.now().toString(), name: name.trim(), chartData }]);
            alert(`模板 "${name.trim()}" 已保存！`);
        }
    };

    const handleSendMessage = async (prompt: string) => {
        if (!prompt.trim() || isLoading) return;

        const requiresFile = prompt.includes('上传');
        if (requiresFile && !uploadedFile) {
            const warningMessage: ChatMessage = {
                role: 'model',
                text: '⚠️ **操作提示**\n\n您选择的功能需要上传数据文件才能进行分析。请点击输入框左侧的 📎 图标上传文件，然后再试一次。',
                id: `copilot-warn-${Date.now()}`
            };
            setMessages(prev => [...prev, warningMessage]);
            return; 
        }
        
        const userMessage: ChatMessage = { role: 'user', text: prompt, id: `copilot-u-${Date.now()}` };
        if (uploadedFile) {
            userMessage.fileInfo = `已上传文件: ${uploadedFile.name} (${Math.round(uploadedFile.size / 1024)} KB)`;
        }
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);
        startLoading();

        try {
            const systemInstruction = `你是一位顶级的医美行业数据科学家和商业策略师。你的任务是与用户进行深度对话，解决他们关于运营、管理和市场营销的复杂问题。
- **主动引导**：如果用户的问题模糊，要主动追问，以澄清其真实需求。
- **提供框架**：给出解决问题的结构化框架和 actionable 的建议。
- **数据驱动**：强调数据的重要性，并说明需要哪些数据来做出决策。
- **图表生成**：如果用户要求可视化或你认为图表能更好地说明问题，请在回答的末尾，使用\`\`\`json ... \`\`\`代码块提供一个严格遵循Chart.js v4.x规范的JSON对象。JSON应包含'type', 'data', 和 'options' 字段。不要在代码块前后添加任何额外说明。
- **结合文件**：如果用户上传了文件，你的所有分析都必须基于该文件内容。`;

            let response;

            if (uploadedFile) {
                // Use file analysis endpoint
                const fileContent = await uploadedFile.text();
                response = await apiService.analyzeFile({
                    fileContent,
                    fileName: uploadedFile.name,
                    prompt,
                    systemInstruction
                });
            } else {
                // Use regular chat endpoint
                response = await apiService.chat({
                    message: prompt,
                    systemInstruction
                });
            }

            let responseText = response.text;
            let chartData = null;
            const chartJsonRegex = /```json\n([\s\S]*?)\n```/;
            const match = responseText.match(chartJsonRegex);

            if (match && match[1]) {
                try {
                    chartData = JSON.parse(match[1]);
                    responseText = responseText.replace(chartJsonRegex, '').trim();
                } catch (e) {
                    console.error("Failed to parse chart JSON:", e);
                }
            }

            const modelMessage: ChatMessage = { role: 'model', text: responseText, chartData, id: `copilot-m-${Date.now()}` };
            setMessages(prev => [...prev, modelMessage]);

        } catch (error) {
            console.error("AI 操作失败:", error);
            const errorText = error instanceof Error ? error.message : '抱歉，分析时遇到问题，请检查您的问题或文件，然后重试。';
            const errorMessage: ChatMessage = { role: 'model', text: errorText, id: `copilot-e-${Date.now()}` };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
            setUploadedFile(null);
            if(fileInputRef.current) fileInputRef.current.value = '';
            stopLoading();
        }
    };

    const handleExport = () => {
        const chatHistory = messages.map(msg => {
            let header = `[${msg.role.toUpperCase()}]`;
            if (msg.fileInfo) {
                header += ` - ${msg.fileInfo}`;
            }
            return `${header}\n${msg.text}\n\n`;
        }).join('');
        const blob = new Blob([chatHistory], { type: 'text/plain;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.setAttribute('download', `智能医美统计对话_${new Date().toISOString()}.txt`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };
    
    const toggleCategory = (categoryName: string) => {
        setExpandedCategories(prev =>
            prev.includes(categoryName)
                ? prev.filter(c => c !== categoryName)
                : [...prev, categoryName]
        );
    };

    return (
        <div className="animate-fade-in-up flex flex-col h-[calc(100vh-8rem)]">
            <header className="flex justify-between items-center mb-4">
                <div>
                    <h1 className="text-3xl font-extrabold text-[color:var(--color-text-base)]">智能医美统计</h1>
                    <p className="text-md text-[color:var(--color-text-muted)] mt-1">您专属的AI数据分析与商业策略伙伴。</p>
                </div>
                 <div className="flex items-center space-x-2">
                    <button onClick={() => setIsTemplatesModalOpen(true)} className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[color:var(--color-border)] rounded-full text-sm font-medium text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-muted)] transition">
                        <span className="material-symbols-outlined text-lg">collections_bookmark</span>
                        <span>我的模板</span>
                    </button>
                    <button onClick={handleExport} className="flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-[color:var(--color-border)] rounded-full text-sm font-medium text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-muted)] transition">
                        <span className="material-symbols-outlined text-lg">download</span>
                        <span>导出对话</span>
                    </button>
                </div>
            </header>
            
            <div className="flex-1 overflow-y-auto pr-4 space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                        <div className={`max-w-[90%] w-fit px-4 py-3 rounded-xl prose prose-sm ${msg.role === 'user' ? 'bg-[color:rgb(var(--color-primary))] text-white' : 'bg-white text-[color:var(--color-text-base)] shadow-sm border border-slate-100'}`}>
                           {msg.fileInfo && <p className="text-xs italic opacity-80 border-b border-current/20 pb-2 mb-2">{msg.fileInfo}</p>}
                           <ReactMarkdown>{msg.text}</ReactMarkdown>
                           {msg.chartData && (
                               <div className="mt-4 bg-slate-50 p-2 rounded-lg not-prose">
                                   <div className="relative h-64">
                                       <Chart type={msg.chartData.type} data={msg.chartData.data} options={msg.chartData.options} />
                                       <button onClick={() => handleSaveTemplate(msg.chartData)} title="保存为模板" className="absolute top-1 right-1 bg-white/70 p-1 rounded-full text-slate-600 hover:bg-white hover:text-[color:rgb(var(--color-primary))] transition-colors">
                                           <span className="material-symbols-outlined !text-sm">bookmark_add</span>
                                       </button>
                                   </div>
                               </div>
                           )}
                        </div>
                        {msg.role === 'model' && msg.id && (
                            <div className="mt-1.5 ml-1">
                                <Feedback contentId={msg.id} contentType="copilot_response" promptText="" />
                            </div>
                        )}
                    </div>
                ))}
                 {isLoading && (
                    <div className="flex justify-start">
                        <div className="px-4 py-3 rounded-xl bg-white shadow-sm border border-slate-100">
                           <div className="flex items-center space-x-2 text-sm text-[color:var(--color-text-muted)]">
                                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                                <span>AI 正在深度分析中...</span>
                           </div>
                        </div>
                    </div>
                )}
                <div ref={chatEndRef}></div>
            </div>

            <div className="pt-4">
                <div className="space-y-2 mb-3">
                    {categorizedPrompts.map(category => (
                        <div key={category.category} className="bg-white/60 border border-slate-200/80 rounded-lg transition-all duration-300">
                            <button onClick={() => toggleCategory(category.category)} className="w-full flex justify-between items-center p-2 text-left hover:bg-slate-50/50 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <span className="material-symbols-outlined text-base text-[color:var(--color-primary)]">{category.icon}</span>
                                    <span className="font-semibold text-sm text-[color:var(--color-text-base)]">{category.category}</span>
                                </div>
                                <span className={`material-symbols-outlined text-lg text-[color:var(--color-text-muted)] transition-transform ${expandedCategories.includes(category.category) ? 'rotate-180' : ''}`}>
                                    expand_more
                                </span>
                            </button>
                            {expandedCategories.includes(category.category) && (
                                <div className="p-2 border-t border-slate-200/80">
                                    <div className="flex flex-wrap gap-2">
                                        {category.prompts.map(p => (
                                            <button 
                                                key={p.title} 
                                                onClick={() => handleSendMessage(p.prompt)} 
                                                disabled={isLoading} 
                                                className="flex items-center space-x-1.5 px-2.5 py-1 bg-white border border-[color:var(--color-border)] rounded-full text-xs font-medium text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-muted)] hover:border-[color:rgb(var(--color-primary)/0.5)] transition disabled:opacity-50"
                                            >
                                                <span className="material-symbols-outlined text-sm">{p.icon}</span>
                                                <span>{p.title}</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey ? (e.preventDefault(), handleSendMessage(input)) : null}
                        placeholder="输入您的问题，可以按 Shift+Enter 换行..."
                        className="w-full pl-12 pr-28 py-3 border border-slate-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[color:rgb(var(--color-primary)/0.5)]"
                        disabled={isLoading}
                    />
                    <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".csv,.txt,.json,.pdf,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"/>
                    <button 
                      onClick={() => fileInputRef.current?.click()} 
                      disabled={isLoading}
                      className="absolute left-3 top-1/2 -translate-y-1.2 p-2 rounded-full text-[color:var(--color-text-muted)] hover:bg-[color:var(--color-bg-muted)]"
                      title={uploadedFile ? `已选择: ${uploadedFile.name}` : "上传文件"}
                    >
                      <span className={`material-symbols-outlined ${uploadedFile ? 'text-[color:rgb(var(--color-primary))]' : ''}`}>attach_file</span>
                    </button>
                    <button onClick={() => handleSendMessage(input)} disabled={isLoading || !input.trim()} className="absolute right-2 top-1/2 -translate-y-1/2 bg-[color:rgb(var(--color-primary))] text-white px-5 py-2 rounded-full text-sm font-semibold hover:opacity-90 disabled:bg-slate-400 transition">
                        发送
                    </button>
                </div>
                <p className="text-xs text-center text-slate-400 mt-2">
                    支持上传 Excel, CSV, JSON, PDF, TXT 等文件进行分析。
                </p>
            </div>
            <ChartTemplatesModal isOpen={isTemplatesModalOpen} setIsOpen={setIsTemplatesModalOpen} templates={savedTemplates} setTemplates={setSavedTemplates} />
        </div>
    );
};

export default StatisticalCopilot;