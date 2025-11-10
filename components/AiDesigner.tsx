import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useLoading } from '../contexts/LoadingContext';
import useLocalStorage from '../hooks/useLocalStorage';
import type { DesignHistoryItem } from '../types';
import { promptData, modifierChips } from '../data/promptTemplates';
import Feedback from './Feedback';
import { apiService } from '../services/api';

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

const AiDesigner: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>(promptData[0].id);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(
    promptData[0].templates[0].id
  );
  const [activeModifiers, setActiveModifiers] = useState<Set<string>>(new Set());
  const [customPrompt, setCustomPrompt] = useState('');
  const [finalPrompt, setFinalPrompt] = useState('');

  const [aspectRatio, setAspectRatio] = useState<'1:1' | '3:4' | '4:3' | '9:16' | '16:9'>('1:1');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [history, setHistory] = useLocalStorage<DesignHistoryItem[]>('designHistory', []);
  const { startLoading, stopLoading } = useLoading();

  const [referenceImage, setReferenceImage] = useState<{ base64: string; file: File } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const selectedTemplate = useMemo(() => {
    return (
      promptData
        .find((c) => c.id === selectedCategory)
        ?.templates.find((t) => t.id === selectedTemplateId) || promptData[0].templates[0]
    );
  }, [selectedCategory, selectedTemplateId]);

  useEffect(() => {
    const base = selectedTemplate.basePrompt;
    const modifiers = [...activeModifiers].join(', ');
    const combined = `${base}${modifiers ? `, ${modifiers}` : ''}${customPrompt ? `, ${customPrompt}` : ''}.`;
    setFinalPrompt(combined);
  }, [selectedTemplate, activeModifiers, customPrompt]);

  const handleModifierClick = (modifier: string) => {
    setActiveModifiers((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(modifier)) {
        newSet.delete(modifier);
      } else {
        newSet.add(modifier);
      }
      return newSet;
    });
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) {
        // 4MB limit for inline data
        setError('参考图文件大小不能超过4MB。');
        return;
      }
      try {
        const base64 = await blobToBase64(file);
        setReferenceImage({ base64, file });
        setError(null);
      } catch (e) {
        setError('无法读取图片文件。');
        console.error(e);
      }
    }
  };

  const handleGenerate = async () => {
    if (!finalPrompt.trim() || isLoading) return;
    setIsLoading(true);
    startLoading();
    setError(null);
    setGeneratedImage(null);

    try {
      const response = await apiService.generateImage({
        prompt: finalPrompt,
        aspectRatio: aspectRatio,
        referenceImage: referenceImage
          ? {
              base64: referenceImage.base64,
              mimeType: referenceImage.file.type,
            }
          : undefined,
      });

      const base64ImageBytes = response.imageData;
      setGeneratedImage(base64ImageBytes);

      const newItem: DesignHistoryItem = {
        id: `design_${Date.now()}`,
        timestamp: Date.now(),
        prompt: finalPrompt,
        base64Image: base64ImageBytes,
      };
      setHistory((prev) => [newItem, ...prev].slice(0, 20));
    } catch (e) {
      console.error('Image generation failed:', e);
      setError(`图片生成失败。${e instanceof Error ? e.message : '请检查您的提示词或稍后再试。'}`);
    } finally {
      setIsLoading(false);
      stopLoading();
    }
  };

  const loadFromHistory = (item: DesignHistoryItem) => {
    setFinalPrompt(item.prompt);
    setCustomPrompt(item.prompt);
    setSelectedCategory('');
    setSelectedTemplateId('');
    setActiveModifiers(new Set());
    setGeneratedImage(item.base64Image);
    setReferenceImage(null);
  };

  const AspectRatioButton: React.FC<{
    value: typeof aspectRatio;
    label: string;
    disabled?: boolean;
  }> = ({ value, label, disabled }) => (
    <button
      onClick={() => !disabled && setAspectRatio(value)}
      disabled={disabled}
      className={`px-3 py-1 text-xs font-medium rounded-full transition ${aspectRatio === value ? 'bg-[color:rgb(var(--color-primary))] text-white' : 'bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-border)]'} ${disabled ? 'cursor-not-allowed opacity-60' : ''}`}
    >
      {label}
    </button>
  );

  const ModifierChip: React.FC<{ modifier: string }> = ({ modifier }) => (
    <button
      onClick={() => handleModifierClick(modifier)}
      className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${activeModifiers.has(modifier) ? 'bg-[color:rgb(var(--color-primary)/0.1)] text-[color:rgb(var(--color-primary))] border-[color:rgb(var(--color-primary))]' : 'bg-white hover:border-slate-400 border-slate-300'}`}
    >
      {modifier}
    </button>
  );

  return (
    <div className="animate-fade-in-up">
      <header className="mb-8">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[color:var(--color-text-base)] tracking-tight">
          AI 美学营销设计师
        </h1>
        <p className="text-lg text-[color:var(--color-text-muted)] mt-2">
          为您的医美业务，生成高度定制化、专业级的营销与教育视觉素材。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Controls */}
        <div className="lg:col-span-4 space-y-4">
          <div className="space-y-4 p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <div>
              <label className="text-sm font-bold text-[color:var(--color-text-base)]">
                1. 选择创作主题
              </label>
              <select
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setSelectedTemplateId(
                    promptData.find((c) => c.id === e.target.value)!.templates[0].id
                  );
                }}
                value={selectedCategory}
                className="w-full mt-2 p-2 border border-slate-300 rounded-md bg-white"
              >
                {promptData.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm font-bold text-[color:var(--color-text-base)]">
                2. 选择提示词模板
              </label>
              <div className="space-y-1 mt-2 max-h-40 overflow-y-auto pr-2">
                {promptData
                  .find((c) => c.id === selectedCategory)
                  ?.templates.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => setSelectedTemplateId(template.id)}
                      className={`w-full text-left p-2 rounded-md text-xs transition-colors ${selectedTemplateId === template.id ? 'bg-[color:rgb(var(--color-primary)/0.1)]' : 'hover:bg-slate-100'}`}
                    >
                      {template.title}
                    </button>
                  ))}
              </div>
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <label className="text-sm font-bold text-[color:var(--color-text-base)]">
              3. 添加微调模块
            </label>
            <div className="space-y-3 mt-2">
              {Object.entries(modifierChips).map(([category, chips]) => (
                <div key={category}>
                  <h4 className="text-xs font-semibold text-slate-500 capitalize mb-1.5">
                    {category}
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {chips.map((chip) => (
                      <ModifierChip key={chip} modifier={chip} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <label className="text-sm font-bold text-[color:var(--color-text-base)]">
              4. (可选) 上传参考图
            </label>
            <p className="text-xs text-slate-500 mt-1">AI将尝试模仿参考图的色彩、构图或风格。</p>
            {referenceImage ? (
              <div className="mt-2 relative">
                <img
                  src={`data:${referenceImage.file.type};base64,${referenceImage.base64}`}
                  alt="Reference"
                  className="w-full rounded-md object-contain max-h-40 border"
                />
                <button
                  onClick={() => setReferenceImage(null)}
                  className="absolute top-1 right-1 bg-black/60 text-white rounded-full p-0.5 hover:bg-black/80 transition-colors"
                  title="移除参考图"
                >
                  <span className="material-symbols-outlined !text-base align-middle">close</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="mt-2 w-full flex items-center justify-center space-x-2 py-3 border-2 border-dashed border-slate-300 rounded-md text-slate-500 hover:border-[color:rgb(var(--color-primary))] hover:text-[color:rgb(var(--color-primary))] transition"
              >
                <span className="material-symbols-outlined">add_photo_alternate</span>
                <span className="text-sm font-medium">选择图片 (最大4MB)</span>
              </button>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept="image/png, image/jpeg, image/webp"
            />
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <label className="text-sm font-bold text-[color:var(--color-text-base)]">
              5. (可选) 添加自定义描述
            </label>
            <textarea
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              placeholder="例如：背景中有绿植"
              className="w-full mt-2 p-2 h-16 border rounded-md text-sm"
            />
          </div>

          <div className="p-4 bg-white rounded-xl shadow-sm border border-slate-200">
            <label className="text-sm font-bold text-[color:var(--color-text-base)]">
              6. 选择图片比例
            </label>
            {referenceImage && (
              <p className="text-xs text-amber-600 mt-1">
                参考图模式下不支持自定义比例，将生成1:1方图。
              </p>
            )}
            <div className="flex flex-wrap gap-2 mt-2">
              <AspectRatioButton disabled={!!referenceImage} value="1:1" label="方形" />
              <AspectRatioButton disabled={!!referenceImage} value="4:3" label="横向" />
              <AspectRatioButton disabled={!!referenceImage} value="16:9" label="宽屏" />
              <AspectRatioButton disabled={!!referenceImage} value="3:4" label="纵向" />
              <AspectRatioButton disabled={!!referenceImage} value="9:16" label="故事" />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={isLoading || !finalPrompt.trim()}
            className="w-full bg-[color:rgb(var(--color-primary))] text-white font-bold py-3 px-4 rounded-md hover:opacity-90 transition-opacity flex items-center justify-center space-x-2 disabled:bg-slate-400"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span className="material-symbols-outlined">auto_awesome</span>
            )}
            <span>{isLoading ? '正在生成中...' : '立即生成'}</span>
          </button>
        </div>

        {/* Image and History */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          <div
            className="relative bg-white rounded-xl shadow-sm border border-slate-200 p-4 min-h-[20rem] flex items-center justify-center flex-col"
            style={{ aspectRatio: aspectRatio.replace(':', ' / ') }}
          >
            {isLoading && (
              <div className="text-center text-[color:var(--color-text-muted)]">
                <div className="w-8 h-8 border-4 border-[color:rgb(var(--color-primary))] border-t-transparent rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 font-semibold">AI 正在挥洒创意...</p>
                <p className="text-sm">高质量图片生成约需30秒</p>
              </div>
            )}
            {error && <p className="text-red-600 text-sm p-4 bg-red-50 rounded-lg">{error}</p>}
            {generatedImage && !isLoading && (
              <>
                <img
                  src={`data:image/png;base64,${generatedImage}`}
                  alt={finalPrompt}
                  className="w-full h-full object-contain rounded-lg"
                />
                {history.length > 0 && (
                  <div className="absolute bottom-2 right-2 bg-white/80 backdrop-blur-sm p-1 rounded-lg">
                    <Feedback
                      contentId={`designer-${history[0]?.id}`}
                      contentType="generated_image"
                      promptText=""
                    />
                  </div>
                )}
              </>
            )}
            {!isLoading && !generatedImage && !error && (
              <div className="text-center text-[color:var(--color-text-muted)]">
                <span className="material-symbols-outlined text-6xl opacity-50">palette</span>
                <p className="mt-2 font-medium">您的 AI 设计将在此处展示</p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4">
            <h3 className="text-sm font-bold text-[color:var(--color-text-base)] mb-2">
              最终提示词预览
            </h3>
            <p className="text-xs p-2 bg-slate-50 rounded-md text-slate-600 h-24 overflow-y-auto">
              {finalPrompt}
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[color:var(--color-text-base)] mb-4">创作历史</h2>
            {history.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {history.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => loadFromHistory(item)}
                    className="group relative aspect-square rounded-lg overflow-hidden border-2 border-transparent hover:border-[color:rgb(var(--color-primary))] transition-all"
                  >
                    <img
                      src={`data:image/png;base64,${item.base64Image}`}
                      alt={item.prompt}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-2 flex items-end">
                      <p className="text-white text-xs line-clamp-2">{item.prompt}</p>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="text-center p-8 bg-slate-50 rounded-xl text-[color:var(--color-text-muted)]">
                <p>暂无创作历史，快开始您的第一次创作吧！</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiDesigner;
