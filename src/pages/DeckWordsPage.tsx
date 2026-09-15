import { useState } from 'react';
import type { Card, CardInput, Deck } from '../entities/types';
import { cardFieldLimits, hasValidCardLengths } from '../shared/cardValidation';

type DeckWordsPageProps = {
  deckCards: Card[];
  deck: Deck;
  onBack: () => void;
  onAddWords: () => void;
  onOpenBulkAdd: () => void;
  onDeleteCard: (cardId: string) => void;
  onEditCard: (cardId: string, card: CardInput) => boolean;
  onRenameDeck: (deckId: string, title: string) => boolean;
  onToggleHidden: (cardId: string) => void;
};

function DeckWordsPage({
  deckCards,
  deck,
  onBack,
  onAddWords,
  onOpenBulkAdd,
  onDeleteCard,
  onEditCard,
  onRenameDeck,
  onToggleHidden,
}: DeckWordsPageProps) {
  const [editingCardId, setEditingCardId] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [translation, setTranslation] = useState('');
  const [example, setExample] = useState('');
  const [comment, setComment] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'word'>('newest');
  const [isRenaming, setIsRenaming] = useState(false);
  const [deckTitle, setDeckTitle] = useState(deck.title);
  const visibleCards = deckCards
    .filter((card) => {
      const query = searchQuery.trim().toLocaleLowerCase();
      return !query || card.word.toLocaleLowerCase().includes(query) || card.translation.toLocaleLowerCase().includes(query);
    })
    .sort((first, second) =>
      sortBy === 'word'
        ? first.word.localeCompare(second.word)
        : new Date(second.createdAt).getTime() - new Date(first.createdAt).getTime(),
    );

  const startEdit = (card: Card) => {
    setEditingCardId(card.id);
    setWord(card.word);
    setTranslation(card.translation);
    setExample(card.example ?? '');
    setComment(card.comment ?? '');
  };

  const saveEdit = (cardId: string) => {
    const cardInput = {
      word: word.trim(),
      translation: translation.trim(),
      example: example.trim() || undefined,
      comment: comment.trim() || undefined,
    };

    if (!cardInput.word || !cardInput.translation || !hasValidCardLengths(cardInput)) {
      return;
    }

    if (onEditCard(cardId, cardInput)) {
      setEditingCardId(null);
    }
  };

  const saveDeckName = () => {
    if (onRenameDeck(deck.id, deckTitle)) {
      setIsRenaming(false);
    }
  };

  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">{deck.title} deck</p>
          {isRenaming ? (
            <div className="rename-deck-form">
              <input aria-label="Deck name" maxLength={70} onChange={(event) => setDeckTitle(event.target.value)} value={deckTitle} />
              <button className="secondary-button compact-button" onClick={saveDeckName} type="button">Save</button>
              <button className="text-link" onClick={() => { setDeckTitle(deck.title); setIsRenaming(false); }} type="button">Cancel</button>
            </div>
          ) : (
            <h1>All words</h1>
          )}
        </div>
        <button className="icon-button" aria-label="Back to decks" onClick={onBack} type="button">
          ←
        </button>
      </header>

      <div className="deck-actions page-actions">
        <button className="secondary-button" onClick={onAddWords} type="button">
          Add card
        </button>
        <button className="secondary-button" onClick={onOpenBulkAdd} type="button">
          Bulk add
        </button>
        {!isRenaming ? (
          <button className="secondary-button" onClick={() => setIsRenaming(true)} type="button">
            Rename deck
          </button>
        ) : null}
      </div>

      {deckCards.length > 0 ? (
        <div className="word-list-controls">
          <input
            aria-label="Search cards"
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search words or translations"
            value={searchQuery}
          />
          <select aria-label="Sort cards" onChange={(event) => setSortBy(event.target.value as 'newest' | 'word')} value={sortBy}>
            <option value="newest">Newest first</option>
            <option value="word">Word A–Z</option>
          </select>
        </div>
      ) : null}

      <section className="content-block">
        {deckCards.length > 0 ? (
          visibleCards.map((card) => (
            <article className="word-card" key={card.id}>
              {editingCardId === card.id ? (
                <div className="edit-card-form">
                  <input
                    aria-label="Word"
                    maxLength={cardFieldLimits.word}
                    onChange={(event) => setWord(event.target.value)}
                    value={word}
                  />
                  <input
                    aria-label="Translation"
                    maxLength={cardFieldLimits.translation}
                    onChange={(event) => setTranslation(event.target.value)}
                    value={translation}
                  />
                  <textarea
                    aria-label="Example"
                    maxLength={cardFieldLimits.example}
                    onChange={(event) => setExample(event.target.value)}
                    placeholder="Optional example"
                    value={example}
                  />
                  <textarea
                    aria-label="Comment"
                    maxLength={cardFieldLimits.comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder="Optional comment"
                    value={comment}
                  />
                </div>
              ) : (
                <div className={card.isHidden ? 'hidden-word' : undefined}>
                  <strong>{card.word}</strong>
                  <span>{card.translation}</span>
                  {card.example ? <p>{card.example}</p> : null}
                  {card.comment ? <p>{card.comment}</p> : null}
                </div>
              )}

              <div className="word-actions">
                {editingCardId === card.id ? (
                  <>
                    <button
                      className="secondary-button compact-button"
                      onClick={() => saveEdit(card.id)}
                      type="button"
                    >
                      Save
                    </button>
                    <button
                      className="secondary-button compact-button"
                      onClick={() => setEditingCardId(null)}
                      type="button"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="secondary-button compact-button"
                      onClick={() => startEdit(card)}
                      type="button"
                    >
                      Edit
                    </button>
                    <button
                      className="secondary-button compact-button"
                      onClick={() => onToggleHidden(card.id)}
                      type="button"
                    >
                      {card.isHidden ? 'Unhide' : 'Hide'}
                    </button>
                    <button
                      className="danger-button compact-button"
                      onClick={() => onDeleteCard(card.id)}
                      type="button"
                    >
                      Delete
                    </button>
                  </>
                )}
              </div>
            </article>
          ))
        ) : (
          <section className="empty-state rich-empty-state">
            <h2>No cards yet</h2>
            <p>Add your first card or use Bulk add to create several cards at once.</p>
            <div className="deck-actions">
              <button className="primary-button compact-button" onClick={onAddWords} type="button">
                Add card
              </button>
              <button
                className="secondary-button compact-button"
                onClick={onOpenBulkAdd}
                type="button"
              >
                Bulk add
              </button>
            </div>
          </section>
      )}

      {deckCards.length > 0 && visibleCards.length === 0 ? (
        <section className="empty-state"><p>No cards match this search.</p></section>
      ) : null}
      </section>

    </section>
  );
}

export default DeckWordsPage;
