import type { LearningPath } from '../types';

export const learningPathData: LearningPath[] = [
  {
    id: 'manager',
    title: '新任店长的数据化运营第一课',
    description: '掌握核心数据模型，从排班、客户管理到营销复盘，全面提升门店运营效率和盈利能力。',
    icon: 'store',
    audience: '新任店长',
    steps: [
      {
        modelId: 3,
        title: 'Step 1: 科学排班',
        description:
          '学习使用泊松分布预测不同时段的客流量，告别“拍脑袋”式排班，确保高峰期人手充足，低谷期成本可控。',
      },
      {
        modelId: 2,
        title: 'Step 2: 识别核心客户',
        description:
          '运用帕累托分布（80/20法则）找出为您贡献80%利润的20%VIP客户，将有限的服务资源精准投入。',
      },
      {
        modelId: 36,
        title: 'Step 3: 客户精细化分层',
        description:
          '学习RFM模型，将客户分为不同价值层级，并采取针对性的维护策略，有效提升客户忠诚度和生命周期价值。',
      },
      {
        modelId: 46,
        title: 'Step 4: 主动流失干预',
        description: '通过生存分析，识别客户流失的“高危期”，在关键节点采取主动措施，防患于未然。',
      },
      {
        modelId: 37,
        title: 'Step 5: 评估营销效果',
        description: '通过线性回归分析广告投入与新客数量的关系，量化ROI，让每一分钱都花在刀刃上。',
      },
      {
        modelId: 44,
        title: 'Step 6: 优化营销活动',
        description: '利用A/B测试计算器，科学对比不同文案或优惠方案的效果，持续优化营销转化率。',
      },
    ],
  },
  {
    id: 'consultant',
    title: '金牌咨询师的成单秘籍',
    description: '从预测成交率到项目关联推荐，用数据武装你的沟通技巧，显著提升个人业绩。',
    icon: 'support_agent',
    audience: '金牌咨询师',
    steps: [
      {
        modelId: 38,
        title: 'Step 1: 预测成交概率',
        description:
          '学习逻辑回归，根据客户特征判断其购买可能性。高概率客户重点跟进，低概率客户策略性放弃，提升时间效率。',
      },
      {
        modelId: 45,
        title: 'Step 2: 挖掘项目关联',
        description:
          '掌握市场购物篮分析，了解客户购买A项目后最可能购买哪个B项目，进行科学、自然的交叉销售，提升客单价。',
      },
      {
        modelId: 47,
        title: 'Step 3: 洞察客户真实偏好',
        description:
          '学习联合分析，了解客户在“价格、品牌、效果”之间如何权衡，从而设计出更有吸引力的个性化方案。',
      },
      {
        modelId: 9,
        title: 'Step 4: 判断方案优劣',
        description:
          '当测试新话术或新方案时，学习使用贝塔分布，在样本少的情况下科学判断哪个方案的成功率更高。',
      },
      {
        modelId: 43,
        title: 'Step 5: 识别未来之星',
        description:
          '了解客户终身价值（CLV）模型，识别那些虽然首次消费不高但未来潜力巨大的客户，进行长期培养。',
      },
      {
        modelId: 50,
        title: 'Step 6: 精准营销干预',
        description:
          '掌握增益模型，识别哪些客户是需要优惠券才会购买的“说服者”，避免向“铁粉”浪费营销资源。',
      },
    ],
  },
  {
    id: 'data-analyst',
    title: '数据分析师的工具箱',
    description:
      '从数据清洗到模型构建，掌握一套完整的数据分析流程，将原始数据转化为有价值的商业洞察。',
    icon: 'analytics',
    audience: '数据分析师',
    steps: [
      {
        modelId: 48,
        title: 'Step 1: 数据降维',
        description:
          '学习主成分分析(PCA)，在聚类或回归前对高维特征进行降维，提高模型效率和稳定性。',
      },
      {
        modelId: 40,
        title: 'Step 2: 客户分群探索',
        description:
          '使用K-均值聚类对无标签的客户数据进行探索性分析，发现自然的客户群体和市场细分机会。',
      },
      {
        modelId: 39,
        title: 'Step 3: 构建预测模型',
        description:
          '学习使用随机森林等集成模型，综合多个客户特征来预测关键业务指标，如客户流失率或终身价值。',
      },
      {
        modelId: 41,
        title: 'Step 4: 掌握业务节律',
        description:
          '利用时间序列分析（ARIMA）预测未来业绩，识别业务的季节性波动和长期趋势，为运营规划提供依据。',
      },
      {
        modelId: 51,
        title: 'Step 5: 深度归因分析',
        description:
          '使用Cox比例风险模型，从生存分析更进一步，量化不同因素对客户流失风险的影响程度。',
      },
    ],
  },
  {
    id: 'decision-maker',
    title: '机构决策者的战略罗盘',
    description:
      '超越日常运营，学习使用战略级模型，在充满不确定性的市场中做出更科学、更长远的决策。',
    icon: 'gavel',
    audience: '机构决策者',
    steps: [
      {
        modelId: 34,
        title: 'Step 1: 模拟未来场景',
        description:
          '掌握蒙特卡洛模拟，对新店投资、新项目上线等重大决策进行风险评估，看清各种可能性下的收益与亏损。',
      },
      {
        modelId: 35,
        title: 'Step 2: 动态调整认知',
        description:
          '理解贝叶斯推断的思维方式，从小样本数据开始，动态地更新对市场、对项目的判断，快速迭代决策。',
      },
      {
        modelId: 22,
        title: 'Step 3: 判断市场阶段',
        description:
          '运用逻辑斯谛分布（S型曲线），判断一个项目或一家机构正处于市场导入期、快速增长期还是成熟饱和期。',
      },
      {
        modelId: 30,
        title: 'Step 4: 预测客户路径',
        description:
          '利用马尔可夫链分析客户在不同生命周期状态间的转移，从战略高度设计客户旅程，最大化客户总价值。',
      },
      {
        modelId: 50,
        title: 'Step 5: 追求营销净增量',
        description:
          '学习增益模型，确保营销投入能带来“纯粹的”增量，而不是补贴那些本就会消费的客户，最大化ROI。',
      },
      {
        modelId: 21,
        title: 'Step 6: 应对极端风险',
        description:
          '学习耿贝尔等极值分布，为“黑天鹅”事件做准备，评估并管理那些虽然概率小但影响巨大的风险。',
      },
    ],
  },
  {
    id: 'investor',
    title: '行业投资者的增长雷达',
    description: '从宏观视角审视医美业务，学习评估机构的增长潜力和运营健康度的关键模型。',
    icon: 'insights',
    audience: '行业投资者',
    steps: [
      {
        modelId: 5,
        title: 'Step 1: 评估营收结构',
        description:
          '通过对数正态分布和帕累托分布，分析机构的客户消费结构是否健康，是否存在对少数超级VIP的过度依赖。',
      },
      {
        modelId: 22,
        title: 'Step 2: 判断成长阶段',
        description:
          '运用逻辑斯谛分布（S型曲线），判断一个项目或一家机构正处于市场导入期、快速增长期还是成熟饱和期。',
      },
      {
        modelId: 46,
        title: 'Step 3: 衡量客户粘性',
        description:
          '通过生存分析深入了解客户的留存状况，这是判断机构长期健康度和护城河的关键指标。',
      },
      {
        modelId: 43,
        title: 'Step 4: 量化未来价值',
        description:
          '核心是理解并评估机构的客户终身价值（CLV）模型，这是衡量其获客效率和未来盈利能力的核心。',
      },
      {
        modelId: 51,
        title: 'Step 5: 识别核心风险',
        description: '通过Cox比例风险模型，识别影响客户流失的关键风险因子，评估机构运营的稳健性。',
      },
      {
        modelId: 39,
        title: 'Step 6: 洞察业务驱动力',
        description: '学习随机森林的特征重要性，快速理解驱动该机构业务增长的核心变量是什么。',
      },
    ],
  },
  {
    id: 'ai-analyst',
    title: 'AI数据分析师进阶之路',
    description: '掌握机器学习核心算法，构建自动化、智能化的数据分析系统，赋能业务增长。',
    icon: 'smart_toy',
    audience: 'AI数据分析师',
    steps: [
      {
        modelId: 42,
        title: 'Step 1: 自动化文本分类',
        description:
          '学习朴素贝叶斯分类器，对用户评论、咨询记录等文本数据进行情感分析和意图识别，实现大规模用户洞察。',
      },
      {
        modelId: 48,
        title: 'Step 2: 高维数据预处理',
        description:
          '掌握主成分分析(PCA)，在建模前对数据进行降维和去噪，提升后续算法的性能和可解释性。',
      },
      {
        modelId: 40,
        title: 'Step 3: 无监督客户聚类',
        description: '精通K-均值聚类，从多维度数据中自动发现有商业价值的客户群体，赋能个性化营销。',
      },
      {
        modelId: 39,
        title: 'Step 4: 高精度预测建模',
        description:
          '掌握随机森林，构建高精度的预测模型，解决如“客户会不会买”、“客户会流失吗”等核心二元分类问题。',
      },
      {
        modelId: 49,
        title: 'Step 5: 探索替代模型',
        description: '学习支持向量机(SVM)，作为处理非线性和高维数据分类问题的强大备选方案。',
      },
      {
        modelId: 50,
        title: 'Step 6: 追求营销增量',
        description:
          '进阶学习增益模型(Uplift Modeling)，将模型应用的目标从“预测”提升到“干预”，实现营销ROI最大化。',
      },
    ],
  },
  {
    id: 'technical-doctor',
    title: '技术型医生的临床数据循证',
    description: '掌握评估临床效果、设备稳定性及新技术有效性的统计工具，用数据驱动技术精进。',
    icon: 'biotech',
    audience: '技术型医生',
    steps: [
      {
        modelId: 15,
        title: 'Step 1: 小样本临床验证',
        description:
          '学习学生t分布，在小样本临床试验中科学地判断新技术或新方法的有效性是否具有统计学意义。',
      },
      {
        modelId: 17,
        title: 'Step 2: 评估治疗稳定性',
        description: '运用F分布比较不同设备或操作手法的效果方差，量化治疗结果的稳定性和可重复性。',
      },
      {
        modelId: 7,
        title: 'Step 3: 预测耗材与效果持久性',
        description:
          '掌握威布尔分布，分析填充剂、线材等产品的效果衰退模式，为客户提供更精准的维持时间预测。',
      },
      {
        modelId: 46,
        title: 'Step 4: 分析效果“存活”曲线',
        description: '通过生存分析，客观评估不同治疗方案的远期效果留存率，为方案优化提供数据依据。',
      },
      {
        modelId: 51,
        title: 'Step 5: 探究风险因素',
        description:
          '应用Cox比例风险模型，分析不同患者特征或治疗细节对术后效果复发风险的影响，实现个性化风险评估。',
      },
    ],
  },
  {
    id: 'business-doctor',
    title: '经营型医生的价值转化之路',
    description:
      '将临床技术与商业价值挂钩，学习如何量化医疗服务对客户终身价值的贡献，实现个人与机构的双赢。',
    icon: 'medication',
    audience: '经营型医生',
    steps: [
      {
        modelId: 43,
        title: 'Step 1: 理解客户终身价值 (CLV)',
        description:
          '学习CLV预测模型，理解如何通过优质的医疗服务，将一次性客户转化为高价值的终身客户。',
      },
      {
        modelId: 45,
        title: 'Step 2: 设计高价值项目组合',
        description:
          '通过市场购物篮分析，发现客户在接受核心治疗后最可能需要的辅助项目，设计科学的项目组合以提升综合价值。',
      },
      {
        modelId: 37,
        title: 'Step 3: 量化技术与回报',
        description:
          '运用线性回归，分析特定技术操作的熟练度、时间投入与客户满意度、复购率之间的关系，证明技术的商业价值。',
      },
      {
        modelId: 36,
        title: 'Step 4: 参与高价值客户维护',
        description:
          '了解RFM模型，与运营团队协作，从专业角度为机构的“重要价值客户”提供专属医学建议和长期规划。',
      },
      {
        modelId: 50,
        title: 'Step 5: 提升干预有效性',
        description:
          '学习增益模型，理解对哪些客户进行主动的术后关怀或复诊提醒，能最有效地提升其复购率和忠诚度。',
      },
    ],
  },
  {
    id: 'pro-consumer',
    title: '专业消费者的理性决策指南',
    description:
      '看懂机构宣传数据背后的真相，学习如何评估项目效果和风险，做出最适合自己的、理性的消费决策。',
    icon: 'psychology',
    audience: '专业消费者',
    steps: [
      {
        modelId: 1,
        title: 'Step 1: 理解“平均”效果',
        description:
          '学习正态分布，理解大多数人的治疗效果会集中在平均值附近，理性看待宣传中的“最佳案例”。',
      },
      {
        modelId: 44,
        title: 'Step 2: 辨别宣传方案优劣',
        description:
          '了解A/B测试计算器的原理，当机构宣称“新方案效果提升20%”时，能判断其结论是否可靠。',
      },
      {
        modelId: 46,
        title: 'Step 3: 评估效果持久性',
        description:
          '通过生存分析的视角，询问并理解不同项目效果随时间衰减的曲线，而不仅仅是一个“平均维持X个月”的模糊数字。',
      },
      {
        modelId: 6,
        title: 'Step 4: 判断成功概率',
        description:
          '学习二项分布，当被告知一个项目的“成功率”时，能理解在自己身上实现该结果的实际可能性。',
      },
      {
        modelId: 38,
        title: 'Step 5: 了解个性化概率',
        description:
          '理解逻辑回归思想，明白“成功率”不是对每个人都一样，它会受到年龄、皮肤状况等个人因素的影响。',
      },
    ],
  },
];
