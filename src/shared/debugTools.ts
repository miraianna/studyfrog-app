import type { Card, Deck } from '../entities/types';
import { storageKey } from './storage';

const demoWords = [
  ['hello', 'hola'],
  ['goodbye', 'adiós'],
  ['house', 'casa'],
  ['book', 'libro'],
  ['apple', 'manzana'],
  ['dog', 'perro'],
  ['cat', 'gato'],
  ['water', 'agua'],
  ['friend', 'amigo'],
  ['family', 'familia'],
  ['city', 'ciudad'],
  ['food', 'comida'],
  ['music', 'música'],
  ['school', 'escuela'],
  ['work', 'trabajo'],
  ['morning', 'mañana'],
  ['night', 'noche'],
  ['green', 'verde'],
  ['happy', 'feliz'],
  ['small', 'pequeño'],
];

function createDebugId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function makeAllCardsDueNow(cards: Card[]) {
  const dueAt = new Date(Date.now() - 60_000).toISOString();
  const updatedAt = new Date().toISOString();

  return cards.map((card) =>
    card.isHidden
      ? card
      : {
          ...card,
          nextReviewAt: dueAt,
          updatedAt,
        },
  );
}

export function resetLearningProgress(cards: Card[]) {
  const updatedAt = new Date().toISOString();

  return cards.map((card) => ({
    ...card,
    status: 'new' as const,
    nextReviewAt: undefined,
    lastReviewedAt: undefined,
    reviewCount: 0,
    correctCount: 0,
    wrongCount: 0,
    consecutiveCorrectCount: 0,
    consecutiveWrongCount: 0,
    updatedAt,
  }));
}

export function clearStudyFrogStorage() {
  window.localStorage.removeItem(storageKey);
  window.location.reload();
}

export function generateDemoDeck(decks: Deck[], cards: Card[]) {
  const existingDemoDeck = decks.find((deck) => deck.title === 'Demo Deck');

  if (existingDemoDeck) {
    return { decks, cards, selectedDeckId: existingDemoDeck.id };
  }

  const now = Date.now();
  const createdAt = new Date().toISOString();
  const demoDeck: Deck = {
    id: createDebugId('deck-demo'),
    title: 'Demo Deck',
    createdAt,
    updatedAt: createdAt,
  };

  const statuses: Card['status'][] = ['new', 'learning', 'review', 'mastered'];
  const demoCards: Card[] = demoWords.map(([word, translation], index) => {
    const status = statuses[index % statuses.length];
    const isDue = index % 3 !== 0;
    const nextReviewAt =
      status === 'new'
        ? undefined
        : new Date(now + (isDue ? -60_000 : (index + 1) * 60 * 60 * 1000)).toISOString();

    return {
      id: createDebugId(`card-demo-${index}`),
      deckId: demoDeck.id,
      word,
      translation,
      example: `Example: ${word}`,
      comment: 'Demo card for local testing.',
      status,
      isHidden: false,
      nextReviewAt,
      lastReviewedAt: status === 'new' ? undefined : new Date(now - 24 * 60 * 60 * 1000).toISOString(),
      reviewCount: index % 5,
      correctCount: index % 4,
      wrongCount: index % 2,
      consecutiveCorrectCount: status === 'new' ? 0 : index % 3,
      consecutiveWrongCount: 0,
      createdAt,
      updatedAt: createdAt,
    };
  });

  return {
    decks: [...decks, demoDeck],
    cards: [...demoCards, ...cards],
    selectedDeckId: demoDeck.id,
  };
}

export function forcePracticeModeForDeck(cards: Card[], deckId: string) {
  const updatedAt = new Date().toISOString();
  const nextReviewAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

  return cards.map((card) =>
    card.deckId === deckId && !card.isHidden
      ? {
          ...card,
          status: 'mastered' as const,
          nextReviewAt,
          updatedAt,
        }
      : card,
  );
}
