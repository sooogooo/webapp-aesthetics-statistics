
export interface PromptTemplate {
  id: string;
  title: string;
  basePrompt: string;
}

export interface PromptCategory {
  id: string;
  name: string;
  icon: string;
  templates: PromptTemplate[];
}

export const promptData: PromptCategory[] = [
  {
    id: 'results',
    name: '项目效果图',
    icon: 'auto_awesome',
    templates: [
      { id: 'res_aqua', title: '水光针效果', basePrompt: '一位亚洲女性的面部特写，皮肤水润饱满，散发着健康光泽，展示了水光针治疗后的效果' },
      { id: 'res_thermage', title: '热玛吉效果', basePrompt: '一位成熟女性的侧脸，下颌线紧致清晰，皮肤紧实，展示了热玛吉治疗后的提拉效果' },
      { id: 'res_botox', title: '肉毒素除皱', basePrompt: '一位女性的眼部区域特写，鱼尾纹明显减少，表情自然，展示了肉毒素的除皱效果' },
      { id: 'res_filler', title: '玻尿酸填充', basePrompt: '一位女性的面部，苹果肌或鼻唇沟区域变得饱满、平滑，展示了玻尿酸填充的效果' },
    ]
  },
  {
    id: 'process',
    name: '服务流程展示',
    icon: 'camera_roll',
    templates: [
      { id: 'proc_consult', title: '舒适的咨询室', basePrompt: '一位专业的医美咨询师正与一位顾客在明亮、现代的咨询室里进行一对一沟通，气氛轻松愉快' },
      { id: 'proc_visia', title: 'VISIA皮肤检测', basePrompt: '一位顾客正在使用VISIA皮肤检测仪，屏幕上显示出清晰的皮肤分析图像，旁边有医生在解读' },
      { id: 'proc_treatment', title: '专业的治疗室', basePrompt: '一位医生正在为一位躺在治疗床上的顾客进行面部激光治疗，环境洁净、设备先进' },
      { id: 'proc_lounge', title: '术后休息区', basePrompt: '一位顾客在安静、优雅的休息区喝茶，享受术后的宁静时刻' },
    ]
  },
  {
    id: 'branding',
    name: '品牌形象宣传',
    icon: 'palette',
    templates: [
      { id: 'brand_interior', title: '诊所内部环境', basePrompt: '一个高端医美诊所的接待区，设计现代、简约、明亮，充满艺术感和科技感' },
      { id: 'brand_staff', title: '专业医生团队', basePrompt: '几位穿着专业制服的医美医生和护士面带微笑站在一起，展现出自信和专业的团队形象' },
      { id: 'brand_abstract', title: '抽象美学概念', basePrompt: '抽象的艺术图像，结合了水的波纹、光的线条和皮肤的纹理，传达出科技与自然之美' },
      { id: 'brand_product', title: '产品与仪器', basePrompt: '一台先进的医美激光设备或一组高端护肤品，以艺术化的方式陈列在简洁的背景上' },
    ]
  },
  {
    id: 'social',
    name: '社交媒体帖子',
    icon: 'share',
    templates: [
      { id: 'social_summer', title: '夏季护肤主题', basePrompt: '一张清新、明亮的图片，主题是夏季防晒和皮肤补水，可以包含水滴、绿叶和一位面带微笑的女性' },
      { id: 'social_promo', title: '优惠活动宣传', basePrompt: '一张设计精美的海报，突出显示“限时优惠”或“会员专享”等字样，背景与医美相关' },
      { id: 'social_edu', title: '科普知识图', basePrompt: '一张信息图风格的图片，用简洁的图形和文字解释一个医美概念，如“胶原蛋白的作用”' },
      { id: 'social_testimonial', title: '客户见证引言', basePrompt: '一张带有引言框的优雅图片，背景是一位满意客户的模糊剪影，用于分享客户好评' },
    ]
  },
];

export const modifierChips: Record<string, string[]> = {
    '风格 (Style)': ['科技感', '自然主义', '奢华典雅', '极简主义', '水彩画风'],
    '人像 (Portrait)': ['亚洲女性', '高加索女性', '健康小麦色', '男性面部', '特写镜头', '全身照'],
    '情绪 (Mood)': ['信赖', '愉悦', '宁静', '自信', '活力'],
    '场景 (Scene)': ['明亮的诊所', '舒适的休息区', '户外自然光', '实验室背景', '抽象背景'],
    '色调 (Color Tone)': ['冷色调', '暖色调', '高饱和度', '莫兰迪色系', '黑白摄影'],
};