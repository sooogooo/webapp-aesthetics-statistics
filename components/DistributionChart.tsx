import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LogarithmicScale,
  ScatterController,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { Distribution } from '../types';
import { generateChartData } from '../data/chartData';
import { useSettings } from '../contexts/SettingsContext';
import ABTestCalculator from './ABTestCalculator';
import { useChat } from '../contexts/ChatContext';
import { useChartInteraction } from '../hooks/useChartInteraction';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  LogarithmicScale,
  ScatterController
);

interface DistributionChartProps {
  distribution: Distribution;
}

const DistributionChart: React.FC<DistributionChartProps> = ({ distribution }) => {
  const [chartScenarios, setChartScenarios] = useState<any[]>([]);
  const [selectedScenarioIndex, setSelectedScenarioIndex] = useState(0);
  const { settings } = useSettings();
  const chartRef = useRef<ChartJS>(null);
  const { setInitialInput, setIsChatOpen } = useChat();

  // State for interactive parameter sliders
  const [normalParams, setNormalParams] = useState({ mu: 0, sigma: 1 });
  const [poissonLambda, setPoissonLambda] = useState(3);
  const [betaParams, setBetaParams] = useState({ alpha: 2, beta: 5 });

  // Use custom hook for chart interactions
  const { hoverInfo, clickInfo, handleHover, handleChartClick, setHoverInfo, setClickInfo } =
    useChartInteraction(
      distribution.id,
      distribution.name,
      normalParams,
      poissonLambda,
      betaParams
    );

  const clickPopupRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const chartCanvas = chartRef.current?.canvas;
      if (
        clickPopupRef.current &&
        !clickPopupRef.current.contains(event.target as Node) &&
        event.target !== chartCanvas
      ) {
        setClickInfo(null);
      }
    };

    if (clickInfo) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [clickInfo]);

  const themeColors = useMemo(() => {
    if (typeof window === 'undefined') {
      return {
        textColorBase: '#172554',
        textColorMuted: '#64748b',
        borderColor: '#e2e8f0',
        primaryColor: '64 192 182',
      };
    }
    const rootStyle = getComputedStyle(document.documentElement);
    return {
      textColorBase: `rgb(${rootStyle.getPropertyValue('--color-text-base').trim()})`,
      textColorMuted: `rgb(${rootStyle.getPropertyValue('--color-text-muted').trim()})`,
      borderColor: `rgb(${rootStyle.getPropertyValue('--color-border').trim()})`,
      primaryColor: rootStyle.getPropertyValue('--color-primary').trim(),
    };
  }, [settings.theme]);

  const chartParams = useMemo(() => {
    switch (distribution.id) {
      case 1:
        return normalParams;
      case 3:
        return { lambda: poissonLambda };
      case 9:
        return betaParams;
      default:
        return {};
    }
  }, [distribution.id, normalParams, poissonLambda, betaParams]);

  useEffect(() => {
    const scenarios = generateChartData(distribution.name, themeColors, chartParams);
    setChartScenarios(scenarios || []);
    setSelectedScenarioIndex(0);

    // Reset params for non-interactive charts
    if (distribution.id !== 1) setNormalParams({ mu: 0, sigma: 1 });
    if (distribution.id !== 3) setPoissonLambda(3);
    if (distribution.id !== 9) setBetaParams({ alpha: 2, beta: 5 });
  }, [distribution.name, themeColors, chartParams]);

  const currentChartInfo = useMemo(() => {
    if (!chartScenarios || chartScenarios.length === 0) return null;
    if (selectedScenarioIndex >= chartScenarios.length) return null;

    const originalChart = chartScenarios[selectedScenarioIndex];
    // Create a new chart config with onHover and disabled tooltip (don't mutate state)
    const chart = {
      ...originalChart,
      options: {
        ...originalChart.options,
        onHover: handleHover,
        plugins: {
          ...originalChart.options.plugins,
          tooltip: { enabled: false },
        },
      },
    };

    return chart;
  }, [chartScenarios, selectedScenarioIndex, handleHover]);

  const handleExport = () => {
    const chart = chartRef.current;
    if (chart) {
      const link = document.createElement('a');
      link.href = chart.toBase64Image('image/png');
      const scenarioName =
        selectedScenarioIndex < chartScenarios.length ? currentChartInfo?.name : '交互式模拟';
      link.download = `${distribution.name.split(/[:（\s]/)[0]}_${scenarioName}.png`.replace(
        /\s/g,
        '_'
      );
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const renderInteractiveControls = () => {
    const interactiveModels = [1, 3, 9];
    if (!interactiveModels.includes(distribution.id)) {
      return null;
    }

    let sliders = null;
    if (distribution.id === 1) {
      // Normal Distribution
      sliders = (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-xs">
            <label className="font-medium">
              均值 μ:{' '}
              <span className="font-bold text-[color:rgb(var(--color-primary))]">
                {normalParams.mu.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="-5"
              max="5"
              step="0.1"
              value={normalParams.mu}
              onChange={(e) => setNormalParams((p) => ({ ...p, mu: +e.target.value }))}
              className="w-full"
            />
          </div>
          <div className="text-xs">
            <label className="font-medium">
              标准差 σ:{' '}
              <span className="font-bold text-[color:rgb(var(--color-primary))]">
                {normalParams.sigma.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="0.5"
              max="5"
              step="0.1"
              value={normalParams.sigma}
              onChange={(e) => setNormalParams((p) => ({ ...p, sigma: +e.target.value }))}
              className="w-full"
            />
          </div>
        </div>
      );
    }
    if (distribution.id === 3) {
      // Poisson Distribution
      sliders = (
        <div className="text-xs">
          <label className="font-medium">
            平均发生率 λ:{' '}
            <span className="font-bold text-[color:rgb(var(--color-primary))]">
              {poissonLambda.toFixed(1)}
            </span>
          </label>
          <input
            type="range"
            min="0.5"
            max="15"
            step="0.5"
            value={poissonLambda}
            onChange={(e) => setPoissonLambda(+e.target.value)}
            className="w-full"
          />
        </div>
      );
    }
    if (distribution.id === 9) {
      // Beta Distribution
      sliders = (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="text-xs">
            <label className="font-medium">
              α (成功+1):{' '}
              <span className="font-bold text-[color:rgb(var(--color-primary))]">
                {betaParams.alpha.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={betaParams.alpha}
              onChange={(e) => setBetaParams((p) => ({ ...p, alpha: +e.target.value }))}
              className="w-full"
            />
          </div>
          <div className="text-xs">
            <label className="font-medium">
              β (失败+1):{' '}
              <span className="font-bold text-[color:rgb(var(--color-primary))]">
                {betaParams.beta.toFixed(1)}
              </span>
            </label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.1"
              value={betaParams.beta}
              onChange={(e) => setBetaParams((p) => ({ ...p, beta: +e.target.value }))}
              className="w-full"
            />
          </div>
        </div>
      );
    }

    return (
      <div className="mt-4 border-t border-slate-200 pt-4">
        <h3 className="text-center font-bold text-slate-700 mb-2">参数实时模拟</h3>
        <div className="bg-slate-50/50 p-4 rounded-lg">{sliders}</div>
      </div>
    );
  };

  const renderContent = () => {
    if (distribution.id === 44) {
      // A/B Test Calculator
      return <ABTestCalculator themeColors={themeColors} />;
    }

    const chartElement = () => {
      if (!currentChartInfo || !currentChartInfo.data) return null;
      return (
        <Chart
          ref={chartRef}
          type={currentChartInfo.type}
          options={currentChartInfo.options}
          data={currentChartInfo.data}
          onClick={handleChartClick}
        />
      );
    };

    return (
      chartElement() || (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-slate-500">此模型无默认可视化图表。</p>
        </div>
      )
    );
  };

  const scenarioButtonStyle = (index: number) =>
    `px-2 py-0.5 text-xs font-medium rounded-md transition ${selectedScenarioIndex === index ? 'bg-slate-600 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'}`;

  return (
    <div
      className="bg-white rounded-xl p-4 shadow-sm border border-slate-200 animate-fade-in-up h-[30rem] relative flex flex-col"
      onMouseLeave={() => setHoverInfo(null)}
    >
      <div className="absolute top-2 right-2 z-10 flex flex-col items-end space-y-2">
        {chartScenarios.length > 1 ? (
          <div className="bg-slate-100 p-1 rounded-md flex items-center space-x-1">
            {chartScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => setSelectedScenarioIndex(index)}
                className={scenarioButtonStyle(index)}
              >
                {scenario.name}
              </button>
            ))}
          </div>
        ) : null}
        {distribution.id !== 44 && (
          <button
            onClick={handleExport}
            className="flex items-center space-x-1.5 bg-white border border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded-lg hover:bg-slate-100 hover:border-slate-400 transition-colors text-sm shadow-sm"
            title="导出图表为 PNG"
          >
            <span className="material-symbols-outlined !text-base">download</span>
            <span>导出为PNG</span>
          </button>
        )}
      </div>

      {hoverInfo && (
        <div
          className="fixed bg-white rounded-lg shadow-xl p-3 z-50 animate-fade-in-up w-72 border border-slate-200 pointer-events-none"
          style={{
            left: hoverInfo.x,
            top: hoverInfo.y,
            transform: 'translate(15px, -105%)',
          }}
        >
          <p className="text-xs text-slate-600 mb-2">{hoverInfo.text}</p>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setInitialInput(hoverInfo.fullPrompt);
              setIsChatOpen(true);
              setHoverInfo(null);
            }}
            style={{ pointerEvents: 'auto' }}
            className="w-full text-left text-xs font-semibold text-[color:rgb(var(--color-primary))] hover:bg-[color:rgb(var(--color-primary)/0.1)] p-1 rounded-md flex items-center space-x-1"
          >
            <span className="material-symbols-outlined !text-sm">psychology</span>
            <span>AI 详细解释</span>
          </button>
        </div>
      )}

      {clickInfo && (
        <div
          ref={clickPopupRef}
          className="fixed bg-white rounded-lg shadow-xl p-3 z-50 animate-fade-in-up w-72 border border-slate-200"
          style={{
            left: clickInfo.x,
            top: clickInfo.y,
            transform: 'translate(15px, -110%)',
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-slate-800">数据点详情</p>
            <button
              onClick={() => setClickInfo(null)}
              className="text-slate-400 hover:text-slate-700 p-0.5"
            >
              <span className="material-symbols-outlined !text-base">close</span>
            </button>
          </div>
          <p className="text-xs text-slate-600 mb-2">{clickInfo.pointDescription}</p>
          <button
            onClick={() => {
              setInitialInput(clickInfo.fullPrompt);
              setIsChatOpen(true);
              setClickInfo(null);
            }}
            className="w-full text-left text-xs font-semibold text-[color:rgb(var(--color-primary))] hover:bg-[color:rgb(var(--color-primary)/0.1)] p-1 rounded-md flex items-center space-x-1"
          >
            <span className="material-symbols-outlined !text-sm">psychology</span>
            <span>让 AI 深入分析</span>
          </button>
        </div>
      )}

      <div className="w-full flex-1 relative pt-2 overflow-hidden">
        {distribution.parameters && (
          <div className="text-center text-xs text-slate-500 pb-2 mb-2 border-b border-slate-200">
            <strong>核心参数:</strong> {distribution.parameters}
          </div>
        )}
        {renderContent()}
      </div>
      {renderInteractiveControls()}
    </div>
  );
};

export default DistributionChart;
