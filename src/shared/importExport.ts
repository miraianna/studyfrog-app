import type { Card, CardStatus, Deck } from '../entities/types';

export type StudyFrogExport = {
  version: 1;
  exportedAt: string;
  decks: Deck[];
  cards: Card[];
};

const cardStatuses: CardStatus[] = ['new', 'learning', 'review', 'mastered'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === 'string';
}

function isOptionalString(value: unknown): value is string | undefined {
  return value === undefined || typeof value === 'string';
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

export function isDeck(value: unknown): value is Deck {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.title) &&
    isString(value.createdAt) &&
    isString(value.updatedAt) &&
    isOptionalString(value.lastStudiedAt)
  );
}

export function isCard(value: unknown): value is Card {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.deckId) &&
    isString(value.word) &&
    isString(value.translation) &&
    isOptionalString(value.example) &&
    isOptionalString(value.comment) &&
    isString(value.status) &&
    cardStatuses.includes(value.status as CardStatus) &&
    typeof value.isHidden === 'boolean' &&
    isOptionalString(value.nextReviewAt) &&
    isOptionalString(value.lastReviewedAt) &&
    isNumber(value.reviewCount) &&
    isNumber(value.correctCount) &&
    isNumber(value.wrongCount) &&
    isNumber(value.consecutiveCorrectCount) &&
    isNumber(value.consecutiveWrongCount) &&
    isString(value.createdAt) &&
    isString(value.updatedAt)
  );
}

export function parseStudyFrogData(value: unknown): { decks: Deck[]; cards: Card[] } | null {
  if (!isRecord(value) || !Array.isArray(value.decks) || !Array.isArray(value.cards)) {
    return null;
  }

  if (!value.decks.every(isDeck) || !value.cards.every(isCard)) {
    return null;
  }

  const deckIds = new Set(value.decks.map((deck) => deck.id));

  if (value.cards.some((card) => !deckIds.has(card.deckId))) {
    return null;
  }

  return { decks: value.decks, cards: value.cards };
}

export function downloadStudyFrogExport(decks: Deck[], cards: Card[]) {
  const payload: StudyFrogExport = {
    version: 1,
    exportedAt: new Date().toISOString(),
    decks,
    cards,
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');

  link.href = url;
  link.download = `studyfrog-backup-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
