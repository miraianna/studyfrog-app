export type CardStatus = 'new' | 'learning' | 'review' | 'mastered';

export type Deck = {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  lastStudiedAt?: string;
};

export type Card = {
  id: string;
  deckId: string;
  word: string;
  translation: string;
  example?: string;
  comment?: string;
  status: CardStatus;
  isHidden: boolean;
  nextReviewAt?: string;
  lastReviewedAt?: string;
  reviewCount: number;
  correctCount: number;
  wrongCount: number;
  consecutiveCorrectCount: number;
  consecutiveWrongCount: number;
  createdAt: string;
  updatedAt: string;
};

export type DeckWithStats = Deck & {
  cardsCount: number;
  dueCount: number;
  availableCount: number;
};

export type StudyAnswer = 'know' | 'unknown';

export type StudyAnswerResult = {
  card: Card;
  previousStatus: CardStatus;
  newStatus: CardStatus;
};

export type SessionStats = {
  studiedCount: number;
  correctAnswers: number;
  wrongAnswers: number;
};

export type StudyMode = 'review' | 'practice';

export type CardInput = {
  word: string;
  translation: string;
  example?: string;
  comment?: string;
};
