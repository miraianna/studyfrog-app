type HomePageProps = {
  avatarLabel: string;
  avatarName: string;
  decksCount: number;
  dueCardsCount: number;
  onCreateDeck: () => void;
  onExplorePresetDecks: () => void;
  onOpenSettings: () => void;
  onStartStudy: () => void;
};

function HomePage({
  avatarLabel,
  avatarName,
  decksCount,
  dueCardsCount,
  onCreateDeck,
  onExplorePresetDecks,
  onOpenSettings,
  onStartStudy,
}: HomePageProps) {
  const hasDecks = decksCount > 0;

  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">Home</p>
          <h1>🐸 StudyFrog</h1>
          <p className="welcome-text">Welcome back</p>
          <p className="due-summary">{dueCardsCount} cards due today</p>
        </div>
        <button aria-label={`Open guide${avatarName ? ` for ${avatarName}` : ''}`} className="avatar" onClick={onOpenSettings} type="button">
          {avatarLabel}
        </button>
      </header>

      {hasDecks ? (
        <section className="home-actions">
          <button className="primary-button" onClick={onStartStudy} type="button">
            Start study
          </button>
          <button className="secondary-button" onClick={onCreateDeck} type="button">
            Create deck
          </button>
          <button className="secondary-button" onClick={onExplorePresetDecks} type="button">
            Explore ready-made decks
          </button>
        </section>
      ) : (
        <section className="empty-study-card home-empty-state">
          <h2>No decks yet</h2>
          <p className="muted">Create your first deck to start learning.</p>
          <button className="primary-button" onClick={onCreateDeck} type="button">
            Create deck
          </button>
          <button className="secondary-button" onClick={onExplorePresetDecks} type="button">
            Explore ready-made decks
          </button>
        </section>
      )}
    </section>
  );
}

export default HomePage;
