import { useCallback, useEffect, useMemo, useState } from 'react';
import './App.css';
import {
  applyStudyAnswer,
  getDueCards,
  getDueCardsByDeck,
} from './entities/scheduling';
import type {
  Card,
  CardInput,
  Deck,
  DeckWithStats,
  SessionStats,
  StudyMode,
} from './entities/types';
import AppLayout from './layouts/AppLayout';
import AddCardsPage from './pages/AddCardsPage';
import BulkAddPage from './pages/BulkAddPage';
import CreateDeckPage from './pages/CreateDeckPage';
import DeckWordsPage from './pages/DeckWordsPage';
import HomePage from './pages/HomePage';
import PresetDecksPage from './pages/PresetDecksPage';
import PresetDeckWordsPage from './pages/PresetDeckWordsPage';
import SettingsPage from './pages/SettingsPage';
import StudyDeckSelectPage from './pages/StudyDeckSelectPage';
import StudyEmptyPage from './pages/StudyEmptyPage';
import StudyModeSelectPage from './pages/StudyModeSelectPage';
import StudyPage from './pages/StudyPage';
import StudyResultPage from './pages/StudyResultPage';
import { parseStudyFrogData } from './shared/importExport';
import { bulkCardLimit, hasValidCardLengths } from './shared/cardValidation';
import { presetDecks } from './shared/presetDecks';
import { readStorageValue, removeStorageValue, writeStorageValue } from './shared/storage';
import { getTelegramWebApp, initializeTelegramWebApp, type TelegramUser } from './shared/telegram';

type Page =
  | 'home'
  | 'presetDecks'
  | 'presetDeckWords'
  | 'createDeck'
  | 'studyDeckSelect'
  | 'studyModeSelect'
  | 'deckWords'
  | 'addCards'
  | 'bulkAdd'
  | 'settings'
  | 'study'
  | 'studyResult';

type PersistedState = {
  decks: Deck[];
  cards: Card[];
};

type StudyEmptyReason = 'noCards' | 'allHidden' | 'noDue';

type UndoItem =
  | { type: 'card'; card: Card }
  | { type: 'deck'; deck: Deck; cards: Card[] };

type PendingDeletion =
  | { type: 'card'; card: Card }
  | { type: 'deck'; deck: Deck; cards: Card[] };

const emptySessionStats: SessionStats = {
  studiedCount: 0,
  correctAnswers: 0,
  wrongAnswers: 0,
};

function shuffleIds(ids: string[]) {
  const shuffledIds = [...ids];

  for (let index = shuffledIds.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledIds[index], shuffledIds[randomIndex]] = [shuffledIds[randomIndex], shuffledIds[index]];
  }

  return shuffledIds;
}

function createId(prefix: string) {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `${prefix}-${crypto.randomUUID()}`;
  }

  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function loadInitialState(): PersistedState {
  const emptyState: PersistedState = {
    decks: [],
    cards: [],
  };

  if (typeof window === 'undefined') {
    return emptyState;
  }

  const storedValue = readStorageValue();

  if (!storedValue) {
    return emptyState;
  }

  try {
    const parsedValue = parseStudyFrogData(JSON.parse(storedValue));

    if (parsedValue) {
      return parsedValue;
    }

    removeStorageValue();
  } catch {
    removeStorageValue();
  }

  return emptyState;
}

