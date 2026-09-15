import type { Deck } from '../entities/types';

type StudyEmptyPageProps = {
  deck: Deck;
  reason: 'noCards' | 'allHidden' | 'noDue';
  onBack: () => void;
  onPractice: () => void;
};

function StudyEmptyPage({ deck, reason, onBack, onPractice }: StudyEmptyPageProps) {
  const canPractice = reason === 'noDue';
  const titleByReason = {
    noCards: 'No cards available',
    allHidden: 'No available cards',
    noDue: 'All cards reviewed for now 🎉',
  };
  const descriptionByReason = {
    noCards: 'Add words before starting a study session.',
    allHidden: 'Unhide cards to study this deck again.',
    noDue: 'You can use Free practice to study any available card. Answers will still update progress and the next review date.',
  };

  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">{deck.title} deck</p>
          <h1>{titleByReason[reason]}</h1>
        </div>
        <button className="icon-button" aria-label="Back to decks" onClick={onBack} type="button">
          ←
        </button>
      </header>

      <section className="empty-study-card">
        <p className="muted">{descriptionByReason[reason]}</p>
        {canPractice ? (
          <button className="primary-button" onClick={onPractice} type="button">
            Start free practice
          </button>
        ) : null}
      </section>
    </section>
  );
}

export default StudyEmptyPage;
