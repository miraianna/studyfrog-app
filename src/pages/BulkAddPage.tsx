import { useMemo, useState } from 'react';
import type { Card, CardInput, Deck } from '../entities/types';
import { parseBulkCards } from '../shared/bulkCards';
import { bulkCardLimit, cardFieldLimits } from '../shared/cardValidation';

type BulkAddPageProps = {
  deck: Deck;
  deckCards: Card[];
  onAddCards: (cards: CardInput[]) => void;
  onBack: () => void;
};

const cardKey = (word: string, translation: string) =>
  `${word.trim().toLocaleLowerCase()}\u0000${translation.trim().toLocaleLowerCase()}`;

function BulkAddPage({ deck, deckCards, onAddCards, onBack }: BulkAddPageProps) {
  const [value, setValue] = useState('');
  const [showValidation, setShowValidation] = useState(false);
  const result = useMemo(() => parseBulkCards(value), [value]);
  const duplicateCount = useMemo(() => {
    const keys = new Set(deckCards.map((card) => cardKey(card.word, card.translation)));

    return result.cards.reduce((count, card) => {
      const key = cardKey(card.word, card.translation);

      if (keys.has(key)) {
        return count + 1;
      }

      keys.add(key);
      return count;
    }, 0);
  }, [deckCards, result.cards]);
  const tooManyCards = result.cards.length > bulkCardLimit;
  const hasValidationIssue = result.errors.length > 0 || duplicateCount > 0 || tooManyCards;
  const hasInput = value.trim().length > 0;
  const canCreate = hasInput && !(showValidation && hasValidationIssue);

  const createCards = () => {
    if (result.cards.length === 0 || hasValidationIssue) {
      setShowValidation(true);
      return;
    }

    onAddCards(result.cards);
    onBack();
  };

  return (
    <section className="screen bulk-add-screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">{deck.title} deck</p>
          <h1>Bulk add</h1>
        </div>
        <button className="icon-button" aria-label="Back to words" onClick={onBack} type="button">←</button>
      </header>

      <section className="bulk-instructions">
        <h2>Add several cards at once</h2>
        <p className="muted">Paste one card per line. Separate the word and translation with a semicolon or with <code> - </code>.</p>
        <p className="muted">To include an example and a comment, use four semicolon-separated fields. Leave a field empty if you do not need it.</p>
        <pre>{'hola;привет\nhouse - дом\nrun;бежать;I run every morning.;Irregular verb'}</pre>
        <p className="muted">Character limits per card: word {cardFieldLimits.word}, translation {cardFieldLimits.translation}, example/comment {cardFieldLimits.example} characters. You can add up to {bulkCardLimit} cards at once.</p>
      </section>

      <label className="bulk-input-label">
        Cards to add
        <textarea
          className="bulk-textarea"
          onChange={(event) => { setValue(event.target.value); setShowValidation(false); }}
          placeholder={'hola;привет\nhouse - дом\nrun;бежать;I run every morning.;Irregular verb'}
          value={value}
        />
      </label>

      {showValidation && result.errors.length > 0 ? (
        <section className="bulk-errors" role="alert">
          <strong>Check these lines. Each line needs a word and translation, and must stay within the character limits.</strong>
          {result.errors.map((error) => <p key={`${error.lineNumber}-${error.text}`}>Line {error.lineNumber}: {error.text}</p>)}
        </section>
      ) : null}
      {showValidation && duplicateCount > 0 ? (
        <p className="form-warning" role="alert">{duplicateCount} duplicate {duplicateCount === 1 ? 'card' : 'cards'} found. Remove them before creating cards.</p>
      ) : null}
      {showValidation && tooManyCards ? (
        <p className="form-warning" role="alert">You can add up to {bulkCardLimit} cards at once. Split this list into smaller batches.</p>
      ) : null}

      <button className="primary-button" disabled={!canCreate} onClick={createCards} type="button">
        Create {result.cards.length || ''} cards
      </button>
    </section>
  );
}

export default BulkAddPage;