function App() {
  const [initialState] = useState<PersistedState>(() => loadInitialState());
  const [activePage, setActivePage] = useState<Page>('home');
  const [decks, setDecks] = useState<Deck[]>(initialState.decks);
  const [cards, setCards] = useState<Card[]>(initialState.cards);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(initialState.decks[0]?.id ?? null);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [sessionStats, setSessionStats] = useState<SessionStats>(emptySessionStats);
  const [studyMode, setStudyMode] = useState<StudyMode>('review');
  const [studyCardIds, setStudyCardIds] = useState<string[]>([]);
  const [notification, setNotification] = useState<string | null>(null);
  const [undoItem, setUndoItem] = useState<UndoItem | null>(null);
  const [pendingDeletion, setPendingDeletion] = useState<PendingDeletion | null>(null);
  const [selectedPresetDeckId, setSelectedPresetDeckId] = useState<string | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);

  useEffect(() => initializeTelegramWebApp(setTelegramUser), []);

  useEffect(() => {
    writeStorageValue(
      JSON.stringify({
        decks,
        cards,
      }),
    );
  }, [cards, decks]);

  useEffect(() => {
    if (!undoItem) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setUndoItem(null), 6_000);
    return () => window.clearTimeout(timeout);
  }, [undoItem]);

  useEffect(() => {
    if (!notification) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setNotification(null), 4_000);
    return () => window.clearTimeout(timeout);
  }, [notification]);

  const now = new Date();
  const decksWithStats: DeckWithStats[] = decks
    .map((deck) => {
      const deckCards = cards.filter((card) => card.deckId === deck.id);
      const dueDeckCards = getDueCards(deckCards, now);
      const availableDeckCards = deckCards.filter((card) => !card.isHidden);

      return {
        ...deck,
        cardsCount: deckCards.length,
        dueCount: dueDeckCards.length,
        availableCount: availableDeckCards.length,
      };
    })
    .sort((firstDeck, secondDeck) => {
      const firstActivity = Date.parse(firstDeck.lastStudiedAt ?? firstDeck.createdAt);
      const secondActivity = Date.parse(secondDeck.lastStudiedAt ?? secondDeck.createdAt);

      return secondActivity - firstActivity;
    });

  const selectedDeck = useMemo(
    () => decks.find((deck) => deck.id === selectedDeckId),
    [decks, selectedDeckId],
  );
  const selectedPresetDeck = useMemo(
    () => presetDecks.find((deck) => deck.id === selectedPresetDeckId),
    [selectedPresetDeckId],
  );
  const deckRequiredPages: Page[] = ['deckWords', 'addCards', 'bulkAdd', 'studyModeSelect', 'study', 'studyResult'];
  const visiblePage = !selectedDeck && deckRequiredPages.includes(activePage) ? 'home' : activePage;

  const goTelegramBack = useCallback(() => {
    const previousPage: Partial<Record<Page, Page>> = {
      presetDecks: 'home',
      presetDeckWords: 'presetDecks',
      settings: 'home',
      createDeck: 'home',
      studyDeckSelect: 'home',
      studyModeSelect: 'studyDeckSelect',
      deckWords: 'studyDeckSelect',
      addCards: 'deckWords',
      bulkAdd: 'deckWords',
      study: 'studyDeckSelect',
      studyResult: 'home',
    };

    setActivePage(previousPage[visiblePage] ?? 'home');
  }, [visiblePage]);

  useEffect(() => {
    const backButton = getTelegramWebApp()?.BackButton;

    if (!backButton) {
      return undefined;
    }

    if (visiblePage === 'home') {
      backButton.hide();
      return undefined;
    }

    backButton.show();
    backButton.onClick(goTelegramBack);

    return () => {
      backButton.offClick(goTelegramBack);
      backButton.hide();
    };
  }, [goTelegramBack, visiblePage]);

  const selectedDeckCards = selectedDeck ? cards.filter((card) => card.deckId === selectedDeck.id) : [];
  const availableDeckCards = selectedDeckCards.filter((card) => !card.isHidden);
  const totalDueCards = getDueCards(cards, now).length;
  const validStudyCardIds = selectedDeck
    ? studyCardIds.filter((cardId) =>
        cards.some((card) => card.id === cardId && card.deckId === selectedDeck.id && !card.isHidden),
      )
    : [];
  const studyCards = selectedDeck
    ? validStudyCardIds
        .map((cardId) => cards.find((card) => card.id === cardId))
        .filter((card): card is Card => Boolean(card))
        .filter((card) => card.deckId === selectedDeck.id && !card.isHidden)
    : [];
  const currentCard = studyCards[0];
  const canPracticeSelectedDeck = availableDeckCards.length > 0;
  const studyEmptyReason: StudyEmptyReason =
    selectedDeckCards.length === 0 ? 'noCards' : canPracticeSelectedDeck ? 'noDue' : 'allHidden';

  const openAddCards = (deckId: string) => {
    setSelectedDeckId(deckId);
    setActivePage('addCards');
  };

  const openDeckWords = (deckId: string) => {
    setSelectedDeckId(deckId);
    setActivePage('deckWords');
  };

  const openBulkAdd = (deckId: string) => {
    setSelectedDeckId(deckId);
    setActivePage('bulkAdd');
  };

  const openStudyModeSelect = (deckId: string) => {
    setSelectedDeckId(deckId);
    setActivePage('studyModeSelect');
  };

  const openPresetDeck = (presetId: string) => {
    setSelectedPresetDeckId(presetId);
    setActivePage('presetDeckWords');
  };

  const cardKey = (word: string, translation: string) =>
    `${word.trim().toLocaleLowerCase()}\u0000${translation.trim().toLocaleLowerCase()}`;

  const restoreDeletedItem = () => {
    if (!undoItem) {
      return;
    }

    if (undoItem.type === 'card') {
      setCards((currentCards) =>
        currentCards.some((card) => card.id === undoItem.card.id)
          ? currentCards
          : [undoItem.card, ...currentCards],
      );
      setNotification('Card restored.');
    } else {
      setDecks((currentDecks) =>
        currentDecks.some((deck) => deck.id === undoItem.deck.id)
          ? currentDecks
          : [...currentDecks, undoItem.deck],
      );
      setCards((currentCards) => [
        ...undoItem.cards.filter((card) => !currentCards.some((currentCard) => currentCard.id === card.id)),
        ...currentCards,
      ]);
      setSelectedDeckId(undoItem.deck.id);
      setNotification('Deck restored.');
    }

    setUndoItem(null);
  };

  const requestDeleteDeck = (deckId: string) => {
    const deckToDelete = decks.find((deck) => deck.id === deckId);

    if (!deckToDelete) {
      return;
    }

    setPendingDeletion({
      type: 'deck',
      deck: deckToDelete,
      cards: cards.filter((card) => card.deckId === deckId),
    });
  };

  const confirmDeletion = () => {
    if (!pendingDeletion) {
      return;
    }

    if (pendingDeletion.type === 'card') {
      setCards((currentCards) => currentCards.filter((card) => card.id !== pendingDeletion.card.id));
      setUndoItem({ type: 'card', card: pendingDeletion.card });
      setNotification(`Deleted “${pendingDeletion.card.word}”.`);
      setPendingDeletion(null);
      return;
    }

    const nextSelectedDeckId = decks.find((deck) => deck.id !== pendingDeletion.deck.id)?.id ?? null;

    setDecks((currentDecks) => currentDecks.filter((deck) => deck.id !== pendingDeletion.deck.id));
    setCards((currentCards) => currentCards.filter((card) => card.deckId !== pendingDeletion.deck.id));

    if (selectedDeckId === pendingDeletion.deck.id) {
      setSelectedDeckId(nextSelectedDeckId);
      setStudyCardIds([]);
      setSessionStats(emptySessionStats);

      if (activePage !== 'studyDeckSelect') {
        setActivePage(nextSelectedDeckId ? 'studyDeckSelect' : 'home');
      }
    }

    setUndoItem({ type: 'deck', deck: pendingDeletion.deck, cards: pendingDeletion.cards });
    setNotification(`Deleted “${pendingDeletion.deck.title}”.`);
    setPendingDeletion(null);
  };

  const startStudy = (deckId: string, mode: StudyMode = 'review') => {
    const availableCards = cards.filter((card) => card.deckId === deckId && !card.isHidden);
    const reviewCards = getDueCardsByDeck(cards, deckId, new Date());
    const nextStudyCardIds =
      mode === 'practice'
        ? shuffleIds(availableCards.map((card) => card.id))
        : shuffleIds(reviewCards.map((card) => card.id));

    setSelectedDeckId(deckId);
    setStudyMode(mode);
    setStudyCardIds(nextStudyCardIds);
    setIsAnswerVisible(false);
    setSessionStats(emptySessionStats);
    setActivePage('study');
  };

  const createDeck = (title: string) => {
    if (title.length > 70) {
      setNotification('Deck name must be 70 characters or fewer.');
      return;
    }
    if (decks.some((deck) => deck.title.trim().toLocaleLowerCase() === title.trim().toLocaleLowerCase())) {
      setNotification('A deck with this name already exists. Choose a different name.');
      return;
    }

    const createdAt = new Date().toISOString();
    const id = createId('deck');
    const newDeck: Deck = {
      id,
      title,
      createdAt,
      updatedAt: createdAt,
    };

    setDecks((currentDecks) => [...currentDecks, newDeck]);
    setSelectedDeckId(id);
    setActivePage('addCards');
  };

  const uniqueDeckTitle = (baseTitle: string) => {
    const existingTitles = new Set(decks.map((deck) => deck.title.trim().toLocaleLowerCase()));

    if (!existingTitles.has(baseTitle.toLocaleLowerCase())) {
      return baseTitle;
    }

    let copyNumber = 1;
    let nextTitle = `${baseTitle} (${copyNumber})`;

    while (existingTitles.has(nextTitle.toLocaleLowerCase())) {
      copyNumber += 1;
      nextTitle = `${baseTitle} (${copyNumber})`;
    }

    return nextTitle;
  };

  const addPresetDeck = () => {
    if (!selectedPresetDeck) {
      return;
    }

    const createdAt = new Date().toISOString();
    const deckId = createId('deck');
    const title = uniqueDeckTitle(selectedPresetDeck.title);
    const newDeck: Deck = { id: deckId, title, createdAt, updatedAt: createdAt };
    const newCards: Card[] = selectedPresetDeck.cards.map((card) => ({
      id: createId('card'),
      deckId,
      word: card.word,
      translation: card.translation,
      example: card.example,
      comment: card.comment,
      status: 'new',
      isHidden: false,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      consecutiveCorrectCount: 0,
      consecutiveWrongCount: 0,
      createdAt,
      updatedAt: createdAt,
    }));

    setDecks((currentDecks) => [...currentDecks, newDeck]);
    setCards((currentCards) => [...newCards, ...currentCards]);
    setSelectedDeckId(deckId);
    setActivePage('studyDeckSelect');
    setNotification(`Added “${title}” to your decks.`);
  };

  const addCards = (cardInputs: CardInput[]) => {
    if (!selectedDeck) {
      return;
    }

    if (cardInputs.length > bulkCardLimit) {
      setNotification(`You can add up to ${bulkCardLimit} cards at once.`);
      return;
    }

    const invalidLengthCount = cardInputs.filter((cardInput) => !hasValidCardLengths(cardInput)).length;
    const existingKeys = new Set(selectedDeckCards.map((card) => cardKey(card.word, card.translation)));
    const inputsToCreate = cardInputs.filter((cardInput) => {
      if (!hasValidCardLengths(cardInput)) {
        return false;
      }

      const key = cardKey(cardInput.word, cardInput.translation);

      if (existingKeys.has(key)) {
        return false;
      }

      existingKeys.add(key);
      return true;
    });

    if (invalidLengthCount > 0) {
      setNotification(`${invalidLengthCount} ${invalidLengthCount === 1 ? 'card exceeds' : 'cards exceed'} the allowed character limits.`);
    } else if (inputsToCreate.length !== cardInputs.length) {
      setNotification(
        `${cardInputs.length - inputsToCreate.length} duplicate ${cardInputs.length - inputsToCreate.length === 1 ? 'card was' : 'cards were'} not added.`,
      );
    }

    const createdAt = new Date().toISOString();
    const newCards: Card[] = inputsToCreate.map((cardInput) => ({
      id: createId('card'),
      deckId: selectedDeck.id,
      word: cardInput.word,
      translation: cardInput.translation,
      example: cardInput.example,
      comment: cardInput.comment,
      status: 'new',
      isHidden: false,
      reviewCount: 0,
      correctCount: 0,
      wrongCount: 0,
      consecutiveCorrectCount: 0,
      consecutiveWrongCount: 0,
      createdAt,
      updatedAt: createdAt,
    }));

    setCards((currentCards) => [...newCards, ...currentCards]);
  };

  const addCard = (cardInput: CardInput) => {
    addCards([cardInput]);
  };

  const editCard = (cardId: string, cardInput: CardInput) => {
    const currentCard = cards.find((card) => card.id === cardId);

    if (!currentCard) {
      return false;
    }

    if (!hasValidCardLengths(cardInput)) {
      setNotification('This card exceeds the allowed character limits.');
      return false;
    }

    if (
      cards.some(
        (card) =>
          card.id !== cardId &&
          card.deckId === currentCard.deckId &&
          cardKey(card.word, card.translation) === cardKey(cardInput.word, cardInput.translation),
      )
    ) {
      setNotification('This card already exists in this deck.');
      return false;
    }

    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              ...cardInput,
              updatedAt: new Date().toISOString(),
            }
          : card,
      ),
    );
    return true;
  };

  const requestDeleteCard = (cardId: string) => {
    const cardToDelete = cards.find((card) => card.id === cardId);

    if (!cardToDelete) {
      return;
    }

    setPendingDeletion({ type: 'card', card: cardToDelete });
  };

  const renameDeck = (deckId: string, title: string) => {
    const nextTitle = title.trim();

    if (!nextTitle) {
      setNotification('Deck name cannot be empty.');
      return false;
    }

    if (nextTitle.length > 70) {
      setNotification('Deck name must be 70 characters or fewer.');
      return false;
    }

    if (
      decks.some(
        (deck) => deck.id !== deckId && deck.title.trim().toLocaleLowerCase() === nextTitle.toLocaleLowerCase(),
      )
    ) {
      setNotification('A deck with this name already exists. Choose a different name.');
      return false;
    }

    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === deckId ? { ...deck, title: nextTitle, updatedAt: new Date().toISOString() } : deck,
      ),
    );
    setNotification('Deck renamed.');
    return true;
  };

  const toggleCardHidden = (cardId: string) => {
    setCards((currentCards) =>
      currentCards.map((card) =>
        card.id === cardId
          ? {
              ...card,
              isHidden: !card.isHidden,
              updatedAt: new Date().toISOString(),
            }
          : card,
      ),
    );
  };

  const answerCard = (isKnown: boolean) => {
    if (!selectedDeck) {
      setStudyCardIds([]);
      setActivePage('home');
      return;
    }

    if (!currentCard) {
      setStudyCardIds([]);
      setActivePage(sessionStats.studiedCount > 0 ? 'studyResult' : 'study');
      return;
    }

    const answeredAt = new Date();
    const result = applyStudyAnswer(currentCard, isKnown ? 'know' : 'unknown', answeredAt);
    const updatedCards = cards.map((card) => (card.id === result.card.id ? result.card : card));
    const remainingStudyCardIds = validStudyCardIds.filter((cardId) => cardId !== currentCard.id);

    setCards(updatedCards);
    setDecks((currentDecks) =>
      currentDecks.map((deck) =>
        deck.id === selectedDeck.id
          ? { ...deck, lastStudiedAt: answeredAt.toISOString(), updatedAt: answeredAt.toISOString() }
          : deck,
      ),
    );
    setSessionStats((currentStats) => ({
      studiedCount: currentStats.studiedCount + 1,
      correctAnswers: currentStats.correctAnswers + (isKnown ? 1 : 0),
      wrongAnswers: currentStats.wrongAnswers + (isKnown ? 0 : 1),
    }));
    setIsAnswerVisible(false);

    if (remainingStudyCardIds.length > 0) {
      setStudyCardIds(remainingStudyCardIds);
      return;
    }

    if (studyMode === 'practice') {
      const nextPracticeCardIds = updatedCards
        .filter((card) => card.deckId === selectedDeck.id && !card.isHidden)
        .map((card) => card.id);

      if (nextPracticeCardIds.length === 0) {
        setStudyCardIds([]);
        setActivePage('studyResult');
        return;
      }

      setStudyCardIds(shuffleIds(nextPracticeCardIds));
      return;
    }

    setStudyCardIds([]);
    setActivePage('studyResult');
  };

  return (
    <AppLayout>
      {visiblePage === 'home' ? (
        <HomePage
          avatarLabel={(telegramUser?.username ?? telegramUser?.first_name ?? 'StudyFrog').trim().charAt(0).toUpperCase()}
          avatarName={telegramUser?.username ? `@${telegramUser.username}` : telegramUser?.first_name ?? ''}
          decksCount={decks.length}
          dueCardsCount={totalDueCards}
          onCreateDeck={() => setActivePage('createDeck')}
          onExplorePresetDecks={() => setActivePage('presetDecks')}
          onOpenSettings={() => setActivePage('settings')}
          onStartStudy={() => setActivePage('studyDeckSelect')}
        />
      ) : null}

      {visiblePage === 'presetDecks' ? (
        <PresetDecksPage
          decks={presetDecks}
          onBack={() => setActivePage('home')}
          onOpenDeck={openPresetDeck}
        />
      ) : null}

      {visiblePage === 'presetDeckWords' && selectedPresetDeck ? (
        <PresetDeckWordsPage
          deck={selectedPresetDeck}
          onAddToMyDecks={addPresetDeck}
          onBack={() => setActivePage('presetDecks')}
        />
      ) : null}

      {visiblePage === 'settings' ? (
        <SettingsPage onBack={() => setActivePage('home')} />
      ) : null}

      {visiblePage === 'createDeck' ? (
        <CreateDeckPage
          onBack={() => setActivePage('home')}
          onCreateDeck={createDeck}
        />
      ) : null}

      {visiblePage === 'studyDeckSelect' ? (
        <StudyDeckSelectPage
          decks={decksWithStats}
          onBack={() => setActivePage('home')}
          onCreateDeck={() => setActivePage('createDeck')}
          onDeleteDeck={requestDeleteDeck}
          onAddWords={openAddCards}
          onSelectDeck={openStudyModeSelect}
          onViewWords={openDeckWords}
        />
      ) : null}

      {visiblePage === 'deckWords' && selectedDeck ? (
        <DeckWordsPage
          deckCards={selectedDeckCards}
          deck={selectedDeck}
          onBack={() => setActivePage('studyDeckSelect')}
          onAddWords={() => openAddCards(selectedDeck.id)}
          onOpenBulkAdd={() => openBulkAdd(selectedDeck.id)}
          onDeleteCard={requestDeleteCard}
          onEditCard={editCard}
          onRenameDeck={renameDeck}
          onToggleHidden={toggleCardHidden}
        />
      ) : null}

      {visiblePage === 'bulkAdd' && selectedDeck ? (
        <BulkAddPage
          deck={selectedDeck}
          deckCards={selectedDeckCards}
          onAddCards={addCards}
          onBack={() => setActivePage('deckWords')}
        />
      ) : null}

      {visiblePage === 'studyModeSelect' && selectedDeck ? (
        getDueCardsByDeck(cards, selectedDeck.id, new Date()).length > 0 ? (
          <StudyModeSelectPage
            availableCount={availableDeckCards.length}
            deck={selectedDeck}
            dueCount={getDueCardsByDeck(cards, selectedDeck.id, new Date()).length}
            onBack={() => setActivePage('studyDeckSelect')}
            onStartFreePractice={() => startStudy(selectedDeck.id, 'practice')}
            onStartReview={() => startStudy(selectedDeck.id, 'review')}
          />
        ) : (
          <StudyEmptyPage
            deck={selectedDeck}
            reason={studyEmptyReason}
            onBack={() => setActivePage('studyDeckSelect')}
            onPractice={() => startStudy(selectedDeck.id, 'practice')}
          />
        )
      ) : null}

      {visiblePage === 'addCards' && selectedDeck ? (
        <AddCardsPage
          addedCards={selectedDeckCards}
          deck={selectedDeck}
          onAddCard={addCard}
          onBack={() => setActivePage('studyDeckSelect')}
        />
      ) : null}

      {visiblePage === 'study' && selectedDeck && currentCard ? (
        <StudyPage
          card={currentCard}
          deck={selectedDeck}
          isAnswerVisible={isAnswerVisible}
          progressLabel={`${sessionStats.studiedCount + 1} / ${
            sessionStats.studiedCount + studyCards.length
          }`}
          onAnswer={answerCard}
          studyMode={studyMode}
          onExitLabel={studyMode === 'practice' ? 'Finish Practice' : 'Finish session'}
          onExit={() => setActivePage('studyResult')}
          onShowAnswer={() => setIsAnswerVisible(true)}
        />
      ) : null}

      {visiblePage === 'study' && selectedDeck && !currentCard ? (
        sessionStats.studiedCount > 0 ? (
          <StudyResultPage
            canPractice={canPracticeSelectedDeck}
            deckTitle={selectedDeck.title}
            correctAnswers={sessionStats.correctAnswers}
            studiedCount={sessionStats.studiedCount}
            wrongAnswers={sessionStats.wrongAnswers}
            onBackHome={() => setActivePage('home')}
            onPracticeAgain={() => startStudy(selectedDeck.id, 'practice')}
            onStudyAgain={() => startStudy(selectedDeck.id)}
          />
        ) : (
          <StudyEmptyPage
            deck={selectedDeck}
            reason={studyEmptyReason}
            onBack={() => setActivePage('studyDeckSelect')}
            onPractice={() => startStudy(selectedDeck.id, 'practice')}
          />
        )
      ) : null}

      {visiblePage === 'studyResult' && selectedDeck ? (
        <StudyResultPage
          canPractice={canPracticeSelectedDeck}
          deckTitle={selectedDeck.title}
          correctAnswers={sessionStats.correctAnswers}
          studiedCount={sessionStats.studiedCount}
          wrongAnswers={sessionStats.wrongAnswers}
          onBackHome={() => setActivePage('home')}
          onPracticeAgain={() => startStudy(selectedDeck.id, 'practice')}
          onStudyAgain={() => startStudy(selectedDeck.id)}
        />
      ) : null}
      {notification ? <div className="app-notice" role="status">{notification}</div> : null}
      {undoItem ? (
        <button className="undo-notice" onClick={restoreDeletedItem} type="button">
          Undo deletion
        </button>
      ) : null}
      {pendingDeletion ? (
        <div className="dialog-backdrop" role="presentation">
          <section aria-labelledby="delete-dialog-title" aria-modal="true" className="confirm-dialog" role="dialog">
            <h2 id="delete-dialog-title">Delete {pendingDeletion.type === 'deck' ? 'deck' : 'card'}?</h2>
            <p className="muted">
              {pendingDeletion.type === 'deck'
                ? `“${pendingDeletion.deck.title}” and its ${pendingDeletion.cards.length} ${pendingDeletion.cards.length === 1 ? 'card' : 'cards'} will be removed.`
                : `“${pendingDeletion.card.word}” will be removed from this deck.`}
            </p>
            <p className="muted">You can undo this for a few seconds after deletion.</p>
            <div className="dialog-actions">
              <button className="secondary-button" onClick={() => setPendingDeletion(null)} type="button">Cancel</button>
              <button className="danger-button" onClick={confirmDeletion} type="button">Delete</button>
            </div>
          </section>
        </div>
      ) : null}
    </AppLayout>
  );
}

export default App;
