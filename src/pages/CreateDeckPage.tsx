import { useState } from 'react';

type CreateDeckPageProps = {
  onBack: () => void;
  onCreateDeck: (title: string) => void;
};

function CreateDeckPage({ onBack, onCreateDeck }: CreateDeckPageProps) {
  const [title, setTitle] = useState('');
  const isValid = title.trim().length > 0;

  return (
    <section className="screen">
      <header className="page-header">
        <div>
          <p className="eyebrow">New deck</p>
          <h1>Create deck</h1>
        </div>
        <button className="icon-button" aria-label="Back home" onClick={onBack} type="button">
          ←
        </button>
      </header>

      <section className="add-card-form">
        <label>
          Deck name
          <input
            onChange={(event) => setTitle(event.target.value)}
            maxLength={70}
            placeholder="For example: French"
            value={title}
          />
        </label>

        <button
          className="primary-button"
          disabled={!isValid}
          onClick={() => onCreateDeck(title.trim())}
          type="button"
        >
          Create
        </button>
      </section>
    </section>
  );
}

export default CreateDeckPage;
