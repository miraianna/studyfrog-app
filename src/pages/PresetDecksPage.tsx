import type { PresetDeck } from '../shared/presetDecks';

type PresetDecksPageProps = {
  decks: PresetDeck[];
  onBack: () => void;
  onOpenDeck: (presetId: string) => void;
};

function PresetDecksPage({ decks, onBack, onOpenDeck }: PresetDecksPageProps) {
  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">Ready-made decks</p>
          <h1>Explore decks</h1>
        </div>
        <button className="icon-button" aria-label="Back home" onClick={onBack} type="button">←</button>
      </header>

      <section className="preset-intro">
        <h2>Start with a ready-made set</h2>
        <p className="muted">Browse a deck, then add your own editable copy. Your changes and learning progress never affect the original set.</p>
      </section>

      <section className="content-block">
        {decks.map((deck) => (
          <article className="preset-deck-card" key={deck.id}>
            <div>
              <h2>{deck.title}</h2>
              <p className="muted">{deck.description}</p>
              <span>{deck.cards.length} cards</span>
            </div>
            <button className="secondary-button" onClick={() => onOpenDeck(deck.id)} type="button">View deck</button>
          </article>
        ))}
      </section>
    </section>
  );
}

export default PresetDecksPage;
