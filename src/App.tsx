import { useState, useCallback, type ReactNode } from 'react';
import {
  Briefcase,
  GraduationCap,
  Home,
  MessageCircleMore,
  ShoppingBag,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId, Message, Scenario, Struggle, SupportFeedback } from './types';
import { CATEGORIES, getCategoryById, getScenariosForCategory } from './lib/scenarios';
import { HomeScreen } from './components/HomeScreen';
import { TopicSelectionScreen } from './components/TopicSelectionScreen';
import { ScenarioScreen } from './components/ScenarioScreen';
import { ConversationScreen } from './components/ConversationScreen';
import { SupportScreen } from './components/SupportScreen';
import { PronunciationScreen } from './components/PronunciationScreen';
import type { PronunciationItem } from './components/PronunciationScreen';
import { ROHINGYA_UI } from './lib/rohingya';
import './index.css';

const TEST_ITEMS: PronunciationItem[] = [
  { label: 'Word', text: 'appointment' },
  { label: 'Phrase', text: 'My child is sick today' },
  { label: 'Full sentence', text: 'My child has a fever and will not be coming to school today.' },
];

const CATEGORY_ICONS: Record<CategoryId, LucideIcon> = {
  healthcare: Stethoscope,
  school: GraduationCap,
  everyday: ShoppingBag,
  work: Briefcase,
  general: MessageCircleMore,
};

type Screen =
  | 'home'
  | 'topics'
  | 'scenario'
  | 'conversation'
  | 'support'
  | 'pronunciation'
  | 'pronunciation-test';

export default function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId | null>(null);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [supportFeedback, setSupportFeedback] = useState<SupportFeedback | null>(null);
  const [struggles, setStruggles] = useState<Struggle[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const [pronunciationItems, setPronunciationItems] = useState<PronunciationItem[]>([]);

  const handleGoHome = useCallback(() => {
    setSelectedCategory(null);
    setSelectedScenario(null);
    setSupportFeedback(null);
    setStruggles([]);
    setRetryCount(0);
    setScreen('home');
  }, []);

  const handleGoToTopics = useCallback(() => {
    setSelectedCategory(null);
    setSelectedScenario(null);
    setSupportFeedback(null);
    setStruggles([]);
    setRetryCount(0);
    setScreen('topics');
  }, []);

  const handleSelectCategory = useCallback((categoryId: CategoryId) => {
    setSelectedCategory(categoryId);
    setSelectedScenario(null);
    setSupportFeedback(null);
    setStruggles([]);
    setRetryCount(0);
    setScreen('scenario');
  }, []);

  const handleSelectScenario = useCallback((scenario: Scenario) => {
    setSelectedScenario(scenario);
    setRetryCount(0);
    setSupportFeedback(null);
    setStruggles([]);
    setScreen('conversation');
  }, []);

  const handleConversationComplete = useCallback(
    (_messages: Message[], feedback: SupportFeedback, sessionStruggles: Struggle[]) => {
      setSupportFeedback(feedback);
      setStruggles(sessionStruggles);
      setScreen('support');
    },
    [],
  );

  const handleRetryScenario = useCallback(() => {
    setRetryCount((count) => count + 1);
    setSupportFeedback(null);
    setStruggles([]);
    setScreen('conversation');
  }, []);

  const handleStartLesson = useCallback(() => {
    if (!supportFeedback) return;
    setPronunciationItems([
      { label: 'Word', text: supportFeedback.practice_word },
      { label: 'Phrase', text: supportFeedback.practice_phrase },
      { label: 'Full sentence', text: supportFeedback.practice_sentence },
    ]);
    setScreen('pronunciation');
  }, [supportFeedback]);

  const category = selectedCategory ? getCategoryById(selectedCategory) : null;
  const scenarios = selectedCategory ? getScenariosForCategory(selectedCategory) : [];

  const marketingShell = (content: ReactNode, showHomeButton = screen !== 'home') => (
    <div className="app-shell">
      <div className="app-backdrop" aria-hidden="true" />
      <div className="app-container">
        <header className="app-header">
          <div className="brand-lockup">
            <div className="brand-mark" aria-hidden="true" />
            <div>
              <p className="brand-kicker">Voice practice for newcomer moms</p>
              <h1>MotherMind</h1>
            </div>
          </div>

          {showHomeButton && (
            <button className="btn btn-secondary btn-icon" onClick={handleGoHome} title="Return home">
              <Home size={18} />
              <span className="flex flex-col items-start leading-tight">
                <span>Home</span>
                <span className="text-[0.72rem] font-medium opacity-75">{ROHINGYA_UI.home}</span>
              </span>
            </button>
          )}
        </header>
        <main className="main-content">{content}</main>
      </div>
    </div>
  );

  if (screen === 'home') {
    return marketingShell(<HomeScreen onContinue={handleGoToTopics} />);
  }

  if (screen === 'topics') {
    return marketingShell(
      <TopicSelectionScreen
        categories={CATEGORIES.map((categoryItem) => ({
          id: categoryItem.id,
          label: categoryItem.title,
          helperLabel: ROHINGYA_UI.categories[categoryItem.id],
          icon: CATEGORY_ICONS[categoryItem.id],
          color: categoryItem.color,
          description: categoryItem.description,
          phraseCount: getScenariosForCategory(categoryItem.id).length,
        }))}
        onBack={handleGoHome}
        onSelectCategory={handleSelectCategory}
      />,
    );
  }

  if (screen === 'pronunciation-test') {
    return (
      <PronunciationScreen
        items={TEST_ITEMS}
        categoryColor="#7c3aed"
        onDone={handleGoToTopics}
      />
    );
  }

  if (screen === 'scenario') {
    if (!category) return null;
    return marketingShell(
      <ScenarioScreen
        category={category}
        scenarios={scenarios}
        onSelectScenario={handleSelectScenario}
        onBack={handleGoToTopics}
      />,
    );
  }

  if (screen === 'conversation') {
    if (!selectedScenario || !category) return null;
    return (
      <ConversationScreen
        key={`${selectedScenario.id}-${retryCount}`}
        scenario={selectedScenario}
        categoryColor={category.color}
        onComplete={handleConversationComplete}
        onBack={() => setScreen('scenario')}
        onGoHome={handleGoToTopics}
      />
    );
  }

  if (screen === 'support') {
    if (!selectedScenario || !category || !supportFeedback) return null;
    void struggles;
    return (
      <SupportScreen
        scenario={selectedScenario}
        feedback={supportFeedback}
        categoryColor={category.color}
        onRetryScenario={handleRetryScenario}
        onGoHome={handleGoToTopics}
        onStartLesson={handleStartLesson}
      />
    );
  }

  if (screen === 'pronunciation') {
    return (
      <PronunciationScreen
        items={pronunciationItems}
        categoryColor={category?.color ?? '#7c3aed'}
        onDone={handleGoToTopics}
      />
    );
  }

  return null;
}
