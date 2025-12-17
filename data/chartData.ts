import type { ChartOptions } from 'chart.js';

interface ThemeColors {
  textColorBase: string;
  textColorMuted: string;
  borderColor: string;
  primaryColor: string;
}

type ChartDataPoint = number | { x: number; y: number };

interface ChartParams {
  mu?: number;
  sigma?: number;
  lambda?: number;
  alpha?: number;
  beta?: number;
  [key: string]: number | undefined;
}

// Utility type for writable ChartOptions (Chart.js types are readonly)
type WritableChartOptions = ChartOptions & {
  scales?: {
    x?: { title?: { text?: string }; suggestedMin?: number; suggestedMax?: number };
    y?: { title?: { text?: string }; suggestedMin?: number; suggestedMax?: number };
  };
};

const randomDataCache = new Map<string, ChartDataPoint[]>();

const getBaseOptions = (title: string, colors: ThemeColors): ChartOptions => {
  const baseRgbMatch = colors.textColorBase.match(/\d+/g);
  const baseRgb = baseRgbMatch ? baseRgbMatch.join(', ') : '23, 37, 84'; // Fallback

  return {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: title,
        color: colors.textColorBase,
        font: {
          size: 14,
          weight: 'bold',
        },
      },
      tooltip: {
        backgroundColor: `rgba(${baseRgb}, 0.8)`,
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: `rgb(${colors.primaryColor})`,
        borderWidth: 1,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: '概率 / 频率',
          color: colors.textColorMuted,
          font: { size: 12 },
        },
        grid: {
          color: colors.borderColor,
        },
        ticks: {
          color: colors.textColorMuted,
          font: { size: 10 },
        },
      },
      x: {
        title: {
          display: true,
          text: '数值 / 结果',
          color: colors.textColorMuted,
          font: { size: 12 },
        },
        grid: {
          display: false,
        },
        ticks: {
          color: colors.textColorMuted,
          font: { size: 10 },
        },
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
      point: {
        radius: 0,
      },
    },
  };
};

const themedLineDataset = (
  label: string,
  data: ChartDataPoint[],
  colors: ThemeColors,
  options: { fill?: boolean; tension?: number; borderWidth?: number; stepped?: boolean } = {}
) => ({
  label,
  data,
  borderColor: `rgb(${colors.primaryColor})`,
  backgroundColor: `rgba(${colors.primaryColor}, 0.2)`,
  borderWidth: options.borderWidth ?? 2,
  fill: options.fill ?? true,
  tension: options.tension ?? 0.4,
  stepped: options.stepped ?? false,
});

const themedBarDataset = (label: string, data: number[], colors: ThemeColors) => ({
  label,
  data,
  backgroundColor: `rgba(${colors.primaryColor}, 0.6)`,
  borderColor: `rgb(${colors.primaryColor})`,
  borderWidth: 1,
});

const createLabels = (start: number, end: number, step: number) => {
  const labels = [];
  for (let i = start; i <= end; i += step) {
    labels.push(i.toFixed(Math.max(0, (step.toString().split('.')[1] || '').length)));
  }
  return labels;
};

// --- PDF/PMF calculators ---
export const normalPDF = (x: number, mu: number, sigma: number) => {
  const sigma2 = sigma * sigma;
  if (sigma2 === 0) return x === mu ? Infinity : 0;
  const term1 = 1 / Math.sqrt(2 * Math.PI * sigma2);
  const term2 = Math.exp(-((x - mu) * (x - mu)) / (2 * sigma2));
  return term1 * term2;
};

export const poissonPMF = (k: number, lambda: number) => {
  if (lambda < 0) return 0;
  if (lambda === 0) return k === 0 ? 1 : 0;
  k = Math.floor(k);
  if (k < 0) return 0;
  let factorial = 1;
  for (let i = 2; i <= k; i++) factorial *= i;
  return (Math.pow(lambda, k) * Math.exp(-lambda)) / factorial;
};

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

export const betaPDF = (x: number, a: number, b: number): number => {
  if (a <= 0 || b <= 0) return 0;
  if (x < 0 || x > 1) return 0;

  // Handle boundaries explicitly to avoid Infinity from Math.pow(0, negative)
  if (x === 0 && a < 1) return 5.0; // Cap asymptote
  if (x === 1 && b < 1) return 5.0; // Cap asymptote
  if ((x === 0 && a > 1) || (x === 1 && b > 1)) return 0;

  const betaFunc = (gamma(a) * gamma(b)) / gamma(a + b);
  if (betaFunc === 0 || !isFinite(betaFunc)) return 0;

  const pdf = (Math.pow(x, a - 1) * Math.pow(1 - x, b - 1)) / betaFunc;
  return isFinite(pdf) ? pdf : 5.0; // General cap for stability
};

export const weibullPDF = (t: number, k: number, lambda: number): number => {
  if (t < 0 || k <= 0 || lambda <= 0) return 0;
  if (t === 0) {
    if (k < 1) return 3.0; // Cap the asymptote for display
    if (k === 1) return 1 / lambda;
    return 0;
  }
  const t_lambda = t / lambda;
  const pdf = (k / lambda) * Math.pow(t_lambda, k - 1) * Math.exp(-Math.pow(t_lambda, k));
  return isFinite(pdf) ? pdf : 3.0;
};

export const gammaPDF = (x: number, alpha: number, beta: number): number => {
  if (x < 0 || alpha <= 0 || beta <= 0) return 0;
  if (x === 0) {
    if (alpha < 1) return 3.0; // Cap the asymptote for display
    if (alpha === 1) return beta;
    return 0;
  }
  const gammaAlpha = gamma(alpha);
  if (gammaAlpha === 0 || !isFinite(gammaAlpha)) return 0;

  const pdf = (Math.pow(beta, alpha) / gammaAlpha) * Math.pow(x, alpha - 1) * Math.exp(-beta * x);
  return isFinite(pdf) ? pdf : 3.0;
};

const randomNormal = (mean = 0, stdDev = 1) => {
  let u1 = 0,
    u2 = 0;
  while (u1 === 0) u1 = Math.random();
  while (u2 === 0) u2 = Math.random();
  const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
  return z0 * stdDev + mean;
};

