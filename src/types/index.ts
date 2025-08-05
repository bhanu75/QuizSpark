export interface Question {
  question: string;
  options: string[];
  correct: number;
  explanation?: string;
}

export interface QuestionSet {
  title: string;
  timeLimit?: number;
  shuffle?: boolean;
  questions: Question[];
}

export interface TestResults {
  questions: Question[];
  answers: Record<number, number>;
  timeSpent: number;
  completedAt: string;
}

export interface ScoreData {
  correct: number;
  total: number;
  percentage: number;
}

export type PageType = 'home' | 'create' | 'test' | 'results';
