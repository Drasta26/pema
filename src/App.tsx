import { useState, useEffect } from 'react';
import { EmotionalState, MeditationSession, FeedbackType } from './types';
import CheckIn from './components/CheckIn';
import SessionPlayer from './components/SessionPlayer';
import SessionExit from './components/SessionExit';
import CrisisSupport from './components/CrisisSupport';
import GuidedLibrary from './components/GuidedLibrary';
import MentalSpa from './components/MentalSpa';
import QuickReset from './components/QuickReset';
import InstallHelp from './components/InstallHelp';
import { registerServiceWorker } from './pwa';
import { detectCrisis } from './safety';
import { Calendar, RotateCcw, Award, Info, Lock, RefreshCw } from 'lucide-react';

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
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);
  // Set when a new version of the app has been downloaded and is ready
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

  // Auto-reset clear history confirmation flag after 4 seconds
  useEffect(() => {
    if (isConfirmingClear) {
      const timer = setTimeout(() => {
        setIsConfirmingClear(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [isConfirmingClear]);

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
      const response = await fetch('/api/meditation/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          description: data.description,
          explicitState: data.explicitState
        })
      });

      if (!response.ok) {
        let errText = 'Failed to reach AI Meditation Coach server. Please verify your connection.';
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) {
            errText = `Coach Server Error: ${errJson.error}`;
          }
        } catch (_) {}
        throw new Error(errText);
      }

      const sessionObj = await response.json();
      setSession(sessionObj);
      setCurrentScreen('player');
    } catch (err: any) {
      setErrorMessage(navigator.onLine
        ? (err.message || "An unexpected error occurred. Please try launching again.")
        : "You're offline, so personalised sessions aren't available. The 60-second reset and the Mental SPA work without internet.");
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
      const response = await fetch('/api/meditation/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentSession: session,
          feedbackType,
          userText
        })
      });

      if (!response.ok) {
        let errText = 'Could not synchronize adaptive adjustments with Coach server.';
        try {
          const errJson = await response.json();
          if (errJson && errJson.error) {
            errText = `Coach Feedback Error: ${errJson.error}`;
          }
        } catch (_) {}
        throw new Error(errText);
      }

      const updatedSession = await response.json();
      // Maintain session ID for history consistency
      updatedSession.id = session.id;
      setSession(updatedSession);
    } catch (err: any) {
      setErrorMessage(err.message || "Could not adapt session dynamically.");
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

  const handleClearHistory = () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
    } else {
      localStorage.removeItem('ai_meditation_logs');
      setHistory([]);
      setStreak(0);
      setIsConfirmingClear(false);
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4 flex flex-col justify-center items-center font-sans selection:bg-orange-100">
      
      {/* Immersive Mobile Device Wrapper - Futuristic Zen Device */}
      <div className="mobile-device-wrapper flex flex-col justify-between h-[660px]">
        
        {/* Shimmering Solar Caustics Background layer */}
        <div className="caustics-backdrop" />
        
        {/* Futuristic Glassmorphic Status Bar Header */}
        <header className="app-header w-full py-4 px-5 z-10">
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
                <span className="font-display font-medium text-base text-stone-900 tracking-tight block">
                  <em className="italic font-bold text-custom-blue">PeMA</em>
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
              <div
                className="flex items-center gap-1 bg-blue-50/40 border border-blue-100/30 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold text-custom-blue"
                title="Your history stays on this device"
              >
                <Lock className="w-2.5 h-2.5" />
                <span>Private</span>
              </div>
            </div>

          </div>
        </header>

        {/* Primary Interactive Viewport */}
        <div className="flex-1 overflow-y-auto px-1 py-1 max-h-[640px] scroller-none z-10">
          
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

          {currentScreen === 'checkin' && <InstallHelp />}

          {/* Core App Screens */}
          {currentScreen === 'checkin' && (
            <>
              <CheckIn onSubmit={handleStartSession} isLoading={isLoading} />
              <GuidedLibrary onStartSpa={() => setCurrentScreen('spa')} onStartReset={() => setCurrentScreen('reset')} />
            </>
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
          {currentScreen === 'checkin' && history.length > 0 && (
            <div className="px-4 py-6 mt-4 border-t border-orange-100/50">
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
                    onClick={handleClearHistory}
                    className={`text-[9px] font-mono font-bold flex items-center gap-1 cursor-pointer transition-all duration-300 py-1 px-2 rounded-md ${
                      isConfirmingClear 
                        ? 'bg-red-50 border border-red-200 text-red-600 hover:bg-red-100 shadow-sm animate-pulse' 
                        : 'text-orange-600 hover:text-red-650 hover:bg-orange-50'
                    }`}
                  >
                    <RotateCcw className={`w-3 h-3 ${isConfirmingClear ? 'animate-spin' : ''}`} />
                    <span>{isConfirmingClear ? 'Click again to confirm' : 'Clear Logs'}</span>
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

        {/* Clean, Non-Diagnostic Disclaimer Footer for legal mitigation */}
        <footer className="app-footer w-full py-4 px-5 z-10">
          <div className="text-center space-y-1.5">
            <p className="text-[9px] font-mono text-amber-900 leading-relaxed">
              &copy; 2026 <em className="italic font-bold">PeMA</em>. All personal logs stored locally.
            </p>
            <p className="text-[11px] font-sans text-amber-900" style={{ fontFamily: '"Inter", "Noto Sans Devanagari", sans-serif' }}>
              Built by द्रष्टा (DrAsta)
            </p>
            <p className="text-[8px] font-sans text-stone-400 leading-normal px-2">
              Disclaimer: For relaxation and wellness. This tool does not provide medical services.
            </p>
          </div>
        </footer>

      </div>

    </div>
  );
}