// --- Helpers for Dirichlet Distribution ---
const sampleGamma = (alpha: number, beta: number): number => {
  // Marsaglia and Tsang's method for alpha > 1
  if (alpha > 1) {
    const d = alpha - 1 / 3;
    const c = 1 / Math.sqrt(9 * d);
    let v, x, u;
    while (true) {
      do {
        x = randomNormal();
        v = 1 + c * x;
      } while (v <= 0);
      v = v * v * v;
      u = Math.random();
      if (u < 1 - 0.0331 * x * x * x * x) return (d * v) / beta;
      if (Math.log(u) < 0.5 * x * x + d - d * v + d * Math.log(v)) return (d * v) / beta;
    }
  } else {
    // for alpha <= 1
    return sampleGamma(alpha + 1, beta) * Math.pow(Math.random(), 1 / alpha);
  }
};

const sampleDirichlet = (alphas: number[]): number[] => {
  const samples = alphas.map((alpha) => sampleGamma(alpha, 1));
  const sum = samples.reduce((a, b) => a + b, 0);
  if (sum === 0) return alphas.map(() => 1 / alphas.length);
  return samples.map((s) => s / sum);
};

const dirichletScenarios = (name: string, alphas: number[], themeColors: ThemeColors) => {
  const primaryColor = themeColors.primaryColor;
  const secondaryColorRgbMatch = themeColors.textColorMuted.match(/\d+/g);
  const secondaryColorRgb = secondaryColorRgbMatch
    ? secondaryColorRgbMatch.join(', ')
    : '100, 116, 139';

  // Chart 1: Sampled Distributions (Stacked Bar) - CACHE THIS
  const cacheKey = `dirichlet_samples_${name}_${alphas.join('-')}`;
  if (!randomDataCache.has(cacheKey)) {
    const samples = Array.from({ length: 15 }, () => sampleDirichlet(alphas));
    randomDataCache.set(cacheKey, samples);
  }
  const samples = randomDataCache.get(cacheKey);

  const sampleData = {
    labels: samples.map((_, i: number) => `样本 ${i + 1}`),
    datasets: [
      {
        label: '类别 A',
        data: samples.map((s: number[]) => s[0]),
        backgroundColor: `rgba(${primaryColor}, 0.8)`,
      },
      {
        label: '类别 B',
        data: samples.map((s: number[]) => s[1]),
        backgroundColor: `rgba(${secondaryColorRgb}, 0.8)`,
      },
      {
        label: '类别 C',
        data: samples.map((s: number[]) => s[2]),
        backgroundColor: 'rgba(242, 169, 144, 0.8)',
      },
    ],
  };
  const sampleOptions: ChartOptions = {
    ...getBaseOptions(`样本分布 (${name})`, themeColors),
    plugins: { legend: { display: true, position: 'top' as const } },
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, title: { text: '概率' } },
    },
  };

  // Chart 2: Marginal Distributions (Line)
  const marginalLabels = createLabels(0, 1, 0.02);
  const marginalData = {
    labels: marginalLabels,
    datasets: [
      {
        ...themedLineDataset(
          `类别 A ~ Beta(${alphas[0]}, ${alphas[1] + alphas[2]})`,
          marginalLabels.map((x) => betaPDF(parseFloat(x), alphas[0], alphas[1] + alphas[2])),
          themeColors,
          { fill: false }
        ),
        borderColor: `rgba(${primaryColor}, 0.8)`,
      },
      {
        ...themedLineDataset(
          `类别 B ~ Beta(${alphas[1]}, ${alphas[0] + alphas[2]})`,
          marginalLabels.map((x) => betaPDF(parseFloat(x), alphas[1], alphas[0] + alphas[2])),
          themeColors,
          { fill: false }
        ),
        borderColor: `rgba(${secondaryColorRgb}, 0.8)`,
      },
      {
        ...themedLineDataset(
          `类别 C ~ Beta(${alphas[2]}, ${alphas[0] + alphas[1]})`,
          marginalLabels.map((x) => betaPDF(parseFloat(x), alphas[2], alphas[0] + alphas[1])),
          themeColors,
          { fill: false }
        ),
        borderColor: 'rgba(242, 169, 144, 0.8)',
      },
    ],
  };
  const marginalOptions: ChartOptions = {
    ...getBaseOptions(`边际分布 (${name})`, themeColors),
    plugins: { legend: { display: true, position: 'top' as const } },
    scales: { y: { title: { text: '概率密度' }, suggestedMax: 5.0 } },
  };

  return [
    { name: `样本 (${name})`, type: 'bar', options: sampleOptions, data: sampleData },
    { name: `边际 (${name})`, type: 'line', options: marginalOptions, data: marginalData },
  ];
};

const generateCorrelatedNormalData = (
  count: number,
  meanX: number,
  meanY: number,
  stdX: number,
  stdY: number,
  rho: number
) => {
  const data = [];
  for (let i = 0; i < count; i++) {
    const z1 = randomNormal();
    const z2 = randomNormal();
    const x = meanX + stdX * z1;
    const y = meanY + stdY * (rho * z1 + Math.sqrt(1 - rho * rho) * z2);
    data.push({ x: parseFloat(x.toFixed(2)), y: parseFloat(y.toFixed(2)) });
  }
  return data;
};

