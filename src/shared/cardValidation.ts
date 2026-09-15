import type { CardInput } from '../entities/types';

export const cardFieldLimits = {
  word: 80,
  translation: 120,
  example: 280,
  comment: 280,
} as const;

export const bulkCardLimit = 150;

export function hasValidCardLengths(card: CardInput) {
  return (
    card.word.length <= cardFieldLimits.word &&
    card.translation.length <= cardFieldLimits.translation &&
    (card.example?.length ?? 0) <= cardFieldLimits.example &&
    (card.comment?.length ?? 0) <= cardFieldLimits.comment
  );
}
