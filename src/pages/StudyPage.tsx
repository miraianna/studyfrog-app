import type { Card, Deck, StudyMode } from '../entities/types';

type StudyPageProps = {
  card: Card;
  deck: Deck;
  isAnswerVisible: boolean;
  progressLabel: string;
  studyMode: StudyMode;
  onAnswer: (isKnown: boolean) => void;
  onExit: () => void;
  onExitLabel?: string;
  onShowAnswer: () => void;
};

function StudyPage({
  card,
  deck,
  isAnswerVisible,
  progressLabel,
  studyMode,
  onAnswer,
  onExit,
  onExitLabel = 'Finish session',
  onShowAnswer,
}: StudyPageProps) {
  return (
    <section className="screen study-screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">Study</p>
          <h1>{studyMode === 'practice' ? 'Free practice' : 'Review session'}</h1>
        </div>
        <span className="counter">{progressLabel}</span>
      </header>

      <article className="flashcard">
        <p className="muted">{deck.title}</p>
        <h2>{card.word}</h2>
        {!isAnswerVisible ? (
          <button className="secondary-button reveal-button" onClick={onShowAnswer} type="button">
            Show translation
          </button>
        ) : (
          <div className="answer-panel">
            <strong>{card.translation}</strong>
            <p>{card.example}</p>
            <small>{card.comment}</small>
          </div>
        )}
      </article>

      <div className="study-actions">
        <button
          className="secondary-button"
          disabled={!isAnswerVisible}
          onClick={() => onAnswer(false)}
          type="button"
        >
          Don't know
        </button>
        <button
          className="primary-button"
          disabled={!isAnswerVisible}
          onClick={() => onAnswer(true)}
          type="button"
        >
          Know
        </button>
      </div>
      <button className="text-button" onClick={onExit} type="button">
        {onExitLabel}
      </button>
    </section>
  );
}

export default StudyPage;
