type SettingsPageProps = {
  onBack: () => void;
};

function SettingsPage({ onBack }: SettingsPageProps) {
  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">StudyFrog guide</p>
          <h1>How it works</h1>
        </div>
        <button className="icon-button" aria-label="Back home" onClick={onBack} type="button">
          ←
        </button>
      </header>

      <section className="settings-list guide-list" aria-label="How to use StudyFrog">
        <div className="setting-row">
          <strong>1. Create a deck</strong>
          <span>Add cards one by one or paste a list with Bulk add.</span>
        </div>
        <div className="setting-row">
          <strong>2. Choose a study mode</strong>
          <span>Review covers cards due today. Free practice uses every available card.</span>
        </div>
        <div className="setting-row">
          <strong>3. Keep learning</strong>
          <span>Know and Don&apos;t know update each card&apos;s progress and next review.</span>
        </div>
        <div className="setting-row">
          <strong>Ready-made decks</strong>
          <span>Browse a deck, add your own copy, then edit it however you like.</span>
        </div>
      </section>
    </section>
  );
}

export default SettingsPage;
