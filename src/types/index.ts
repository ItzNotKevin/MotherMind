export type CategoryId = 'school' | 'healthcare' | 'everyday';

export interface Category {
  id: CategoryId;
  title: string;
  emoji: string;
  color: string;
  lightColor: string;
  description: string;
}

export interface Scenario {
  id: string;
  categoryId: CategoryId;
  title: string;
  description: string;
  aiRole: string;
  openingLine: string;
  maxTurns: number;
}

export interface Message {
  role: 'ai' | 'user';
  text: string;
}

export interface SupportFeedback {
  say_it_better: string;
  understand_it_better: string;
  practice_word: string;
  practice_phrase: string;
  practice_sentence: string;
  encouragement: string;
}
