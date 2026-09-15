import type { Card, CardStatus, StudyAnswer, StudyAnswerResult } from './types';

const minutes = (value: number) => value * 60 * 1000;
const days = (value: number) => value * 24 * 60 * 60 * 1000;

const addTime = (now: Date, duration: number) => new Date(now.getTime() + duration).toISOString();

export function getDueCards(cards: Card[], now: Date) {
  return cards
    .filter((card) => {
      if (card.isHidden) {
        return false;
      }

      return !card.nextReviewAt || new Date(card.nextReviewAt) <= now;
    })
    .sort((a, b) => {
      if (!a.nextReviewAt && !b.nextReviewAt) {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }

      if (!a.nextReviewAt) {
        return -1;
      }

      if (!b.nextReviewAt) {
        return 1;
      }

      return new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
    });
}

export function getDueCardsByDeck(cards: Card[], deckId: string, now: Date) {
  return getDueCards(
    cards.filter((card) => card.deckId === deckId),
    now,
  );
}

export function applyStudyAnswer(
  card: Card,
  answer: StudyAnswer,
  now: Date,
): StudyAnswerResult {
  const previousStatus = card.status;
  let newStatus: CardStatus = card.status;
  let nextReviewAt: string;

  const updatedCard: Card = {
    ...card,
    reviewCount: card.reviewCount + 1,
    lastReviewedAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  if (answer === 'know') {
    updatedCard.correctCount += 1;
    updatedCard.consecutiveCorrectCount += 1;
    updatedCard.consecutiveWrongCount = 0;

    if (card.status === 'new') {
      newStatus = 'learning';
      nextReviewAt = addTime(now, minutes(10));
    } else if (card.status === 'learning') {
      if (updatedCard.consecutiveCorrectCount >= 3) {
        newStatus = 'review';
        nextReviewAt = addTime(now, days(3));
      } else {
        nextReviewAt = addTime(now, days(1));
      }
    } else if (card.status === 'review') {
      if (updatedCard.consecutiveCorrectCount >= 5) {
        newStatus = 'mastered';
        nextReviewAt = addTime(now, days(14));
      } else {
        nextReviewAt = addTime(now, days(3));
      }
    } else {
      nextReviewAt = addTime(now, days(14));
    }
  } else {
    updatedCard.wrongCount += 1;
    updatedCard.consecutiveWrongCount += 1;
    updatedCard.consecutiveCorrectCount = 0;

    if (card.status === 'new') {
      nextReviewAt = addTime(now, minutes(2));
    } else if (card.status === 'learning') {
      nextReviewAt = addTime(now, minutes(10));
    } else if (card.status === 'review') {
      if (updatedCard.consecutiveWrongCount >= 2) {
        newStatus = 'learning';
        nextReviewAt = addTime(now, minutes(10));
      } else {
        nextReviewAt = addTime(now, days(1));
      }
    } else if (updatedCard.consecutiveWrongCount >= 2) {
      newStatus = 'review';
      nextReviewAt = addTime(now, days(1));
    } else {
      nextReviewAt = addTime(now, days(3));
    }
  }

  updatedCard.status = newStatus;
  updatedCard.nextReviewAt = nextReviewAt;

  if (previousStatus !== newStatus) {
    updatedCard.consecutiveCorrectCount = 0;
    updatedCard.consecutiveWrongCount = 0;
  }

  return {
    card: updatedCard,
    previousStatus,
    newStatus,
  };
}

export function getCardProgress(card: Card) {
  if (card.status === 'new') {
    return 0;
  }

  if (card.status === 'learning') {
    return Math.min(card.consecutiveCorrectCount / 3, 1);
  }

  if (card.status === 'review') {
    return Math.min(card.consecutiveCorrectCount / 5, 1);
  }

  return 1;
}
