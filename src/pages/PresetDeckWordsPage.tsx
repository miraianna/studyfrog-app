import { useMemo, useState } from 'react';
import type { PresetDeck } from '../shared/presetDecks';

type PresetDeckWordsPageProps = {
  deck: PresetDeck;
  onAddToMyDecks: () => void;
  onBack: () => void;
};

function PresetDeckWordsPage({ deck, onAddToMyDecks, onBack }: PresetDeckWordsPageProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'default' | 'word'>('default');
  const cards = useMemo(
    () =>
      deck.cards
        .filter((card) => {
          const query = searchQuery.trim().toLocaleLowerCase();
          return !query || card.word.toLocaleLowerCase().includes(query) || card.translation.toLocaleLowerCase().includes(query);
        })
        .sort((first, second) => (sortBy === 'word' ? first.word.localeCompare(second.word) : 0)),
    [deck.cards, searchQuery, sortBy],
  );

  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow deck-name-label">{deck.title} · ready-made deck</p>
          <h1>All words</h1>
        </div>
        <button className="icon-button" aria-label="Back to ready-made decks" onClick={onBack} type="button">←</button>
      </header>

      <section className="preset-intro compact-intro">
        <p className="muted">This is a read-only preview. Add it to your decks to edit words and track your own learning progress.</p>
        <button className="primary-button" onClick={onAddToMyDecks} type="button">Add to my decks</button>
      </section>

      <div className="word-list-controls">
        <input aria-label="Search cards" onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search words or translations" value={searchQuery} />
        <select aria-label="Sort cards" onChange={(event) => setSortBy(event.target.value as 'default' | 'word')} value={sortBy}>
          <option value="default">Original order</option>
          <option value="word">Word A–Z</option>
        </select>
      </div>

      <section className="content-block">
        {cards.map((card, index) => (
          <article className="word-card" key={`${card.word}-${index}`}>
            <div>
              <strong>{card.word}</strong>
              <span>{card.translation}</span>
              {card.example ? <p>{card.example}</p> : null}
              {card.comment ? <p>{card.comment}</p> : null}
            </div>
          </article>
        ))}
        {cards.length === 0 ? <section className="empty-state"><p>No cards match this search.</p></section> : null}
      </section>
    </section>
  );
}

export default PresetDeckWordsPage;
