import type { DeckWithStats } from '../entities/types';

type StudyDeckSelectPageProps = {
  decks: DeckWithStats[];
  onAddWords: (deckId: string) => void;
  onBack: () => void;
  onCreateDeck: () => void;
  onDeleteDeck: (deckId: string) => void;
  onSelectDeck: (deckId: string) => void;
  onViewWords: (deckId: string) => void;
};

function StudyDeckSelectPage({
  decks,
  onAddWords,
  onBack,
  onCreateDeck,
  onDeleteDeck,
  onSelectDeck,
  onViewWords,
}: StudyDeckSelectPageProps) {
  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">Start study</p>
          <h1>Your decks</h1>
        </div>
        <button className="icon-button" aria-label="Back home" onClick={onBack} type="button">
          ←
        </button>
      </header>

      <section className="content-block">
        {decks.length > 0 ? (
          decks.map((deck) => (
          <article className="select-card" key={deck.id}>
            <button
              className="deck-title-button"
              onClick={() => onViewWords(deck.id)}
              type="button"
            >
              <h2>{deck.title}</h2>
              <p className="muted">
                {deck.cardsCount} cards · {deck.dueCount} due
              </p>
            </button>
            <div className="deck-actions">
              <button
                className="secondary-button compact-button"
                onClick={() => onSelectDeck(deck.id)}
                type="button"
              >
                Study
              </button>
              <button
                className="secondary-button compact-button"
                onClick={() => onViewWords(deck.id)}
                type="button"
              >
                View words
              </button>
              <button
                className="secondary-button compact-button"
                onClick={() => onAddWords(deck.id)}
                type="button"
              >
                Add words
              </button>
              <button
                className="danger-button compact-button"
                onClick={() => onDeleteDeck(deck.id)}
                type="button"
              >
                Delete
              </button>
            </div>
          </article>
          ))
        ) : (
          <section className="empty-state rich-empty-state">
            <h2>No decks yet</h2>
            <p>Create your first deck to start learning.</p>
            <button className="primary-button compact-button" onClick={onCreateDeck} type="button">
              Create deck
            </button>
          </section>
        )}
      </section>
    </section>
  );
}

export default StudyDeckSelectPage;
