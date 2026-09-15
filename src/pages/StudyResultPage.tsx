type StudyResultPageProps = {
  canPractice: boolean;
  deckTitle: string;
  correctAnswers: number;
  studiedCount: number;
  wrongAnswers: number;
  onBackHome: () => void;
  onPracticeAgain: () => void;
  onStudyAgain: () => void;
};

function StudyResultPage({
  canPractice,
  deckTitle,
  correctAnswers,
  studiedCount,
  wrongAnswers,
  onBackHome,
  onPracticeAgain,
  onStudyAgain,
}: StudyResultPageProps) {
  const accuracy = studiedCount > 0 ? Math.round((correctAnswers / studiedCount) * 100) : 0;

  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">Session complete</p>
          <h1>Nice work</h1>
        </div>
      </header>

      <section className="result-hero">
        <p className="muted">{deckTitle} review</p>
        <strong>{studiedCount}</strong>
        <span>cards studied</span>
      </section>

      <section className="summary-grid result-grid">
        <div>
          <strong>{studiedCount}</strong>
          <span>Cards studied</span>
        </div>
        <div>
          <strong>{correctAnswers}</strong>
          <span>Correct answers</span>
        </div>
        <div>
          <strong>{wrongAnswers}</strong>
          <span>Wrong answers</span>
        </div>
        <div>
          <strong>{accuracy}%</strong>
          <span>Accuracy</span>
        </div>
      </section>

      <button className="primary-button" onClick={onBackHome} type="button">
        Back home
      </button>
      <button className="secondary-button full-width-button" onClick={onStudyAgain} type="button">
        Study again
      </button>
      {canPractice ? (
        <button className="secondary-button full-width-button" onClick={onPracticeAgain} type="button">
          Free practice again
        </button>
      ) : null}
    </section>
  );
}

export default StudyResultPage;
