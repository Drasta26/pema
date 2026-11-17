import { useState, useEffect } from 'react';
import { EmotionalState, MeditationSession, FeedbackType } from './types';
import CheckIn from './components/CheckIn';
import SessionPlayer from './components/SessionPlayer';
import SessionExit from './components/SessionExit';
import CrisisSupport from './components/CrisisSupport';
import GuidedLibrary, { PracticeCards } from './components/GuidedLibrary';
import MentalSpa from './components/MentalSpa';
import QuickReset from './components/QuickReset';
import InstallHelp from './components/InstallHelp';
import AiKeyPanel from './components/AiKeyPanel';
import YourDataPanel from './components/YourDataPanel';
import { stripPauseMarkers } from './sessionText';
import { getApiKey, removeApiKey } from './apiKey';

// Claude's code loads only when a session starts, keeping the first screen fast
const loadClaude = () => import('./claudeService');
import { registerServiceWorker } from './pwa';
import { detectCrisis } from './safety';
import { Calendar, ShieldCheck, Award, Info, Lock, RefreshCw, KeyRound, Home, Sparkles, PlayCircle, Menu, ChevronRight } from 'lucide-react';

interface LocalSessionLog {
  id: string;
  date: string;
  state?: EmotionalState; // absent for practices without a check-in, e.g. the Mental SPA
  technique: string;
  rating: 'up' | 'down' | null;
  notes: string;
  endState?: EmotionalState;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'checkin' | 'player' | 'exit' | 'crisis' | 'spa' | 'reset'>('checkin');
  // Screen to return to if the user says they are safe and continues
  const [crisisFrom, setCrisisFrom] = useState<'checkin' | 'player' | 'exit'>('checkin');
  const [session, setSession] = useState<MeditationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Local state persistence logs
  const [history, setHistory] = useState<LocalSessionLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [showDataPanel, setShowDataPanel] = useState(false);
  // Pages on the home screen, chosen from the bottom menu; each fits without scrolling
  const [tab, setTab] = useState<'checkin' | 'practise' | 'guided' | 'history' | 'more'>('checkin');
  // Set when a new version of the app has been downloaded and is ready
  const [showKeyPanel, setShowKeyPanel] = useState(false);
  const [keyRejected, setKeyRejected] = useState(false);
  const [hasKey, setHasKey] = useState(() => !!getApiKey());
  const [applyUpdate, setApplyUpdate] = useState<(() => void) | null>(null);

  useEffect(() => {
    registerServiceWorker(apply => setApplyUpdate(() => apply));
  }, []);

