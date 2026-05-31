import './App.css';

function App() {
  return (
    <main className="app">
      <div className="phone">
        <header>
          <h1>🐸 StudyFrog</h1>
          <p>Welcome back, Anna</p>
        </header>

        <section className="today-card">
          <h2>Today's review</h2>
          <div className="counter">12 cards</div>
          <button>Start study</button>
        </section>

        <section>
          <h2>Your decks</h2>

          <div className="deck">
            <span>🇪🇸 Spanish</span>
            <span>153 cards</span>
          </div>

          <div className="deck">
            <span>🇬🇧 English</span>
            <span>48 cards</span>
          </div>

          <div className="deck">
            <span>💻 IT Terms</span>
            <span>71 cards</span>
          </div>
        </section>
      </div>
    </main>
  );
}

export default App;