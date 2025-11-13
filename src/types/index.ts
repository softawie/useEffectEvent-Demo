export interface TeamMember {
  name: string;
  totalBonus: number;
  questionsAnswered: number;
  correctAnswers: number;
  lastActivity: string;
}

export interface QuizQuestion {
  id: number;
  type: 'multiple-choice' | 'code-analysis' | 'true-false';
  question: string;
  code?: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export type CodeModalType = 'without' | 'with' | 'implementation' | 'comparison' | 'side-by-side' | 'docs';

export interface ModalState {
  isOpen: boolean;
  type: CodeModalType;
}

export type ComponentView = 'both' | 'without' | 'with';
