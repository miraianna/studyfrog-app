import { useState } from 'react';
import type { Card, CardInput, Deck } from '../entities/types';
import { cardFieldLimits, hasValidCardLengths } from '../shared/cardValidation';

type AddCardsPageProps = {
  addedCards: Card[];
  deck: Deck;
  onAddCard: (card: CardInput) => void;
  onBack: () => void;
};

function AddCardsPage({ addedCards, deck, onAddCard, onBack }: AddCardsPageProps) {
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');
  const [comment, setComment] = useState('');

  const cardInput: CardInput = {
    word: word.trim(),
    translation: translation.trim(),
    example: example.trim() || undefined,
    comment: comment.trim() || undefined,
  };
  const isValid = cardInput.word.length > 0 && cardInput.translation.length > 0 && hasValidCardLengths(cardInput);
  const duplicateCard = addedCards.some(
    (card) =>
      card.word.trim().toLocaleLowerCase() === word.trim().toLocaleLowerCase() &&
      card.translation.trim().toLocaleLowerCase() === translation.trim().toLocaleLowerCase(),
  );

  const addCard = () => {
    if (!isValid || duplicateCard) {
      return;
    }

    onAddCard(cardInput);

    setWord('');
    setTranslation('');
    setExample('');
    setComment('');
  };

  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">{deck.title} deck</p>
          <h1>Add cards</h1>
        </div>
        <button className="counter" onClick={onBack} type="button">
          Done
        </button>
      </header>

      <section className="add-card-form">
        <label>
          Word
          <input
            onChange={(event) => setWord(event.target.value)}
            maxLength={cardFieldLimits.word}
            placeholder="Required"
            value={word}
          />
        </label>
        <label>
          Translation
          <input
            onChange={(event) => setTranslation(event.target.value)}
            maxLength={cardFieldLimits.translation}
            placeholder="Required"
            value={translation}
          />
        </label>
        <label>
          Example
          <textarea
            onChange={(event) => setExample(event.target.value)}
            maxLength={cardFieldLimits.example}
            placeholder="Optional example or phrase"
            value={example}
          />
        </label>
        <label>
          Comment
          <textarea
            onChange={(event) => setComment(event.target.value)}
            maxLength={cardFieldLimits.comment}
            placeholder="Optional note, hint, context"
            value={comment}
          />
        </label>
        {duplicateCard ? <p className="form-warning" role="alert">This card already exists in this deck.</p> : null}
        <button className="primary-button" disabled={!isValid || duplicateCard} onClick={addCard} type="button">
          Add
        </button>
      </section>

      <section className="content-block recent-added">
        <h2>Cards in this deck ({addedCards.length})</h2>
        {addedCards.map((card) => (
          <article className="word-row" key={card.id}>
            <div>
              <strong>{card.word}</strong>
              <span>{card.translation}</span>
            </div>
          </article>
        ))}
      </section>
    </section>
  );
}

export default AddCardsPage;
