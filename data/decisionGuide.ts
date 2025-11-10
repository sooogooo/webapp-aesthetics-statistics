import type { DecisionGuideCategory } from '../types';

export const decisionGuideData: DecisionGuideCategory[] = [
  {
    category: '市场与营销',
    icon: 'campaign',
    problems: [
      {
        question: 'A文案和B文案，哪个转化效果更好？',
        tools: [
          { id: 44, name: 'A/B测试计算器' },
          { id: 9, name: '贝塔分布' },
          { id: 35, name: '贝叶斯推断' },
        ],
        explanation:
          '使用A/B测试计算器，输入两组数据，即可获得科学的结论。其背后是贝叶斯推断和贝塔分布，能在小样本情况下给出更可靠的判断。',
      },
      {
        question: '如何设计更受欢迎的项目套餐？',
        tools: [
          { id: 45, name: '市场购物篮分析' },
          { id: 14, name: '多项分布' },
        ],
        explanation:
          '通过市场购物篮分析发现项目之间的强关联规则，再结合多项分布了解客户对现有套餐的偏好，设计出更具吸引力的产品组合。',
      },
      {
        question: '如何为新项目或服务科学定价？',
        tools: [
          { id: 18, name: '三角分布' },
          { id: 28, name: 'PERT分布' },
          { id: 1, name: '正态分布' },
        ],
        explanation:
          '在缺少历史数据时，使用三角或PERT分布进行初步估算。当数据充足时，分析客户心理价位的正态分布来找到最优价格区间。',
      },
      {
        question: '市场活动预算应该投入多少？',
        tools: [
          { id: 37, name: '线性回归' },
          { id: 33, name: '案例3: ROI评估' },
        ],
        explanation:
          '利用线性回归分析投入与产出（如新客数）的关系，并结合A/B测试的ROI评估案例，做出数据驱动的预算决策。',
      },
      {
        question: '如何找到新的潜在客户群体？',
        tools: [
          { id: 40, name: 'K-均值聚类' },
          { id: 29, name: '多变量正态分布' },
        ],
        explanation:
          '使用K-均值聚类对现有客户进行无监督分群，可以发现未曾预料到的客户画像和市场细分机会。',
      },
    ],
  },
  {
    category: '运营与效率',
    icon: 'monitoring',
    problems: [
      {
        question: '如何优化前台排班，减少客户等待时间？',
        tools: [
          { id: 3, name: '泊松分布' },
          { id: 4, name: '指数分布' },
          { id: 25, name: '爱尔朗分布' },
        ],
        explanation:
          '用泊松分布预测单位时间内的到客数，用指数分布分析服务时长，最终用爱尔朗分布优化整个排队和服务流程。',
      },
      {
        question: '如何预测未来一个季度的营收？',
        tools: [
          { id: 41, name: '时间序列预测' },
          { id: 31, name: '案例1: 新店营收预测' },
        ],
        explanation:
          '使用时间序列模型（如ARIMA）分析历史数据的趋势和季节性。对于新业务，可参考新店营收预测的案例，进行蒙特卡洛模拟。',
      },
      {
        question: '如何优化消耗品（如玻尿酸）的库存管理？',
        tools: [
          { id: 1, name: '正态分布' },
          { id: 3, name: '泊松分布' },
        ],
        explanation:
          '分析月度或周度消耗量的正态分布，以设定安全库存和再订货点。泊松分布可用于预测突发性需求的发生概率。',
      },
      {
        question: '如何判断财务数据是否存在异常或作假？',
        tools: [
          { id: 26, name: '本福特定律' },
          { id: 23, name: '柯西分布' },
        ],
        explanation:
          '应用本福特定律对财务报表进行初步筛选，识别不自然的数字分布。同时，理解柯西分布，警惕那些可能极大影响结果的极端异常值。',
      },
    ],
  },
  {
    category: '客户与服务',
    icon: 'groups',
    problems: [
      {
        question: '如何识别我的高价值客户是谁？',
        tools: [
          { id: 2, name: '帕累托分布' },
          { id: 36, name: 'RFM模型' },
          { id: 43, name: '客户终身价值(CLV)预测' },
        ],
        explanation:
          '用帕累托（80/20法则）确认高价值客户的存在，用RFM模型进行快速分层，并用CLV模型预测客户未来的总价值，从“过去”和“未来”两个维度锁定核心客户。',
      },
      {
        question: '如何有效预测并降低客户流失率？',
        tools: [
          { id: 46, name: '生存分析' },
          { id: 38, name: '逻辑回归' },
          { id: 32, name: '案例2: VIP流失预警' },
        ],
        explanation:
          '使用生存分析找到客户流失的“高危期”，再结合逻辑回归预测具体某个客户的流失概率，最终建立起主动的流失干预系统。',
      },
      {
        question: '哪个渠道来的客户质量最高？',
        tools: [
          { id: 46, name: '生存分析' },
          { id: 43, name: '客户终身价值(CLV)预测' },
          { id: 16, name: '卡方分布' },
        ],
        explanation:
          '不要只看转化率！用生存分析比较不同渠道客户的“存活”时间，用CLV模型预测他们的未来总价值，这才是衡量渠道质量的黄金标准。',
      },
      {
        question: '如何为客户做个性化的项目推荐？',
        tools: [
          { id: 45, name: '市场购物篮分析' },
          { id: 39, name: '随机森林' },
        ],
        explanation:
          '通过购物篮分析发现项目间的自然关联。对于更复杂的推荐，可使用随机森林模型，综合客户多个特征预测其对新项目的兴趣度。',
      },
    ],
  },
];
