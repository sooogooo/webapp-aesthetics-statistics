import React, { useState, useMemo, useEffect } from 'react';
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
} from 'chart.js';
import { Chart } from 'react-chartjs-2';
import type { ChartOptions } from 'chart.js';

interface ThemeColors {
  textColorBase: string;
  textColorMuted: string;
  borderColor: string;
  primaryColor: string;
}

interface ABTestResult {
  probBbetterThanA: number;
  expectedA: number;
  expectedB: number;
  expectedLift: number;
}

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Gamma function approximation (Lanczos approximation)
const gamma = (z: number): number => {
  const g = 7;
  const p = [
    0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313,
    -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  if (z < 0.5) return Math.PI / (Math.sin(Math.PI * z) * gamma(1 - z));
  z -= 1;
  let x = p[0];
  for (let i = 1; i < g + 2; i++) {
    x += p[i] / (z + i);
  }
  const t = z + g + 0.5;
  return Math.sqrt(2 * Math.PI) * Math.pow(t, z + 0.5) * Math.exp(-t) * x;
};

// Beta distribution PDF
const betaPDF = (x: number, a: number, b: number): number => {
  if (x < 0 || x > 1) return 0;
  const betaFunc = (gamma(a) * gamma(b)) / gamma(a + b);
  return (Math.pow(x, a - 1) * Math.pow(1 - x, b - 1)) / betaFunc;
};

const ABTestCalculator: React.FC<{ themeColors: ThemeColors }> = ({ themeColors }) => {
  const [visitorsA, setVisitorsA] = useState(100);
  const [conversionsA, setConversionsA] = useState(10);
  const [visitorsB, setVisitorsB] = useState(100);
  const [conversionsB, setConversionsB] = useState(15);
  const [result, setResult] = useState<ABTestResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const alphaA = conversionsA + 1;
  const betaA = visitorsA - conversionsA + 1;
  const alphaB = conversionsB + 1;
  const betaB = visitorsB - conversionsB + 1;

  // Run simulation when alpha/beta values change
  useEffect(() => {
    // Using a timeout to allow UI to update to loading state before heavy computation
    const timeoutId = setTimeout(() => {
      setResult(null);
      setIsLoading(true);
      // Numerical integration for Bayesian A/B test
      let probBbetterThanA = 0;
      const step = 0.001;
      for (let x = 0; x < 1; x += step) {
        let cumulativeProbA = 0;
        for (let y = 0; y < x; y += step) {
          cumulativeProbA += betaPDF(y, alphaA, betaA) * step;
        }
        probBbetterThanA += betaPDF(x, alphaB, betaB) * cumulativeProbA * step;
      }

      const expectedA = alphaA / (alphaA + betaA);
      const expectedB = alphaB / (alphaB + betaB);
      const expectedLift = (expectedB - expectedA) / expectedA;

      setResult({
        probBbetterThanA: probBbetterThanA * 100,
        expectedA: expectedA * 100,
        expectedB: expectedB * 100,
        expectedLift: expectedLift * 100,
      });
      setIsLoading(false);
    }, 50);

    return () => clearTimeout(timeoutId);
  }, [alphaA, betaA, alphaB, betaB]);

  const chartData = useMemo(() => {
    const labels = Array.from({ length: 101 }, (_, i) => (i / 100).toFixed(2));
    const dataA = labels.map((x) => betaPDF(parseFloat(x), alphaA, betaA));
    const dataB = labels.map((x) => betaPDF(parseFloat(x), alphaB, betaB));

    return {
      labels,
      datasets: [
        {
          label: `方案 A (转化率: ${((conversionsA / visitorsA) * 100).toFixed(2)}%)`,
          data: dataA,
          borderColor: 'rgba(100, 116, 139, 0.8)',
          backgroundColor: 'rgba(100, 116, 139, 0.2)',
          fill: true,
          pointRadius: 0,
          tension: 0.4,
        },
        {
          label: `方案 B (转化率: ${((conversionsB / visitorsB) * 100).toFixed(2)}%)`,
          data: dataB,
          borderColor: `rgb(${themeColors.primaryColor})`,
          backgroundColor: `rgba(${themeColors.primaryColor}, 0.3)`,
          fill: true,
          pointRadius: 0,
          tension: 0.4,
        },
      ],
    };
  }, [alphaA, betaA, alphaB, betaB, conversionsA, conversionsB, visitorsA, visitorsB, themeColors]);

  const chartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: '转化率的后验概率分布' },
      legend: { display: true, position: 'top' },
    },
    scales: {
      x: { title: { display: true, text: '转化率' } },
      y: { title: { display: true, text: '概率密度' } },
    },
  };

  return (
    <div className="flex flex-col h-full">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 border-b border-slate-200">
        {/* Variant A */}
        <div className="space-y-2">
          <h3 className="font-bold text-center text-slate-600">方案 A</h3>
          <div>
            <label className="text-sm font-medium">访客数</label>
            <input
              type="number"
              value={visitorsA}
              onChange={(e) => setVisitorsA(Math.max(1, +e.target.value))}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="text-sm font-medium">转化数</label>
            <input
              type="number"
              value={conversionsA}
              onChange={(e) => setConversionsA(Math.max(0, Math.min(visitorsA, +e.target.value)))}
              className="w-full p-1 border rounded"
            />
          </div>
        </div>
        {/* Variant B */}
        <div className="space-y-2">
          <h3
            className="font-bold text-center"
            style={{ color: `rgb(${themeColors.primaryColor})` }}
          >
            方案 B
          </h3>
          <div>
            <label className="text-sm font-medium">访客数</label>
            <input
              type="number"
              value={visitorsB}
              onChange={(e) => setVisitorsB(Math.max(1, +e.target.value))}
              className="w-full p-1 border rounded"
            />
          </div>
          <div>
            <label className="text-sm font-medium">转化数</label>
            <input
              type="number"
              value={conversionsB}
              onChange={(e) => setConversionsB(Math.max(0, Math.min(visitorsB, +e.target.value)))}
              className="w-full p-1 border rounded"
            />
          </div>
        </div>
      </div>

      <div className="p-4 text-center">
        {isLoading && <p>正在进行模拟计算...</p>}
        {result && !isLoading && (
          <div className="animate-fade-in-up">
            <p className="text-lg">
              B方案优于A方案的概率是:
              <strong
                className="text-2xl mx-2"
                style={{ color: `rgb(${themeColors.primaryColor})` }}
              >
                {result.probBbetterThanA.toFixed(2)}%
              </strong>
            </p>
            <p className="text-sm text-slate-500 mt-1">
              预期转化率提升约 <strong>{result.expectedLift.toFixed(2)}%</strong> (从{' '}
              {result.expectedA.toFixed(2)}% 到 {result.expectedB.toFixed(2)}%)
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 relative min-h-[200px]">
        <Chart type="line" data={chartData} options={chartOptions} />
      </div>
    </div>
  );
};

export default ABTestCalculator;
