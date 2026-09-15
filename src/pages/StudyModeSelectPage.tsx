import type { Deck } from '../entities/types';

type StudyModeSelectPageProps = {
  deck: Deck;
  dueCount: number;
  availableCount: number;
  onBack: () => void;
  onStartFreePractice: () => void;
  onStartReview: () => void;
};

function StudyModeSelectPage({ deck, dueCount, availableCount, onBack, onStartFreePractice, onStartReview }: StudyModeSelectPageProps) {
  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">{deck.title} deck</p>
          <h1>Choose a session</h1>
        </div>
        <button className="icon-button" aria-label="Back to decks" onClick={onBack} type="button">←</button>
      </header>

      <section className="mode-options">
        <article className="mode-option">
          <div>
            <h2>Review due cards</h2>
            <p className="muted">
              Study the {dueCount} {dueCount === 1 ? 'card' : 'cards'} scheduled for review now. Your answers update each card&apos;s learning progress and next review date.
            </p>
          </div>
          <button className="primary-button" onClick={onStartReview} type="button">Start review</button>
        </article>

        <article className="mode-option">
          <div>
            <h2>Free practice</h2>
            <p className="muted">
              Practice any of the {availableCount} available {availableCount === 1 ? 'card' : 'cards'}, even if they are not due. Cards repeat in a shuffled loop, and your answers also update learning progress and scheduling.
            </p>
          </div>
          <button className="secondary-button full-width-button" onClick={onStartFreePractice} type="button">Start free practice</button>
        </article>
      </section>
    </section>
  );
}

export default StudyModeSelectPage;
