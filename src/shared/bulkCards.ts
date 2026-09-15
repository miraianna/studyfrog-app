import type { CardInput } from '../entities/types';
import { hasValidCardLengths } from './cardValidation';

export type BulkCardParseError = {
  lineNumber: number;
  text: string;
};

export type BulkCardParseResult = {
  cards: CardInput[];
  errors: BulkCardParseError[];
};

function parseLine(line: string): CardInput | null {
  if (line.includes(';')) {
    const fields = line.split(';').map((field) => field.trim());

    if (fields.length >= 2 && fields.length <= 4 && fields[0] && fields[1]) {
      const card: CardInput = {
        word: fields[0],
        translation: fields[1],
        example: fields[2] || undefined,
        comment: fields[3] || undefined,
      };

      if (hasValidCardLengths(card)) {
        return card;
      }
    }

    return null;
  }

  const dashDelimiter = ' - ';
  const dashIndex = line.indexOf(dashDelimiter);

  if (dashIndex >= 0) {
    const word = line.slice(0, dashIndex).trim();
    const translation = line.slice(dashIndex + dashDelimiter.length).trim();

    const card = { word, translation };

    if (word && translation && hasValidCardLengths(card)) {
      return card;
    }
  }

  return null;
}

export function parseBulkCards(value: string): BulkCardParseResult {
  return value.split(/\r?\n/).reduce<BulkCardParseResult>(
    (result, rawLine, index) => {
      const line = rawLine.trim();

      if (!line) {
        return result;
      }

      const card = parseLine(line);

      if (!card) {
        result.errors.push({
          lineNumber: index + 1,
          text: rawLine,
        });
        return result;
      }

      result.cards.push(card);
      return result;
    },
    { cards: [], errors: [] },
  );
}
