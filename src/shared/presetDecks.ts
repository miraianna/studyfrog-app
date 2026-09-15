import rawA1Decks from './a1_preinstalled_decks.json';

export type PresetCard = {
  word: string;
  translation: string;
  example?: string;
  comment?: string;
};

export type PresetDeck = {
  id: string;
  title: string;
  description: string;
  cards: PresetCard[];
};

const deckMetadata = {
  english: {
    id: 'english-a1',
    title: 'English A1',
    description: '100 essential English words for A1 learners.',
  },
  japanese: {
    id: 'japanese-a1',
    title: 'Japanese A1',
    description: '100 essential Japanese words for A1 learners.',
  },
  spanish: {
    id: 'spanish-a1',
    title: 'Spanish A1',
    description: '100 essential Spanish words for A1 learners.',
  },
  french: {
    id: 'french-a1',
    title: 'French A1',
    description: '100 essential French words for A1 learners.',
  },
} as const;

type DeckLanguage = keyof typeof deckMetadata;

const a1Decks = rawA1Decks as Record<DeckLanguage, PresetCard[]>;

export const presetDecks: PresetDeck[] = (Object.keys(deckMetadata) as DeckLanguage[]).map((language) => ({
  ...deckMetadata[language],
  cards: a1Decks[language].map((card) => ({
    ...card,
    example: card.example || undefined,
    comment: card.comment || undefined,
  })),
}));
