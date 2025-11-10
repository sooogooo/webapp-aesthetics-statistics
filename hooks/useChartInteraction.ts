import { useState, useCallback } from 'react';
import type { ChartJS } from 'chart.js';

interface NormalParams {
  mu: number;
  sigma: number;
}

interface BetaParams {
  alpha: number;
  beta: number;
}

interface HoverInfo {
  x: number;
  y: number;
  text: string;
  fullPrompt: string;
}

interface ClickInfo {
  x: number;
  y: number;
  pointDescription: string;
  fullPrompt: string;
}

export const useChartInteraction = (
  distributionId: number,
  distributionName: string,
  normalParams: NormalParams,
  poissonLambda: number,
  betaParams: BetaParams
) => {
  const [hoverInfo, setHoverInfo] = useState<HoverInfo | null>(null);
  const [clickInfo, setClickInfo] = useState<ClickInfo | null>(null);

  const handleHover = useCallback((event: any, elements: any[], chart: ChartJS) => {
    const interactiveModels = [1, 3, 9];
    if (!interactiveModels.includes(distributionId)) {
      setHoverInfo(null);
      return;
    }

    if (elements.length > 0 && chart) {
      const { index, datasetIndex } = elements[0];
      const canvas = chart.canvas;
      const rect = canvas.getBoundingClientRect();

      const xLabel = chart.data.labels![index] as string;
      const yValue = (chart.data.datasets[datasetIndex].data[index] as number);

      let preliminaryText = '';
      let fullPrompt = '';

      switch(distributionId) {
        case 1: { // Normal
          const { mu, sigma } = normalParams;
          preliminaryText = `在均值为 ${mu.toFixed(1)}, 标准差为 ${sigma.toFixed(1)} 的正态分布下, 数值 ${parseFloat(xLabel).toFixed(2)} 出现的概率密度约为 ${yValue.toFixed(3)}。`;
          fullPrompt = `在"正态分布"图表中，我正观察一个均值为 ${mu.toFixed(1)}、标准差为 ${sigma.toFixed(1)} 的场景。鼠标悬停的数据点显示，当数值为 ${parseFloat(xLabel).toFixed(2)} 时，其概率密度约为 ${yValue.toFixed(3)}。请结合医美业务场景，深入解释这个数据点所代表的商业含义。`;
          break;
        }
        case 3: { // Poisson
          preliminaryText = `当平均每小时事件数为 ${poissonLambda.toFixed(1)} 时, 发生 ${xLabel} 次事件的概率是 ${(yValue * 100).toFixed(2)}%。`;
          fullPrompt = `在"泊松分布"图表中，我正观察一个平均发生率为 ${poissonLambda.toFixed(1)} 的场景。鼠标悬停的数据点显示，发生 ${xLabel} 次事件的概率是 ${(yValue * 100).toFixed(2)}%。请结合医美业务场景（如客户到店数），深入解释这个数据点所代表的商业含义。`;
          break;
        }
        case 9: { // Beta
          const { alpha, beta } = betaParams;
          preliminaryText = `在 α=${alpha.toFixed(1)}, β=${beta.toFixed(1)} 的贝塔分布下, 转化率等于 ${parseFloat(xLabel).toFixed(2)} 的可能性(概率密度)约为 ${yValue.toFixed(3)}。`;
          fullPrompt = `在"贝塔分布"图表中，我正观察一个 α=${alpha.toFixed(1)}, β=${beta.toFixed(1)} 的场景（可以理解为 ${alpha-1} 次成功, ${beta-1} 次失败）。鼠标悬停的数据点显示，当真实转化率为 ${parseFloat(xLabel).toFixed(2)} 时，其概率密度约为 ${yValue.toFixed(3)}。请结合A/B测试或新项目评估的医美场景，深入解释这个数据点所代表的商业含义。`;
          break;
        }
        default:
          setHoverInfo(null);
          return;
      }

      setHoverInfo({
        x: rect.left + event.x,
        y: rect.top + event.y,
        text: preliminaryText,
        fullPrompt: fullPrompt
      });

    } else {
      setHoverInfo(null);
    }
  }, [distributionId, normalParams, poissonLambda, betaParams]);

  const handleChartClick = useCallback((event: React.MouseEvent<HTMLCanvasElement>, chartRef: React.RefObject<ChartJS>) => {
    const chart = chartRef.current;
    if (!chart) return;

    const elements = chart.getElementsAtEventForMode(event.nativeEvent, 'nearest', { intersect: true }, true);

    if (elements.length > 0) {
      const { datasetIndex, index } = elements[0];
      const dataset = chart.data.datasets[datasetIndex];
      const rawValue = dataset.data[index];
      const datasetLabel = dataset.label || '数据';

      let pointDescription = '';

      if (typeof rawValue === 'object' && rawValue !== null && 'x' in rawValue && 'y' in rawValue) {
        const point = rawValue as { x: any; y: any };
        const xLabel = chart.options.scales?.x?.title?.text || 'X轴';
        const yLabel = chart.options.scales?.y?.title?.text || 'Y轴';
        pointDescription = `坐标为 (${xLabel}: ${point.x}, ${yLabel}: ${point.y}) 的数据点`;
      } else {
        const label = chart.data.labels?.[index] || `索引 ${index}`;
        const value = typeof rawValue === 'number' ? rawValue.toFixed(2) : String(rawValue);
        pointDescription = `分类为"${label}"的数据点，其值为 ${value}`;
      }

      const aiPrompt = `在"${distributionName}"图表 (${datasetLabel}) 中，我点击了${pointDescription}。请结合医美业务场景，深入解释这个数据点所代表的含义、背后的商业洞察以及可能采取的行动。`;

      setClickInfo({
        x: event.clientX,
        y: event.clientY,
        pointDescription: pointDescription,
        fullPrompt: aiPrompt
      });
      setHoverInfo(null);
    } else {
      setClickInfo(null);
    }
  }, [distributionName]);

  return {
    hoverInfo,
    clickInfo,
    handleHover,
    handleChartClick,
    setHoverInfo,
    setClickInfo,
  };
};
