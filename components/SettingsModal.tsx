import React from 'react';
import { useSettings } from '../contexts/SettingsContext';
import type { Settings, Theme, FontSize, AiStyle, AiLength } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

// FIX: Changed component to use a 'label' prop instead of 'children' to avoid confusing type errors.
interface SettingOptionButtonProps {
    value: string;
    currentValue: string;
    onClick: () => void;
    label: string;
}

const SettingOptionButton = ({ value, currentValue, onClick, label }: SettingOptionButtonProps) => (
    <button onClick={onClick} className={`px-3 py-1.5 rounded-full text-sm transition ${value === currentValue ? 'bg-[color:rgb(var(--color-primary))] text-white' : 'bg-[color:var(--color-bg-muted)] hover:bg-[color:var(--color-border)]'}`}>
        {label}
    </button>
);

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, setIsOpen }) => {
    const { settings, setSettings } = useSettings();

    if (!isOpen) return null;

    const updateSetting = <K extends keyof Settings>(key: K, value: Settings[K]) => {
        setSettings(prev => ({...prev, [key]: value}));
    };

    const themeOptions: { value: Theme, label: string, color: string }[] = [
        { value: 'mint', label: '薄荷', color: '#40C0B6' },
        { value: 'lavender', label: '薰衣草', color: '#A38ED1' },
        { value: 'rose', label: '玫瑰', color: '#E58C9D' },
        { value: 'peach', label: '蜜桃', color: '#F2A990' },
    ];

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in-up" onClick={() => setIsOpen(false)}>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm m-4" onClick={e => e.stopPropagation()}>
        <div className="p-5 border-b flex justify-between items-center">
          <h2 className="text-lg font-bold">显示与AI设置</h2>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-800">
             <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5 space-y-6">
            {/* Theme */}
            <div>
                <label className="block text-sm font-medium mb-2">优雅皮肤</label>
                <div className="flex space-x-2">
                    {themeOptions.map(theme => (
                         <button key={theme.value} onClick={() => updateSetting('theme', theme.value)} className="flex items-center space-x-2 p-2 rounded-lg border-2 transition" style={{ borderColor: settings.theme === theme.value ? theme.color : 'transparent', backgroundColor: 'var(--color-bg-muted)' }}>
                             <span className="w-5 h-5 rounded-full" style={{ backgroundColor: theme.color }}></span>
                             <span className="text-sm">{theme.label}</span>
                         </button>
                    ))}
                </div>
            </div>

            {/* Font Size */}
            <div>
                <label className="block text-sm font-medium mb-2">字号设置</label>
                <div className="flex space-x-2">
                    <SettingOptionButton value="font-size-sm" currentValue={settings.fontSize} onClick={() => updateSetting('fontSize', 'font-size-sm')} label="小" />
                    <SettingOptionButton value="font-size-md" currentValue={settings.fontSize} onClick={() => updateSetting('fontSize', 'font-size-md')} label="中" />
                    <SettingOptionButton value="font-size-lg" currentValue={settings.fontSize} onClick={() => updateSetting('fontSize', 'font-size-lg')} label="大" />
                </div>
            </div>
            
            {/* AI Style */}
            <div>
                <label className="block text-sm font-medium mb-2">AI 输出风格</label>
                <div className="flex space-x-2">
                    <SettingOptionButton value="轻松幽默" currentValue={settings.aiStyle} onClick={() => updateSetting('aiStyle', '轻松幽默')} label="轻松幽默" />
                    <SettingOptionButton value="标准日常" currentValue={settings.aiStyle} onClick={() => updateSetting('aiStyle', '标准日常')} label="标准日常" />
                    <SettingOptionButton value="科学严谨" currentValue={settings.aiStyle} onClick={() => updateSetting('aiStyle', '科学严谨')} label="科学严谨" />
                </div>
            </div>

            {/* AI Length */}
            <div>
                <label className="block text-sm font-medium mb-2">AI 输出长度</label>
                <div className="flex space-x-2">
                    <SettingOptionButton value="简约" currentValue={settings.aiLength} onClick={() => updateSetting('aiLength', '简约')} label="简约" />
                    <SettingOptionButton value="标准" currentValue={settings.aiLength} onClick={() => updateSetting('aiLength', '标准')} label="标准" />
                    <SettingOptionButton value="详细" currentValue={settings.aiLength} onClick={() => updateSetting('aiLength', '详细')} label="详细" />
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;