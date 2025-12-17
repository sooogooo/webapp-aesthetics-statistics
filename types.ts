export type Page =
  | 'dashboard'
  | 'models'
  | 'copilot'
  | 'designer'
  | 'article'
  | 'paths'
  | 'plan'
  | 'guide';

export interface Distribution {
  id: number;
  name: string;
  title: string;
  description: string;
  parameters: string;
  formula: string;
  application: string[];
  takeaway: string;
  group: number;
  relatedModels?: {
    id: number;
    name: string;
    reason: string;
  }[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  id?: string;
  fileInfo?: string;
  chartData?: Record<string, unknown>;
}

export interface ChatHistoryItem {
  id: string;
  title: string;
  messages: ChatMessage[];
  model: string;
  timestamp: number;
}

export type Theme = 'mint' | 'lavender' | 'rose' | 'peach';
export type FontSize = 'font-size-sm' | 'font-size-md' | 'font-size-lg';
export type AiStyle = '轻松幽默' | '标准日常' | '科学严谨';
export type AiLength = '简约' | '标准' | '详细';

export interface Settings {
  theme: Theme;
  fontSize: FontSize;
  aiStyle: AiStyle;
  aiLength: AiLength;
}

export interface DesignHistoryItem {
  id: string;
  timestamp: number;
  prompt: string;
  base64Image: string;
}

export interface DecisionGuideProblem {
  question: string;
  tools: { id: number; name: string }[];
  explanation: string;
}

export interface DecisionGuideCategory {
  category: string;
  icon: string;
  problems: DecisionGuideProblem[];
}

export interface LearningPathStep {
  modelId: number;
  title: string;
  description: string;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  audience: string;
  steps: LearningPathStep[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correctAnswer: string;
  difficulty: number;
}

export interface UserHistory {
  viewedModelIds: number[];
  completedPathSteps: Record<string, number[]>;
}

export interface EnhancedApplication {
  original: string;
  enhancement: string;
}