  // Load on-device history on initial load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_meditation_logs');
      if (stored) {
        const parsed: LocalSessionLog[] = JSON.parse(stored);
        setHistory(parsed);
        calculateStreak(parsed);
      }
      // Remove the sign-in record left by earlier versions
      localStorage.removeItem('pema_user');
    } catch (e) {
      console.error("Local storage lookup failed", e);
    }
  }, []);

  const calculateStreak = (logs: LocalSessionLog[]) => {
    if (logs.length === 0) {
      setStreak(0);
      return;
    }

    // Sort logs descending by date
    const sortedDates = logs
      .map(log => new Date(log.date).toDateString())
      .filter((value, index, self) => self.indexOf(value) === index) // Unique dates
      .map(dStr => new Date(dStr));

    sortedDates.sort((a, b) => b.getTime() - a.getTime());

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const firstDate = sortedDates[0];
    const isToday = firstDate.toDateString() === today.toDateString();
    const isYesterday = firstDate.toDateString() === yesterday.toDateString();

    if (!isToday && !isYesterday) {
      setStreak(0);
      return;
    }

    let currentStreak = 1;
    for (let i = 0; i < sortedDates.length - 1; i++) {
      const current = sortedDates[i];
      const next = sortedDates[i + 1];

      const diffTime = current.getTime() - next.getTime();
      const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
      } else if (diffDays > 1) {
        break; // streak interrupted
      }
    }
    setStreak(currentStreak);
  };

  const showCrisisSupport = (from: 'checkin' | 'player' | 'exit') => {
    setCrisisFrom(from);
    setErrorMessage(null);
    setCurrentScreen('crisis');
  };

  const handleStartSession = async (data: { description: string; explicitState?: EmotionalState }) => {
    // Checked on the device, so crisis text is never sent to the AI
    if (detectCrisis(data.description)) {
      showCrisisSupport('checkin');
      return;
    }
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const { generateInitialSession } = await loadClaude();
      const sessionObj = stripPauseMarkers(await generateInitialSession({
        description: data.description,
        explicitState: data.explicitState
      }));
      setSession(sessionObj);
      setCurrentScreen('player');
    } catch (err: any) {
      if (err?.name === 'KeyRejectedError') {
        setKeyRejected(true);
        setShowKeyPanel(true);
      } else {
        setErrorMessage(err.message || "An unexpected error occurred. Please try launching again.");
      }
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdaptiveFeedback = async (feedbackType: FeedbackType, userText?: string) => {
    if (!session) return;
    if (detectCrisis(userText)) {
      showCrisisSupport('player');
      return;
    }
    setIsLoadingFeedback(true);
    setErrorMessage(null);
    try {
      const { generateAdaptiveFeedback } = await loadClaude();
      const updatedSession = stripPauseMarkers(await generateAdaptiveFeedback(session, feedbackType, userText));
      // Maintain session ID for history consistency
      updatedSession.id = session.id;
      setSession(updatedSession);
    } catch (err: any) {
      setErrorMessage(err?.name === 'KeyRejectedError'
        ? "Anthropic didn't accept your AI key. Finish this session, then check the key on the home screen."
        : err.message || "Could not adapt session dynamically.");
      console.error(err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleSaveExitReview = (feedback: { rating: 'up' | 'down' | null; notes: string; endState?: EmotionalState }) => {
    if (!session) return;
    
    const newLog: LocalSessionLog = {
      id: session.id,
      date: new Date().toISOString(),
      state: session.state,
      technique: session.techniqueName,
      rating: feedback.rating,
      notes: feedback.notes,
      endState: feedback.endState
    };

    const updatedHistory = [newLog, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('ai_meditation_logs', JSON.stringify(updatedHistory));
    calculateStreak(updatedHistory);

    if (detectCrisis(feedback.notes)) {
      showCrisisSupport('exit');
    }
  };

  // Practices without an AI session (e.g. the Mental SPA) still count towards the streak
  const recordPractice = (technique: string) => {
    const newLog: LocalSessionLog = {
      id: `practice_${Date.now()}`,
      date: new Date().toISOString(),
      technique,
      rating: null,
      notes: ''
    };
    const updatedHistory = [newLog, ...history];
    setHistory(updatedHistory);
    localStorage.setItem('ai_meditation_logs', JSON.stringify(updatedHistory));
    calculateStreak(updatedHistory);
  };

  // Downloads the history as a JSON file the user keeps. The AI key is never included.
  const handleExportHistory = () => {
    const file = new Blob([JSON.stringify({ app: 'PeMA', exported: new Date().toISOString(), history }, null, 2)], { type: 'application/json' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(file);
    link.download = `pema-history-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(link.href);
  };

  // Removes everything PeMA keeps on this device
  const handleDeleteAll = () => {
    localStorage.removeItem('ai_meditation_logs');
    removeApiKey();
    setHistory([]);
    setStreak(0);
    setHasKey(false);
    setShowDataPanel(false);
  };

  return (
    <div className="min-h-[100dvh] sm:py-8 sm:px-4 flex flex-col justify-center items-center font-sans selection:bg-orange-100">
      
      {/* Immersive Mobile Device Wrapper - Futuristic Zen Device */}
      <div className="mobile-device-wrapper flex flex-col justify-between h-[100dvh] sm:h-[660px]">
        
        {/* Shimmering Solar Caustics Background layer */}
        <div className="caustics-backdrop" />
        
        {/* Futuristic Glassmorphic Status Bar Header */}
        <header className="app-header w-full pb-3 pt-[max(0.75rem,env(safe-area-inset-top))] px-3 sm:px-5 z-10">
          <div className="flex justify-between items-center">
            
            {/* Logo, Status, & Custom PeMA Identity */}
            <div className="flex items-center gap-2">
              <span 
                className="p-1 px-1.5 bg-gradient-to-tr from-orange-500/10 to-amber-300/5 rounded-xl border border-orange-100 text-lg shadow-sm animate-emoji-breath flex items-center justify-center shrink-0"
                title="Take a deep breath ✨"
              >
                <span>🧘</span>
              </span>
              <div>
                <span className="font-display font-medium text-base text-stone-900 tracking-tight flex items-baseline gap-1.5">
                  <em className="italic font-bold text-custom-blue">PeMA</em>
                  <span className="not-italic font-sans text-[10px] font-normal text-custom-blue/80 whitespace-nowrap">&copy; 2026 · Built by द्रष्टा (Drasta)</span>
                </span>
                <span className="block text-[10px] font-sans tracking-normal text-custom-blue/80">
                  Personalised Mindfulness Assistant
                </span>
              </div>
            </div>

            {/* Streak & User Status Indicator */}
            <div className="flex items-center gap-1.5 shrink-0 relative">
              <div className="flex items-center gap-1 bg-blue-50/80 border border-blue-100 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-custom-blue shadow-xs">
                <Award className="w-3 h-3 text-blue-500" />
                <span className="text-custom-blue">{streak}d</span>
              </div>
            </div>

          </div>
        </header>

        {/* Primary Interactive Viewport */}
        <div className={`flex-1 relative px-1 py-1 z-10 ${currentScreen === 'checkin' ? 'overflow-hidden pb-9' : 'overflow-y-auto scroller-none'}`}>
          
          {/* Internal Error System */}
          {errorMessage && (
            <div className="px-4 py-2 mt-2 animate-slide-in">
              <div className="bg-red-50 border border-red-200 text-red-900 rounded-xl p-3.5 text-xs flex items-start gap-2.5">
                <Info className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
                <div>
                  <span className="font-bold block text-sm">Something went wrong</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            </div>
          )}

          {applyUpdate && (
            <div className="px-4 pt-3 animate-slide-in">
              <button
                type="button"
                onClick={() => applyUpdate()}
                className="w-full futuristic-btn flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-white cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" /> New version available, tap to update
              </button>
            </div>
          )}

          {/* Settings panels open over the page, so the page never grows or scrolls */}
          {currentScreen === 'checkin' && (showKeyPanel || showDataPanel) && (
            <div className="absolute inset-0 z-20 pt-1 bg-[#ffe3c2]/70 backdrop-blur-sm" onClick={e => { if (e.target === e.currentTarget) { setShowKeyPanel(false); setShowDataPanel(false); } }}>
          {showKeyPanel && (
            <AiKeyPanel
              rejected={keyRejected}
              onClose={() => { setShowKeyPanel(false); setKeyRejected(false); }}
              onChange={() => { setHasKey(!!getApiKey()); setKeyRejected(false); }}
            />
          )}
          {showDataPanel && (
            <YourDataPanel
              historyCount={history.length}
              onExport={handleExportHistory}
              onDeleteAll={handleDeleteAll}
              onClose={() => setShowDataPanel(false)}
            />
          )}
            </div>
          )}

          {/* Home pages, one at a time */}
          {currentScreen === 'checkin' && tab === 'checkin' && <CheckIn onSubmit={handleStartSession} isLoading={isLoading} installTip={<InstallHelp />} />}
          {currentScreen === 'checkin' && tab === 'practise' && (
            <PracticeCards onStartSpa={() => setCurrentScreen('spa')} onStartReset={() => setCurrentScreen('reset')} />
          )}
          {currentScreen === 'checkin' && tab === 'guided' && <GuidedLibrary />}
          {currentScreen === 'checkin' && tab === 'more' && (
            <div className="px-4 pt-3 space-y-3 animate-fade-in">
              <h1 className="text-xl font-serif italic font-medium text-amber-950 text-center">More</h1>
              {([
                [KeyRound, 'Your AI key', hasKey ? 'On: Claude uses your own key' : 'Add your key for personalised sessions', () => setShowKeyPanel(true)],
                [Lock, 'Your data', 'Private on this device. Export or delete', () => setShowDataPanel(true)],
              ] as const).map(([Icon, title, detail, open]) => (
                <button
                  key={title}
                  type="button"
                  onClick={open}
                  className="w-full flex items-center gap-3 rounded-2xl p-3.5 glass-panel cursor-pointer text-left"
                >
                  <span className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ffb547, #ff6b4a)' }}>
                    <Icon className="w-5 h-5 text-white" />
                  </span>
                  <span className="flex-1">
                    <span className="block font-display text-base text-stone-900">{title}</span>
                    <span className="block text-[13px] text-stone-500">{detail}</span>
                  </span>
                  <ChevronRight className="w-5 h-5 text-orange-500" />
                </button>
              ))}
              <InstallHelp />
            </div>
          )}

          {currentScreen === 'reset' && (
            <QuickReset
              onExit={() => setCurrentScreen('checkin')}
              onComplete={() => {
                recordPractice('60-second reset');
                setCurrentScreen('checkin');
              }}
            />
          )}

          {currentScreen === 'spa' && (
            <MentalSpa
              onExit={() => setCurrentScreen('checkin')}
              onComplete={() => {
                recordPractice('The Mental SPA');
                setCurrentScreen('checkin');
              }}
            />
          )}

          {currentScreen === 'crisis' && (
            <CrisisSupport
              onBack={() => {
                setSession(null);
                setCurrentScreen('checkin');
              }}
              onContinue={() => {
                if (crisisFrom === 'player' && session) {
                  setCurrentScreen('player');
                } else {
                  // Start a simple breathing session without the typed text
                  setSession(null);
                  handleStartSession({ description: '', explicitState: 'Breath Meditation' });
                }
              }}
            />
          )}

          {currentScreen === 'player' && session && (
            <SessionPlayer
              session={session}
              onAdaptiveFeedback={handleAdaptiveFeedback}
              isLoadingFeedback={isLoadingFeedback}
              onExitSession={() => setCurrentScreen('exit')}
            />
          )}

          {currentScreen === 'exit' && session && (
            <SessionExit
              session={session}
              onSaveFeedback={handleSaveExitReview}
              onReturnToStart={() => {
                setSession(null);
                setCurrentScreen('checkin');
              }}
            />
          )}

          {/* Local Session Logs inside mobile feed on dashboard screen */}
          {currentScreen === 'checkin' && tab === 'history' && history.length === 0 && (
            <div className="px-6 pt-16 text-center space-y-2 animate-fade-in">
              <h1 className="text-xl font-serif italic font-medium text-amber-950">Your history</h1>
              <p className="text-xs text-stone-500">Finish a session and it will appear here. It stays on this device.</p>
            </div>
          )}
          {currentScreen === 'checkin' && tab === 'history' && history.length > 0 && (
            <div className="px-4 pt-3 animate-fade-in">
              <div className="space-y-4">
                
                <div className="flex justify-between items-center pb-1">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-orange-600" />
                    <h3 className="text-[10px] font-mono font-bold tracking-wider text-amber-900">
                      Your history
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => { setShowDataPanel(true); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                    className="text-[10px] font-mono font-bold flex items-center gap-1 cursor-pointer py-1 px-2 rounded-md text-orange-600 hover:bg-orange-50"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Export or delete</span>
                  </button>
                </div>

                {/* Vertical scroller for session records on mobile */}
                <div className="space-y-3.5">
                  {history.slice(0, 3).map((log) => (
                    <div
                      key={log.id}
                      className="glass-panel rounded-2xl p-4 transition-all duration-300 hover:border-orange-200/50"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-[10px] text-stone-500 font-mono">
                          <span>{new Date(log.date).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit'
                          })}</span>
                          <span className="font-mono font-bold text-orange-700 bg-orange-50/80 border border-orange-100 px-2 py-0.5 rounded-md">
                            {log.rating === 'up' ? '👍 Calm' : log.rating === 'down' ? '👎 Tough' : 'Done'}
                          </span>
                        </div>
                        
                        <h4 className="font-display font-semibold text-xs text-stone-800">
                          {log.technique}
                        </h4>
                        
                        {log.notes && (
                           <p className="text-[11px] text-stone-605 leading-relaxed italic border-l border-orange-200 pl-2.5">
                            "{log.notes}"
                          </p>
                        )}
                      </div>
                      
                      <div className="pt-2 mt-2 border-t border-orange-100/50 text-[9px] font-mono text-stone-500">
                        <div className="flex flex-wrap items-center gap-1">
                          {log.state && (
                            <>
                              <span>Starting:</span>
                              <strong className="text-orange-600">{log.state}</strong>
                            </>
                          )}
                          {log.endState && (
                            <div className="flex items-center gap-1 font-mono">
                              <span className="text-slate-400 px-0.5">&rarr;</span>
                              <span>After session:</span>
                              <strong className="text-emerald-700 bg-emerald-50 border border-emerald-150 px-1.5 py-0.5 rounded-md font-bold">
                                {log.endState}
                              </strong>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Bottom menu, only on the home pages; sessions use the full screen */}
        {currentScreen === 'checkin' && (
          <nav className="app-footer w-full z-10 grid grid-cols-5 pb-[env(safe-area-inset-bottom)]" aria-label="Pages">
            {([
              ['checkin', 'Check-in', Home],
              ['practise', 'Practise', Sparkles],
              ['guided', 'Guided', PlayCircle],
              ['history', 'History', Calendar],
              ['more', 'More', Menu],
            ] as const).map(([key, label, Icon]) => (
              <button
                key={key}
                type="button"
                onClick={() => { setTab(key); setShowKeyPanel(false); setShowDataPanel(false); }}
                aria-current={tab === key ? 'page' : undefined}
                className={`flex flex-col items-center gap-0.5 pt-2 pb-1 text-[13px] cursor-pointer transition-colors ${tab === key ? 'text-orange-700 font-semibold' : 'text-stone-500'}`}
              >
                <Icon className={`w-5 h-5 ${tab === key ? 'text-orange-600' : 'text-stone-400'}`} />
                {label}
              </button>
            ))}
          </nav>
        )}

        {/* Tagline as a floating glass pill above the menu, on the home pages */}
        {currentScreen === 'checkin' && (
          <div className="absolute inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex justify-center pointer-events-none">
            <p className="tagline-pill text-[12px] text-amber-900 px-4 py-1 rounded-full">Your app. Your data. Your choice.</p>
          </div>
        )}

      </div>

    </div>
  );
}