export const generateChartData = (
  distributionName: string,
  themeColors: ThemeColors,
  params: ChartParams = {}
) => {
  // FIX: Reformat space-separated color string to comma-separated for valid rgba() syntax.
  themeColors = { ...themeColors, primaryColor: themeColors.primaryColor.split(' ').join(', ') };

  const primaryColor = themeColors.primaryColor;
  const secondaryColorRgbMatch = themeColors.textColorMuted.match(/\d+/g);
  const secondaryColorRgb = secondaryColorRgbMatch
    ? secondaryColorRgbMatch.join(', ')
    : '100, 116, 139';

  switch (distributionName.split(' (')[0].split(/[:：]/)[0]) {
    case '正态分布': {
      const { mu = 0, sigma = 1 } = params;
      const normalLabels = Array.from({ length: 161 }, (_, i) => (-10 + i * 0.125).toFixed(3));
      const normalData = normalLabels.map((x) => normalPDF(parseFloat(x), mu, sigma));
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '数值';
      currentOptions.scales.y.title.text = '概率密度';
      currentOptions.scales.y.suggestedMax = Math.max(
        0.5,
        (1 / (sigma * Math.sqrt(2 * Math.PI))) * 1.2
      );
      return [
        {
          name: '交互式视图',
          type: 'line',
          options: currentOptions,
          data: {
            labels: normalLabels,
            datasets: [themedLineDataset('Probability Density', normalData, themeColors)],
          },
        },
      ];
    }
    case '帕累托分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '客户分层';
      currentOptions.scales.y.title.text = '贡献度 (%)';
      currentOptions.scales.y.suggestedMax = 100;
      return [
        {
          name: '标准80/20',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['Top 20%', 'Rest 80%'],
            datasets: [themedBarDataset('营收', [80, 20], themeColors)],
          },
        },
        {
          name: '更极端的90/10',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['Top 10%', 'Rest 90%'],
            datasets: [themedBarDataset('营收', [90, 10], themeColors)],
          },
        },
      ];
    }
    case '泊松分布': {
      const { lambda = 3 } = params;
      const maxK = Math.max(15, Math.ceil(lambda + 5 * Math.sqrt(lambda))); // Show relevant range
      const poissonLabels = Array.from({ length: maxK + 1 }, (_, i) => i.toString());
      const poissonData = poissonLabels.map((k) => poissonPMF(parseInt(k), lambda));
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '每小时事件数';
      currentOptions.scales.y.title.text = '概率';
      currentOptions.scales.y.suggestedMax = Math.max(
        0.4,
        poissonPMF(Math.floor(lambda), lambda) * 1.2
      );
      return [
        {
          name: '交互式视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: poissonLabels,
            datasets: [themedBarDataset('概率', poissonData, themeColors)],
          },
        },
      ];
    }
    case '对数正态分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '消费金额';
      currentOptions.scales.y.title.text = '概率密度';
      return [
        {
          name: '普通门店',
          type: 'line',
          options: currentOptions,
          data: {
            labels: ['1k', '5k', '10k', '20k', '50k', '100k+'],
            datasets: [themedLineDataset('频率', [0.2, 1.0, 0.7, 0.3, 0.1, 0.05], themeColors)],
          },
        },
        {
          name: '旗舰店',
          type: 'line',
          options: currentOptions,
          data: {
            labels: ['5k', '15k', '30k', '60k', '100k', '200k+'],
            datasets: [themedLineDataset('频率', [0.15, 0.8, 1.0, 0.6, 0.3, 0.15], themeColors)],
          },
        },
      ];
    }
    case '指数分布': {
      const options = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      options.scales.x.title.text = '时间间隔';
      options.scales.y.title.text = '概率密度';
      const expLabels = createLabels(0, 5, 0.25);
      const expData = expLabels.map((t) => gammaPDF(parseFloat(t), 1, 1));
      const data = {
        labels: expLabels,
        datasets: [themedLineDataset('λ=1', expData, themeColors)],
      };
      return [{ name: '默认视图', type: 'line', options, data }];
    }
    case '二项分布': {
      const options = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      options.scales.y.title.text = '概率';
      options.scales.x.title.text = '成功次数 (共10次试验)';
      const data = {
        labels: ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'],
        datasets: [
          themedBarDataset(
            'p=0.4',
            [0.006, 0.04, 0.121, 0.215, 0.251, 0.201, 0.111, 0.042, 0.011, 0.002, 0.0001],
            themeColors
          ),
        ],
      };
      return [{ name: '默认视图', type: 'bar', options, data }];
    }
    case '威布尔分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '时间 / 寿命';
      currentOptions.scales.y.title.text = '概率密度';
      currentOptions.scales.y.suggestedMax = 3.0; // Set a suggested max for stability
      const weibullLabels = createLabels(0, 4, 0.2); // More points for smoother curve
      return [
        {
          name: 'k<1 (早期)',
          type: 'line',
          options: currentOptions,
          data: {
            labels: weibullLabels,
            datasets: [
              themedLineDataset(
                'k=0.8, λ=1',
                weibullLabels.map((t) => weibullPDF(parseFloat(t), 0.8, 1)),
                themeColors
              ),
            ],
          },
        },
        {
          name: 'k=1 (随机)',
          type: 'line',
          options: currentOptions,
          data: {
            labels: weibullLabels,
            datasets: [
              themedLineDataset(
                'k=1, λ=1',
                weibullLabels.map((t) => weibullPDF(parseFloat(t), 1, 1)),
                themeColors
              ),
            ],
          },
        },
        {
          name: 'k>1 (老化)',
          type: 'line',
          options: currentOptions,
          data: {
            labels: weibullLabels,
            datasets: [
              themedLineDataset(
                'k=5, λ=2',
                weibullLabels.map((t) => weibullPDF(parseFloat(t), 5, 2)),
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case '伽马分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '等待时间';
      currentOptions.scales.y.title.text = '概率密度';
      const gammaLabels = createLabels(0, 10, 0.25);
      return [
        {
          name: 'α=1 (指数)',
          type: 'line',
          options: currentOptions,
          data: {
            labels: gammaLabels,
            datasets: [
              themedLineDataset(
                'α=1, β=1',
                gammaLabels.map((x) => gammaPDF(parseFloat(x), 1, 1)),
                themeColors
              ),
            ],
          },
        },
        {
          name: 'α=2',
          type: 'line',
          options: currentOptions,
          data: {
            labels: gammaLabels,
            datasets: [
              themedLineDataset(
                'α=2, β=1',
                gammaLabels.map((x) => gammaPDF(parseFloat(x), 2, 1)),
                themeColors
              ),
            ],
          },
        },
        {
          name: 'α=5',
          type: 'line',
          options: currentOptions,
          data: {
            labels: gammaLabels,
            datasets: [
              themedLineDataset(
                'α=5, β=1',
                gammaLabels.map((x) => gammaPDF(parseFloat(x), 5, 1)),
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case '贝塔分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '概率值 (0-1)';
      currentOptions.scales.y.title.text = '概率密度';
      currentOptions.scales.y.suggestedMax = 5.0;
      const { alpha = 2, beta = 5 } = params;
      const betaLabels = createLabels(0, 1, 0.02);
      const betaData = betaLabels.map((x) => betaPDF(parseFloat(x), alpha, beta));
      return [
        {
          name: '交互式视图',
          type: 'line',
          options: currentOptions,
          data: {
            labels: betaLabels,
            datasets: [
              themedLineDataset(
                `α=${alpha.toFixed(1)}, β=${beta.toFixed(1)}`,
                betaData,
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case '均匀分布': {
      const options = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      options.scales.y = { ...options.scales.y, min: 0, max: 1.2, ticks: { display: false } };
      const data = {
        labels: ['a', 'b'],
        datasets: [themedLineDataset('概率', [1, 1], themeColors, { stepped: true })],
      };
      return [{ name: '默认视图', type: 'line', options, data }];
    }
    case '几何分布': {
      const baseOptions = getBaseOptions(distributionName, themeColors);
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: baseOptions,
          data: {
            labels: ['1', '2', '3', '4', '5+'],
            datasets: [
              themedBarDataset('概率 (p=0.5)', [0.5, 0.25, 0.125, 0.0625, 0.0625], themeColors),
            ],
          },
        },
      ];
    }
    case '负二项分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '总咨询客户数 (目标成交3个)';
      return [
        {
          name: '高转化率(50%)',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['3', '4', '5', '6', '7', '8+'],
            datasets: [
              themedBarDataset(
                '概率',
                [0.125, 0.1875, 0.1875, 0.15625, 0.1171875, 0.2265625],
                themeColors
              ),
            ],
          },
        },
        {
          name: '低转化率(20%)',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['..10', '..15', '..20', '..25', '..30+'],
            datasets: [themedBarDataset('概率', [0.055, 0.064, 0.043, 0.024, 0.79], themeColors)],
          },
        },
      ];
    }
    case '超几何分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '抽中VIP数 (抽20人)';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['0', '1', '2', '3', '4', '5', '6+'],
            datasets: [
              themedBarDataset('概率', [0.018, 0.09, 0.21, 0.29, 0.24, 0.11, 0.042], themeColors),
            ],
          },
        },
      ];
    }
    case '多项分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '项目选择';
      currentOptions.scales.y.title.text = '选择比例 (%)';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['抗衰套餐', '美白套餐', '塑形套餐', '其他'],
            datasets: [themedBarDataset('比例', [55, 25, 15, 5], themeColors)],
          },
        },
      ];
    }
    case '学生t分布': {
      const tDistLabels = createLabels(-4, 4, 0.25);
      const tDistData = tDistLabels.map((xStr) => {
        const x = parseFloat(xStr);
        // This is a hardcoded PDF for t-distribution with df=2
        return 0.707 * Math.pow(1 + Math.pow(x, 2) / 2, -1.5);
      });
      const normalDataForT = tDistLabels.map((xStr) => normalPDF(parseFloat(xStr), 0, 1));

      const baseOptions = getBaseOptions(distributionName, themeColors);
      const customOptions = { plugins: { legend: { display: true } } };

      return [
        {
          name: '默认视图',
          type: 'line',
          options: { ...baseOptions, ...customOptions },
          data: {
            labels: tDistLabels,
            datasets: [
              themedLineDataset('t-dist (df=2)', tDistData, themeColors),
              {
                label: 'Normal',
                data: normalDataForT,
                borderColor: `rgba(${secondaryColorRgb}, 0.5)`,
                backgroundColor: 'transparent',
                fill: false,
                borderWidth: 2,
                borderDash: [5, 5],
              },
            ],
          },
        },
      ];
    }
    case '卡方分布': {
      const chartOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      return [
        {
          name: 'df=2',
          type: 'line',
          options: chartOptions,
          data: {
            labels: createLabels(0, 10, 0.5),
            datasets: [
              themedLineDataset(
                'df=2',
                createLabels(0, 10, 0.5).map((x) => 0.5 * Math.exp(-parseFloat(x) / 2)),
                themeColors
              ),
            ],
          },
        },
        {
          name: 'df=5',
          type: 'line',
          options: chartOptions,
          data: {
            labels: createLabels(0, 15, 0.5),
            datasets: [
              themedLineDataset(
                'df=5',
                createLabels(0, 15, 0.5).map(
                  (x) => (1 / 16) * parseFloat(x) * parseFloat(x) * Math.exp(-parseFloat(x) / 2)
                ),
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case 'F分布': {
      const baseOptions = getBaseOptions(distributionName, themeColors);
      return [
        {
          name: '默认视图',
          type: 'line',
          options: baseOptions,
          data: {
            labels: createLabels(0, 5, 0.2),
            datasets: [
              themedLineDataset(
                'F(5, 2)',
                createLabels(0, 5, 0.2).map((x) => {
                  const val = (12.5 * parseFloat(x)) / Math.pow(1 + 2.5 * parseFloat(x), 3.5);
                  return isFinite(val) ? val : 0;
                }),
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case '三角分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '项目耗时 (分钟)';
      return [
        {
          name: '默认视图',
          type: 'line',
          options: currentOptions,
          data: {
            labels: ['20(Min)', '30', '40(Mode)', '50', '60(Max)'],
            datasets: [
              themedLineDataset('可能性', [0, 0.5, 1, 0.5, 0], themeColors, { tension: 0 }),
            ],
          },
        },
      ];
    }
    case '齐夫定律': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '项目热门度排名';
      currentOptions.scales.y.title.text = '月销量';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['Rank 1', 'Rank 2', 'Rank 3', 'Rank 4', 'Rank 5'],
            datasets: [themedBarDataset('销量', [1000, 500, 333, 250, 200], themeColors)],
          },
        },
      ];
    }
    case '幂律分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '客户价值分层';
      currentOptions.scales.y.title.text = '贡献营收占比 (%)';
      currentOptions.scales.y.type = 'logarithmic';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['Top 1%', 'Top 2-5%', 'Top 6-20%', 'Rest 80%'],
            datasets: [themedBarDataset('营收占比', [40, 30, 20, 10], themeColors)],
          },
        },
      ];
    }
    case '耿贝尔分布': {
      const baseOptions = getBaseOptions(distributionName, themeColors);
      return [
        {
          name: '默认视图',
          type: 'line',
          options: baseOptions,
          data: {
            labels: createLabels(-2, 8, 0.5),
            datasets: [
              themedLineDataset(
                '概率',
                createLabels(-2, 8, 0.5).map((x) =>
                  Math.exp(-parseFloat(x) - Math.exp(-parseFloat(x)))
                ),
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case '逻辑斯谛分布': {
      const baseOptions = getBaseOptions(distributionName, themeColors);
      return [
        {
          name: '默认视图',
          type: 'line',
          options: baseOptions,
          data: {
            labels: createLabels(-5, 5, 0.5),
            datasets: [
              themedLineDataset(
                'CDF',
                createLabels(-5, 5, 0.5).map((x) => 1 / (1 + Math.exp(-parseFloat(x)))),
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case '柯西分布': {
      const baseOptions = getBaseOptions(distributionName, themeColors);
      return [
        {
          name: '默认视图',
          type: 'line',
          options: baseOptions,
          data: {
            labels: createLabels(-5, 5, 0.25),
            datasets: [
              themedLineDataset(
                '概率',
                createLabels(-5, 5, 0.25).map(
                  (x) => 1 / (Math.PI * (1 + parseFloat(x) * parseFloat(x)))
                ),
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case '瑞利分布': {
      const baseOptions = getBaseOptions(distributionName, themeColors);
      return [
        {
          name: '默认视图',
          type: 'line',
          options: baseOptions,
          data: {
            labels: createLabels(0, 4, 0.2),
            datasets: [
              themedLineDataset(
                'σ=1',
                createLabels(0, 4, 0.2).map(
                  (x) => parseFloat(x) * Math.exp((-parseFloat(x) * parseFloat(x)) / 2)
                ),
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case '爱尔朗分布': {
      const baseOptions = getBaseOptions(distributionName, themeColors);
      return [
        {
          name: '默认视图',
          type: 'line',
          options: baseOptions,
          data: {
            labels: createLabels(0, 10, 0.5),
            datasets: [
              themedLineDataset(
                'k=2, λ=1',
                createLabels(0, 10, 0.5).map((x) => parseFloat(x) * Math.exp(-parseFloat(x))),
                themeColors
              ),
            ],
          },
        },
      ];
    }
    case '本福特定律': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.y.title.text = '出现概率 (%)';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: { ...currentOptions, plugins: { legend: { display: true } } },
          data: {
            labels: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
            datasets: [
              themedBarDataset('真实数据', [31, 18, 13, 9, 8, 7, 6, 5, 4], themeColors),
              {
                label: '本福特预测',
                data: [30.1, 17.6, 12.5, 9.7, 7.9, 6.7, 5.8, 5.1, 4.6],
                type: 'line',
                borderColor: `rgba(${secondaryColorRgb}, 0.7)`,
                fill: false,
                pointRadius: 3,
              },
            ],
          },
        },
      ];
    }
    case '狄利克雷分布':
      return [
        ...dirichletScenarios('集中', [10, 10, 10], themeColors),
        ...dirichletScenarios('分散', [0.5, 0.5, 0.5], themeColors),
        ...dirichletScenarios('偏好A', [10, 2, 2], themeColors),
      ];
    case '多变量正态分布': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '变量 X (例如：客单价)';
      currentOptions.scales.y.title.text = '变量 Y (例如：满意度)';

      const cacheKeyPos = 'mvn_pos_29';
      if (!randomDataCache.has(cacheKeyPos)) {
        randomDataCache.set(
          cacheKeyPos,
          generateCorrelatedNormalData(50, 5000, 4.5, 1000, 0.3, 0.7)
        );
      }
      const positiveCorrData = randomDataCache.get(cacheKeyPos);

      const cacheKeyNeg = 'mvn_neg_29';
      if (!randomDataCache.has(cacheKeyNeg)) {
        randomDataCache.set(
          cacheKeyNeg,
          generateCorrelatedNormalData(50, 5000, 3.0, 1000, 0.5, -0.6)
        );
      }
      const negativeCorrData = randomDataCache.get(cacheKeyNeg);

      const posOptions: ChartOptions = {
        ...currentOptions,
        plugins: {
          ...currentOptions.plugins,
          title: { ...currentOptions.plugins?.title, text: '正相关 (客单价越高，满意度越高)' },
        },
      };
      const negOptions: ChartOptions = {
        ...currentOptions,
        plugins: {
          ...currentOptions.plugins,
          title: { ...currentOptions.plugins?.title, text: '负相关 (客单价越高，满意度越低)' },
        },
      };

      return [
        {
          name: '正相关',
          type: 'scatter',
          options: posOptions,
          data: {
            datasets: [
              {
                label: '客户数据',
                data: positiveCorrData,
                backgroundColor: `rgba(${primaryColor}, 0.7)`,
              },
            ],
          },
        },
        {
          name: '负相关',
          type: 'scatter',
          options: negOptions,
          data: {
            datasets: [
              {
                label: '客户数据',
                data: negativeCorrData,
                backgroundColor: `rgba(${secondaryColorRgb}, 0.7)`,
              },
            ],
          },
        },
      ];
    }
    case 'PERT分布': {
      const baseOptions = getBaseOptions(distributionName, themeColors);
      return [
        {
          name: '默认视图',
          type: 'line',
          options: baseOptions,
          data: {
            labels: ['乐观', ' ', '最可能', ' ', '悲观'],
            datasets: [
              themedLineDataset('概率', [0, 50, 100, 50, 0], themeColors, { tension: 0.4 }),
            ],
          },
        },
      ];
    }
    case '马尔可夫链': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.y.title.text = '客户比例 (%)';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['新客户', '活跃客户', '流失风险客户'],
            datasets: [themedBarDataset('稳态占比', [15, 60, 25], themeColors)],
          },
        },
      ];
    }
    case '案例1':
    case '模型组合': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '预测年利润 (万元)';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['0-200', '200-400', '400-600', '600-800', '800+'],
            datasets: [themedBarDataset('模拟次数', [500, 2500, 4500, 2000, 500], themeColors)],
          },
        },
      ];
    }
    case '案例2': {
      // VIP Churn Prediction
      // Chart 1: Pareto for VIP Identification
      const paretoOptions = getBaseOptions(
        'VIP客户营收贡献 (帕累托分析)',
        themeColors
      ) as WritableChartOptions;
      paretoOptions.scales.x.title.text = '客户分层';
      paretoOptions.scales.y.title.text = '营收贡献 (%)';
      const paretoData = {
        labels: ['Top 20% VIP', 'Rest 80%'],
        datasets: [themedBarDataset('营收贡献', [80, 20], themeColors)],
      };

      // Chart 2: Churn Risk Curve
      const churnOptions = getBaseOptions(
        'VIP客户流失风险曲线 (指数分布模拟)',
        themeColors
      ) as WritableChartOptions;
      churnOptions.scales.x.title.text = '距离上次消费天数';
      churnOptions.scales.y.title.text = '未流失概率';
      if (churnOptions.scales?.y) churnOptions.scales.y.max = 1;
      const churnLabels = Array.from({ length: 13 }, (_, i) => i * 30); // 0 to 360 days
      const lambda = 1 / 180; // Assume average consumption cycle is 180 days
      const churnDataValues = churnLabels.map((t) => Math.exp(-lambda * t)); // Survival function S(t) = e^(-λt)
      const churnData = {
        labels: churnLabels.map(String),
        datasets: [themedLineDataset('留存概率', churnDataValues, themeColors)],
      };

      return [
        { name: 'VIP识别', type: 'bar', options: paretoOptions, data: paretoData },
        { name: '流失预警', type: 'line', options: churnOptions, data: churnData },
      ];
    }
    case '案例3': {
      // A/B Test ROI Evaluation
      // Chart 1: Beta Distribution for Conversion Rate (using Normal Approximation for stability)
      const betaOptions = getBaseOptions(
        'A/B测试转化率后验分布 (正态近似)',
        themeColors
      ) as WritableChartOptions;
      betaOptions.scales.x.title.text = '转化率';
      betaOptions.scales.y.title.text = '概率密度';
      if (betaOptions.plugins?.legend) {
        betaOptions.plugins.legend.display = true;
      }

      // Normal Approximation parameters
      const alphaA = 51,
        betaA = 951;
      const muA = alphaA / (alphaA + betaA);
      const sigmaA = Math.sqrt(
        (alphaA * betaA) / (Math.pow(alphaA + betaA, 2) * (alphaA + betaA + 1))
      );

      const alphaB = 71,
        betaB = 931;
      const muB = alphaB / (alphaB + betaB);
      const sigmaB = Math.sqrt(
        (alphaB * betaB) / (Math.pow(alphaB + betaB, 2) * (alphaB + betaB + 1))
      );

      const minX = Math.min(muA - 4 * sigmaA, muB - 4 * sigmaB);
      const maxX = Math.max(muA + 4 * sigmaA, muB + 4 * sigmaB);
      const step = (maxX - minX) / 100;
      const betaLabels = Array.from({ length: 101 }, (_, i) => (minX + i * step).toFixed(4));

      const betaDataA = betaLabels.map((x) => normalPDF(parseFloat(x), muA, sigmaA));
      const betaDataB = betaLabels.map((x) => normalPDF(parseFloat(x), muB, sigmaB));

      const betaData = {
        labels: betaLabels,
        datasets: [
          {
            ...themedLineDataset('方案A (5%转化)', betaDataA, themeColors),
            borderColor: `rgba(${secondaryColorRgb}, 0.8)`,
            backgroundColor: `rgba(${secondaryColorRgb}, 0.2)`,
          },
          themedLineDataset('方案B (7%转化)', betaDataB, themeColors),
        ],
      };

      // Chart 2: ROI Simulation Histogram
      const roiOptions = getBaseOptions('ROI模拟结果分布', themeColors) as WritableChartOptions;
      roiOptions.scales.x.title.text = '预期ROI (%)';
      roiOptions.scales.y.title.text = '模拟次数';
      if (roiOptions.plugins?.legend) {
        roiOptions.plugins.legend.display = true;
      }
      const roiData = {
        labels: ['-10-0%', '0-10%', '10-20%', '20-30%', '30-40%', '40%+'],
        datasets: [
          {
            ...themedBarDataset('方案A ROI', [100, 800, 1500, 1000, 400, 100], themeColors),
            backgroundColor: `rgba(${secondaryColorRgb}, 0.6)`,
            borderColor: `rgba(${secondaryColorRgb}, 1)`,
          },
          { ...themedBarDataset('方案B ROI', [50, 200, 800, 2000, 1500, 500], themeColors) },
        ],
      };

      return [
        { name: '转化率比较', type: 'line', options: betaOptions, data: betaData },
        { name: 'ROI分布', type: 'bar', options: roiOptions, data: roiData },
      ];
    }
    case '思维框架': {
      // For "思维框架：贝叶斯推断"
      const bayesOptions = getBaseOptions(
        '贝叶斯更新：转化率认知变化',
        themeColors
      ) as WritableChartOptions;
      bayesOptions.scales.x.title.text = '转化率';
      bayesOptions.scales.y.title.text = '信念强度 (概率密度)';
      if (bayesOptions.plugins?.legend) {
        bayesOptions.plugins.legend.display = true;
      }
      const bayesLabels = createLabels(0, 0.2, 0.002); // More focused range

      // Prior belief: Vaguely believe it's around 20%, but with high uncertainty.
      const priorAlpha = 2;
      const priorBeta = 8;
      // Evidence: 100 trials, 2 successes
      const successes = 2;
      const failures = 98;
      // Posterior belief
      const posteriorAlpha = priorAlpha + successes;
      const posteriorBeta = priorBeta + failures;

      const priorData = bayesLabels.map((x) => betaPDF(parseFloat(x), priorAlpha, priorBeta));
      const posteriorData = bayesLabels.map((x) =>
        betaPDF(parseFloat(x), posteriorAlpha, posteriorBeta)
      );

      const bayesChartData = {
        labels: bayesLabels,
        datasets: [
          {
            ...themedLineDataset(
              `先验信念: Beta(${priorAlpha}, ${priorBeta})`,
              priorData,
              themeColors,
              { fill: true }
            ),
            borderColor: `rgba(${secondaryColorRgb}, 0.8)`,
            backgroundColor: `rgba(${secondaryColorRgb}, 0.2)`,
          },
          themedLineDataset(
            `后验信念: Beta(${posteriorAlpha}, ${posteriorBeta})`,
            posteriorData,
            themeColors,
            { fill: true }
          ),
        ],
      };

      return [{ name: '认知更新', type: 'line', options: bayesOptions, data: bayesChartData }];
    }
    case 'RFM模型': {
      // RFM
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '客户分群';
      currentOptions.scales.y.title.text = '客户数量';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['重要价值客户', '重要挽留客户', '潜力客户', '新客户', '一般挽留客户'],
            datasets: [themedBarDataset('数量', [120, 80, 250, 300, 150], themeColors)],
          },
        },
      ];
    }
    case '线性回归': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '广告投入 (万元)';
      currentOptions.scales.y.title.text = '新客数量';
      const cacheKey = 'scatterData_37';
      if (!randomDataCache.has(cacheKey)) {
        const data = Array.from({ length: 20 }, (_, i) => {
          const x = (i + 1) * 5;
          const y_base = x * 1.5;
          const y_noise = (Math.random() - 0.5) * 40;
          return { x: x, y: Math.max(0, y_base + y_noise) };
        });
        randomDataCache.set(cacheKey, data);
      }
      const scatterData = randomDataCache.get(cacheKey);
      return [
        {
          name: '默认视图',
          type: 'scatter',
          options: { ...currentOptions, plugins: { legend: { display: true } } },
          data: {
            datasets: [
              {
                type: 'scatter',
                label: '实际数据',
                data: scatterData,
                backgroundColor: `rgba(${primaryColor}, 0.6)`,
              },
              {
                type: 'line',
                label: '回归趋势线',
                data: [
                  { x: 0, y: 7.5 },
                  { x: 100, y: 157.5 },
                ],
                borderColor: `rgba(${secondaryColorRgb}, 0.8)`,
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                tension: 0,
              },
            ],
          },
        },
      ];
    }
    case '逻辑回归': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '优惠力度 (%)';
      currentOptions.scales.y.title.text = '购买概率';
      if (currentOptions.scales?.y) currentOptions.scales.y.max = 1;
      const logisticPoints = [
        { x: 5, y: 0.1 },
        { x: 10, y: 0 },
        { x: 15, y: 0.2 },
        { x: 20, y: 0.4 },
        { x: 25, y: 0.3 },
        { x: 30, y: 0.8 },
        { x: 35, y: 0.7 },
        { x: 40, y: 0.9 },
        { x: 45, y: 1 },
        { x: 50, y: 0.95 },
      ];
      const s_curve = Array.from({ length: 11 }, (_, i) => ({
        x: i * 5,
        y: 1 / (1 + Math.exp(-(i * 5 - 25) / 8)),
      }));
      return [
        {
          name: '默认视图',
          type: 'scatter',
          options: { ...currentOptions, plugins: { legend: { display: true } } },
          data: {
            datasets: [
              {
                type: 'scatter',
                label: '客户选择 (1=买)',
                data: logisticPoints,
                backgroundColor: `rgba(${primaryColor}, 0.6)`,
              },
              {
                type: 'line',
                label: '预测概率',
                data: s_curve,
                borderColor: `rgba(${secondaryColorRgb}, 0.8)`,
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
              },
            ],
          },
        },
      ];
    }
    case '随机森林': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.indexAxis = 'y';
      currentOptions.scales.x.title.text = '特征重要性';
      currentOptions.scales.y.title.text = '影响因素';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['最近消费(R)', '消费总额(M)', '消费频率(F)', '首次消费距今', '平均客单价'],
            datasets: [themedBarDataset('重要性', [0.45, 0.25, 0.15, 0.1, 0.05], themeColors)],
          },
        },
      ];
    }
    case 'K-均值聚类': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '消费频率';
      currentOptions.scales.y.title.text = '消费总额';
      const cacheKey_c1 = 'kmeans_c1_40';
      const cacheKey_c2 = 'kmeans_c2_40';
      const cacheKey_c3 = 'kmeans_c3_40';

      if (!randomDataCache.has(cacheKey_c1)) {
        randomDataCache.set(
          cacheKey_c1,
          Array.from({ length: 15 }, () => ({
            x: 2 + Math.random() * 2,
            y: 2000 + Math.random() * 2000,
          }))
        );
        randomDataCache.set(
          cacheKey_c2,
          Array.from({ length: 15 }, () => ({
            x: 8 + Math.random() * 3,
            y: 10000 + Math.random() * 5000,
          }))
        );
        randomDataCache.set(
          cacheKey_c3,
          Array.from({ length: 15 }, () => ({
            x: 15 + Math.random() * 4,
            y: 4000 + Math.random() * 3000,
          }))
        );
      }

      const c1 = randomDataCache.get(cacheKey_c1);
      const c2 = randomDataCache.get(cacheKey_c2);
      const c3 = randomDataCache.get(cacheKey_c3);
      return [
        {
          name: '默认视图',
          type: 'scatter',
          options: { ...currentOptions, plugins: { legend: { display: true } } },
          data: {
            datasets: [
              {
                label: '群体A (价格敏感)',
                data: c1,
                backgroundColor: `rgba(${primaryColor}, 0.7)`,
              },
              {
                label: '群体B (高价值)',
                data: c2,
                backgroundColor: `rgba(${secondaryColorRgb}, 0.7)`,
              },
              { label: '群体C (高频低价)', data: c3, backgroundColor: 'rgba(242, 169, 144, 0.7)' },
            ],
          },
        },
      ];
    }
    case '时间序列预测': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '月份';
      currentOptions.scales.y.title.text = '营收 (万元)';
      const historical = [20, 22, 25, 23, 28, 30, 35, 33, 38, 40, 45, 42];
      const forecast = [
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        null,
        42,
        48,
        50,
        55,
      ];
      return [
        {
          name: '默认视图',
          type: 'line',
          options: { ...currentOptions, plugins: { legend: { display: true } } },
          data: {
            labels: [
              'Jan',
              'Feb',
              'Mar',
              'Apr',
              'May',
              'Jun',
              'Jul',
              'Aug',
              'Sep',
              'Oct',
              'Nov',
              'Dec',
              'Jan(F)',
              'Feb(F)',
              'Mar(F)',
            ],
            datasets: [
              themedLineDataset('历史营收', historical, themeColors, { fill: false }),
              {
                label: '预测营收',
                data: forecast,
                borderColor: `rgba(${secondaryColorRgb}, 0.7)`,
                borderDash: [5, 5],
                backgroundColor: 'transparent',
                fill: false,
              },
            ],
          },
        },
      ];
    }
    case '朴素贝叶斯分类器': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.y.title.text = '预测概率';
      currentOptions.scales.x.title.text = '客户画像';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['高价值潜力', '价格敏感', '流失风险'],
            datasets: [themedBarDataset('属于该分类的概率', [75, 15, 10], themeColors)],
          },
        },
      ];
    }
    case '客户终身价值': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '客户分群 (基于早期行为)';
      currentOptions.scales.y.title.text = '预测终身价值 (元)';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['高潜力新客', '普通新客', '低潜力新客', '高价值老客', '普通老客'],
            datasets: [
              themedBarDataset('预测CLV', [85000, 35000, 8000, 150000, 60000], themeColors),
            ],
          },
        },
      ];
    }
    case '市场购物篮分析': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '项目关联规则';
      currentOptions.scales.y.title.text = '置信度 (%)';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: [
              '热玛吉 -> 水光针',
              '玻尿酸 -> 肉毒素',
              '光子嫩肤 -> 医用面膜',
              '线雕 -> 玻尿酸',
            ],
            datasets: [themedBarDataset('购买A后购买B的概率', [35, 45, 60, 25], themeColors)],
          },
        },
      ];
    }
    case '生存分析': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '距上次消费天数';
      currentOptions.scales.y.title.text = '客户留存率 (%)';
      return [
        {
          name: '默认视图',
          type: 'line',
          options: currentOptions,
          data: {
            labels: ['0', '30', '60', '90', '180', '365'],
            datasets: [
              themedLineDataset('客户留存曲线', [100, 85, 70, 58, 40, 25], themeColors, {
                stepped: true,
                fill: true,
              }),
            ],
          },
        },
      ];
    }
    case '联合分析': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.indexAxis = 'y';
      currentOptions.scales.x.title.text = '相对重要性';
      currentOptions.scales.y.title.text = '产品属性';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['价格', '效果持久性', '品牌知名度', '医生经验', '服务体验'],
            datasets: [themedBarDataset('重要性得分', [40, 25, 15, 12, 8], themeColors)],
          },
        },
      ];
    }
    case '主成分分析': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '主成分1 (服务与价格)';
      currentOptions.scales.y.title.text = '主成分2 (效果与品牌)';
      const cacheKey_c1 = 'pca_c1_48';
      const cacheKey_c2 = 'pca_c2_48';

      if (!randomDataCache.has(cacheKey_c1)) {
        randomDataCache.set(
          cacheKey_c1,
          Array.from({ length: 20 }, () => ({ x: randomNormal(2, 1), y: randomNormal(-2, 1) }))
        );
        randomDataCache.set(
          cacheKey_c2,
          Array.from({ length: 20 }, () => ({ x: randomNormal(-2, 1), y: randomNormal(2, 1) }))
        );
      }

      const pca_c1 = randomDataCache.get(cacheKey_c1);
      const pca_c2 = randomDataCache.get(cacheKey_c2);
      return [
        {
          name: '默认视图',
          type: 'scatter',
          options: { ...currentOptions, plugins: { legend: { display: true } } },
          data: {
            datasets: [
              {
                label: '群体A (价格敏感)',
                data: pca_c1,
                backgroundColor: `rgba(${primaryColor}, 0.7)`,
              },
              {
                label: '群体B (效果至上)',
                data: pca_c2,
                backgroundColor: `rgba(${secondaryColorRgb}, 0.7)`,
              },
            ],
          },
        },
      ];
    }
    case '支持向量机': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '特征 A (消费频率)';
      currentOptions.scales.y.title.text = '特征 B (平均客单价)';
      const cacheKey_c1 = 'svm_c1_49';
      const cacheKey_c2 = 'svm_c2_49';

      if (!randomDataCache.has(cacheKey_c1)) {
        randomDataCache.set(
          cacheKey_c1,
          Array.from({ length: 15 }, () => ({ x: randomNormal(3, 1), y: randomNormal(3, 1) }))
        );
        randomDataCache.set(
          cacheKey_c2,
          Array.from({ length: 15 }, () => ({ x: randomNormal(7, 1), y: randomNormal(7, 1) }))
        );
      }

      const svm_c1 = randomDataCache.get(cacheKey_c1);
      const svm_c2 = randomDataCache.get(cacheKey_c2);
      return [
        {
          name: '默认视图',
          type: 'scatter',
          options: { ...currentOptions, plugins: { legend: { display: true } } },
          data: {
            datasets: [
              {
                type: 'scatter',
                label: '普通客户',
                data: svm_c1,
                backgroundColor: `rgba(${secondaryColorRgb}, 0.7)`,
              },
              {
                type: 'scatter',
                label: 'VIP客户',
                data: svm_c2,
                backgroundColor: `rgba(${primaryColor}, 0.7)`,
              },
              {
                type: 'line',
                label: '决策边界',
                data: [
                  { x: 10, y: 0 },
                  { x: 0, y: 10 },
                ],
                borderColor: 'rgba(239, 68, 68, 0.8)',
                borderWidth: 2,
                fill: false,
                pointRadius: 0,
                tension: 0,
              },
            ],
          },
        },
      ];
    }
    case '增益模型': {
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '客户群体';
      currentOptions.scales.y.title.text = '营销增益 (Uplift)';
      return [
        {
          name: '默认视图',
          type: 'bar',
          options: currentOptions,
          data: {
            labels: ['说服者', '铁粉', '无动不衷者', '反感者'],
            datasets: [themedBarDataset('转化率提升', [15, 1, -0.5, -2], themeColors)],
          },
        },
      ];
    }
    case 'Cox比例风险模型': {
      const highRisk = [100, 90, 70, 40, 20, 10];
      const lowRisk = [100, 98, 95, 90, 85, 80];
      const currentOptions = getBaseOptions(distributionName, themeColors) as WritableChartOptions;
      currentOptions.scales.x.title.text = '时间 (月)';
      currentOptions.scales.y.title.text = '留存概率';
      return [
        {
          name: '默认视图',
          type: 'line',
          options: { ...currentOptions, plugins: { legend: { display: true } } },
          data: {
            labels: ['0', '3', '6', '9', '12', '15'],
            datasets: [
              {
                label: '高风险组',
                data: highRisk,
                borderColor: 'rgba(239, 68, 68, 0.7)',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                fill: true,
                pointRadius: 2,
              },
              {
                label: '低风险组',
                data: lowRisk,
                borderColor: `rgb(${themeColors.primaryColor})`,
                backgroundColor: `rgba(${themeColors.primaryColor}, 0.2)`,
                fill: true,
                pointRadius: 2,
              },
            ],
          },
        },
      ];
    }
    case 'A/B测试计算器':
      return []; // No default chart, handled by special component
    default:
      return null;
  }
};
