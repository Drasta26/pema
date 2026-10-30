import { useState, useEffect } from 'react';
import { EmotionalState, MeditationSession, FeedbackType } from './types';
import CheckIn from './components/CheckIn';
import AuthScreen from './components/AuthScreen';
import SessionPlayer from './components/SessionPlayer';
import SessionExit from './components/SessionExit';
import { Calendar, RotateCcw, Award, CheckCircle, Info, Heart } from 'lucide-react';
import { collection, getDocs, query, orderBy, setDoc, doc, deleteDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from './firebase';

interface LocalSessionLog {
  id: string;
  date: string;
  state: EmotionalState;
  technique: string;
  rating: 'up' | 'down' | null;
  notes: string;
  endState?: EmotionalState;
}

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'checkin' | 'login' | 'player' | 'exit'>('checkin');
  const [session, setSession] = useState<MeditationSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [user, setUser] = useState<{ email: string; displayName: string; providerId: string } | null>(null);
  const [showProfileCard, setShowProfileCard] = useState(false);
  const [pendingCheckinData, setPendingCheckinData] = useState<{ description: string; explicitState?: EmotionalState } | null>(null);

  // Local state persistence logs
  const [history, setHistory] = useState<LocalSessionLog[]>([]);
  const [streak, setStreak] = useState(0);
  const [isConfirmingClear, setIsConfirmingClear] = useState(false);

  // Pull history from live Cloud Firestore if user authenticated
  const syncHistoryFromFirestore = async (email: string) => {
    try {
      const historyRef = collection(db, 'users', email.toLowerCase().trim(), 'history');
      const q = query(historyRef, orderBy('date', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedHistory: LocalSessionLog[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data();
        fetchedHistory.push({
          id: docSnap.id,
          date: data.date,
          state: data.state as EmotionalState,
          technique: data.technique,
          rating: data.rating,
          notes: data.notes,
          endState: data.endState as EmotionalState | undefined
        });
      });
      setHistory(fetchedHistory);
      calculateStreak(fetchedHistory);
      localStorage.setItem('ai_meditation_logs', JSON.stringify(fetchedHistory));
    } catch (err: any) {
      console.error("Failed to sync from Firestore:", err);
      // Fallback gracefully to local storage in case of offline/permissions issues
      try {
        const stored = localStorage.getItem('ai_meditation_logs');
        if (stored) {
          const parsed: LocalSessionLog[] = JSON.parse(stored);
          setHistory(parsed);
          calculateStreak(parsed);
        }
      } catch (innerErr) {
        console.error(innerErr);
      }
    }
  };

  // Extract logs and user session on initial load
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ai_meditation_logs');
      if (stored) {
        const parsed: LocalSessionLog[] = JSON.parse(stored);
        setHistory(parsed);
        calculateStreak(parsed);
      }
      const storedUser = localStorage.getItem('pema_user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        syncHistoryFromFirestore(parsedUser.email);
      }
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

  const handleCheckInSubmit = (data: { description: string; explicitState?: EmotionalState }) => {
    if (!user) {
      setPendingCheckinData(data);
      setCurrentScreen('login');
    } else {
      handleStartSession(data);
    }
  };

  const handleAuthSuccess = (authenticatedUser: { email: string; displayName: string; providerId: string }) => {
    setUser(authenticatedUser);
    localStorage.setItem('pema_user', JSON.stringify(authenticatedUser));

    // Pull historical records from live Firestore
    syncHistoryFromFirestore(authenticatedUser.email);
    
    // Resume session launcher if there was pending checkin
    if (pendingCheckinData) {
      handleStartSession(pendingCheckinData);
      setPendingCheckinData(null);
    } else {
      setCurrentScreen('checkin');
    }
  };

  const handleAuthBack = () => {
    setPendingCheckinData(null);
    setCurrentScreen('checkin');
  };

  const handleStartSession = async (data: { description: string; explicitState?: EmotionalState }) => {
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
      setErrorMessage(err.message || "An unexpected error occurred. Please try launching again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdaptiveFeedback = async (feedbackType: FeedbackType, userText?: string) => {
    if (!session) return;
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

  const handleSaveExitReview = async (feedback: { rating: 'up' | 'down' | null; notes: string; endState?: EmotionalState }) => {
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

    // Persist log entry directly on live Cloud Firestore if the user is authenticated
    if (user) {
      const emailPath = user.email.toLowerCase().trim();
      const pathForWrite = `users/${emailPath}/history/${session.id}`;
      try {
        const docRef = doc(db, 'users', emailPath, 'history', session.id);
        await setDoc(docRef, {
          id: session.id,
          date: newLog.date,
          state: newLog.state,
          technique: newLog.technique,
          rating: newLog.rating,
          notes: newLog.notes,
          endState: newLog.endState || null,
          userId: emailPath
        });
      } catch (err: any) {
        console.error("Failed to commit session history record to Firestore:", err);
        handleFirestoreError(err, OperationType.WRITE, pathForWrite);
      }
    }
  };

  const handleClearHistory = async () => {
    if (!isConfirmingClear) {
      setIsConfirmingClear(true);
    } else {
      localStorage.removeItem('ai_meditation_logs');
      setHistory([]);
      setStreak(0);
      setIsConfirmingClear(false);

      // Cleanse online Firestore entries if logged in
      if (user) {
        const emailPath = user.email.toLowerCase().trim();
        const pathForDeleteGroup = `users/${emailPath}/history`;
        try {
          const historyRef = collection(db, 'users', emailPath, 'history');
          const querySnapshot = await getDocs(historyRef);
          const deletePromises = querySnapshot.docs.map(docSnap => deleteDoc(docSnap.ref));
          await Promise.all(deletePromises);
        } catch (err: any) {
          console.error("Failed to empty historical logs on Cloud Firestore:", err);
          handleFirestoreError(err, OperationType.DELETE, pathForDeleteGroup);
        }
      }
    }
  };

  return (
    <div className="min-h-screen py-4 sm:py-8 px-2 sm:px-4 flex flex-col justify-center items-center font-sans selection:bg-orange-100">
      
      {/* Immersive Mobile Device Wrapper - Futuristic Zen Device */}
      <div className="mobile-device-wrapper flex flex-col justify-between h-[660px]">
        
        {/* Shimmering Solar Caustics Background layer */}
        <div className="caustics-backdrop" />
        
        {/* Futuristic Glassmorphic Status Bar Header */}
        <header className="w-full bg-white/90 backdrop-blur-md border-b border-orange-100/40 py-4 px-5 z-10">
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
                <span className="block text-[8px] font-mono tracking-wider uppercase font-bold text-custom-blue">
                  Personalized Mindfulness Assistant
                </span>
              </div>
            </div>

            {/* Streak & User Status Indicator */}
            <div className="flex items-center gap-1.5 shrink-0 relative">
              <div className="flex items-center gap-1 bg-blue-50/80 border border-blue-100 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold text-custom-blue shadow-xs">
                <Award className="w-3 h-3 text-blue-500" />
                <span className="text-custom-blue">{streak}d</span>
              </div>
              {user ? (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowProfileCard(!showProfileCard)}
                    className="w-7 h-7 flex items-center justify-center rounded-full bg-amber-50 hover:bg-amber-100 border border-amber-200/80 cursor-pointer transition-all duration-300 text-[12px] shadow-xs active:scale-90"
                    title="View Profile Details 👤"
                  >
                    👤
                  </button>
                  
                  {showProfileCard && (
                    <div className="absolute right-0 mt-2 w-48 bg-white/95 backdrop-blur-md rounded-xl border border-orange-100 shadow-lg p-3.5 z-50 animate-slide-in text-left">
                      <div className="space-y-1.5 pb-2 border-b border-orange-100/30">
                        <span className="block text-[8px] font-mono tracking-wider text-slate-400 uppercase">
                          Practitioner Profile
                        </span>
                        <span className="block font-sans font-bold text-xs text-stone-900 truncate">
                          {user.displayName || 'Google Tester'}
                        </span>
                        <span className="block font-mono text-[9px] text-custom-blue truncate">
                          {user.email}
                        </span>
                      </div>
                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setShowProfileCard(false);
                            signOut(auth)
                              .catch((err) => console.error("Firebase logout issue:", err))
                              .finally(() => {
                                setUser(null);
                                localStorage.removeItem('pema_user');
                                setSession(null);
                                setCurrentScreen('checkin');
                              });
                          }}
                          className="w-full text-center text-[10px] font-mono font-bold uppercase py-1.5 px-2 rounded-lg bg-orange-600 hover:bg-orange-700 text-white cursor-pointer transition-colors duration-200"
                        >
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-1 bg-blue-50/40 border border-blue-100/30 px-2 py-0.5 rounded-full text-[8px] font-mono font-bold">
                  <span className="text-custom-blue font-black">Guest</span>
                </div>
              )}
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
                  <span className="font-bold block text-sm">System Warning</span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            </div>
          )}

          {/* Core App Screens */}
          {currentScreen === 'checkin' && (
            <CheckIn onSubmit={handleCheckInSubmit} isLoading={isLoading} />
          )}

          {currentScreen === 'login' && (
            <AuthScreen onAuthSuccess={handleAuthSuccess} onBack={handleAuthBack} />
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
                    <h3 className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-900">
                      Reflection History
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
                          <span className="font-mono font-bold uppercase text-orange-700 bg-orange-50/80 border border-orange-100 px-2 py-0.5 rounded-md">
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
                          <span>Starting:</span>
                          <strong className="text-orange-600">{log.state}</strong>
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
        <footer className="w-full bg-orange-50/30 border-t border-orange-100/30 py-4 px-5 z-10">
          <div className="text-center space-y-1.5">
            <p className="text-[9px] font-mono text-amber-900 leading-relaxed">
              &copy; 2026 <em className="italic font-bold">PeMA</em>. All personal logs stored locally.
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
