import React, { useState, useEffect, useRef } from 'react';
import { MeditationSession, FeedbackType, BreathPacing } from '../types';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, HelpCircle, Activity, Smile, MessageCircle } from 'lucide-react';
import { MeditationAudioEngine } from './AudioHelper';

interface SessionPlayerProps {
  session: MeditationSession;
  onAdaptiveFeedback: (feedbackType: FeedbackType, userText?: string) => void;
  isLoadingFeedback: boolean;
  onExitSession: () => void;
}

export default function SessionPlayer({
  session,
  onAdaptiveFeedback,
  isLoadingFeedback,
  onExitSession
}: SessionPlayerProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [customFeedbackText, setCustomFeedbackText] = useState('');
  const [showFeedbackInput, setShowFeedbackInput] = useState(false);

  // High-resolution animation tracker progress (0 to 1) within the current phase
  const [fineProgress, setFineProgress] = useState(0);

  // Breathing loop state
  const [breathPhase, setBreathPhase] = useState<'inhale' | 'hold1' | 'exhale' | 'hold2'>('inhale');
  const [secondsRemaining, setSecondsRemaining] = useState(0);
  const [totalPhaseSeconds, setTotalPhaseSeconds] = useState(0);

  // Overall session duration states
  const [sessionTimeRemaining, setSessionTimeRemaining] = useState(300);
  const initialDurationRef = useRef(300);

  // Initialize and synchronise overall session timer
  useEffect(() => {
    const text = session.durationText || '';
    const match = text.match(/\d+/);
    let duration = 300;
    if (match) {
      const mins = parseInt(match[0], 10);
      if (mins > 0 && mins <= 60) {
        duration = mins * 60;
      }
    }
    initialDurationRef.current = duration;
    setSessionTimeRemaining(duration);
  }, [session.id]);

  // Handle ticking the overall countdown
  useEffect(() => {
    if (!isPlaying || sessionTimeRemaining <= 0) return;

    const intervalId = setInterval(() => {
      setSessionTimeRemaining((prev) => {
        if (prev <= 1) {
          setIsPlaying(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, sessionTimeRemaining]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Local instance of audio engine maintained via useRef to prevent multiple overlapping contexts
  const audioEngineRef = useRef<MeditationAudioEngine | null>(null);

  // Initialize Audio engine on mount/cleanup
  useEffect(() => {
    audioEngineRef.current = new MeditationAudioEngine();
    return () => {
      audioEngineRef.current?.stop();
    };
  }, []);

  // Clean up any existing speaking synthesis upon unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Sync Audio context state with playing & phase status
  useEffect(() => {
    if (audioEnabled && isPlaying) {
      if (audioEngineRef.current) {
        audioEngineRef.current.start();
        // Set initial state
        audioEngineRef.current.setBreathingVolume(
          breathPhase === 'hold1' || breathPhase === 'hold2' ? 'hold' : breathPhase === 'inhale' ? 'inhale' : 'exhale'
        );
      }
    } else {
      audioEngineRef.current?.stop();
    }
  }, [audioEnabled, isPlaying]);

  // Handle phase specific volume/synthesier swells
  useEffect(() => {
    if (audioEnabled && isPlaying && audioEngineRef.current) {
      const phaseKey = breathPhase === 'hold1' || breathPhase === 'hold2' ? 'hold' : breathPhase === 'inhale' ? 'inhale' : 'exhale';
      audioEngineRef.current.setBreathingVolume(phaseKey);
    }
  }, [breathPhase, audioEnabled, isPlaying]);

  // Breathing pacer controller
  const pacing: BreathPacing = session.breathPacing;
  
  // Set up phase timer loops
  useEffect(() => {
    if (!isPlaying) return;

    // Set first phase
    if (secondsRemaining <= 0) {
      let nextPhase: typeof breathPhase = 'inhale';
      let nextDuration = pacing.inhale;

      if (breathPhase === 'inhale') {
        if (pacing.hold1 > 0) {
          nextPhase = 'hold1';
          nextDuration = pacing.hold1;
        } else {
          nextPhase = 'exhale';
          nextDuration = pacing.exhale;
        }
      } else if (breathPhase === 'hold1') {
        nextPhase = 'exhale';
        nextDuration = pacing.exhale;
      } else if (breathPhase === 'exhale') {
        if (pacing.hold2 > 0) {
          nextPhase = 'hold2';
          nextDuration = pacing.hold2;
        } else {
          nextPhase = 'inhale';
          nextDuration = pacing.inhale;
        }
      } else if (breathPhase === 'hold2') {
        nextPhase = 'inhale';
        nextDuration = pacing.inhale;
      }

      setBreathPhase(nextPhase);
      setSecondsRemaining(nextDuration);
      setTotalPhaseSeconds(nextDuration);
    }

    const intervalId = setInterval(() => {
      setSecondsRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(intervalId);
  }, [isPlaying, breathPhase, secondsRemaining, pacing]);

  // Set up continuous high-resolution animation progress (0 to 1) within the current phase
  useEffect(() => {
    if (!isPlaying) {
      const elapsed = totalPhaseSeconds - secondsRemaining;
      const staticProgress = totalPhaseSeconds > 0 ? elapsed / totalPhaseSeconds : 0;
      setFineProgress(staticProgress);
      return;
    }

    let animFrame: number;
    let lastTime = performance.now();
    const currentElapsedSeconds = totalPhaseSeconds - secondsRemaining;
    let elapsedMs = currentElapsedSeconds * 1000;

    const tick = (now: number) => {
      const delta = now - lastTime;
      lastTime = now;

      elapsedMs += delta;

      const durationMs = totalPhaseSeconds * 1000;
      const computedProgress = durationMs > 0 ? Math.min(0.999, elapsedMs / durationMs) : 0;
      setFineProgress(computedProgress);

      animFrame = requestAnimationFrame(tick);
    };

    animFrame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animFrame);
  }, [isPlaying, breathPhase, secondsRemaining, totalPhaseSeconds]);

  // Compute scale for breathing circle
  const getCircleScale = () => {
    if (!isPlaying) {
      const elapsed = totalPhaseSeconds - secondsRemaining;
      const progress = totalPhaseSeconds > 0 ? elapsed / totalPhaseSeconds : 0;
      if (breathPhase === 'inhale') return 1.0 + progress * 0.6;
      if (breathPhase === 'hold1') return 1.6;
      if (breathPhase === 'exhale') return 1.6 - progress * 0.6;
      if (breathPhase === 'hold2') return 1.0;
      return 1.15;
    }
    
    if (breathPhase === 'inhale') {
      return 1.0 + fineProgress * 0.6; 
    } else if (breathPhase === 'hold1') {
      return 1.6; 
    } else if (breathPhase === 'exhale') {
      return 1.6 - fineProgress * 0.6; 
    } else if (breathPhase === 'hold2') {
      return 1.0; 
    }
    return 1.15;
  };

  const getPhaseText = () => {
    if (!isPlaying) return 'Paused';
    if (breathPhase === 'inhale') return 'Breathe in';
    if (breathPhase === 'hold1') return 'Hold your breath';
    if (breathPhase === 'exhale') return 'Breathe out slowly';
    if (breathPhase === 'hold2') return 'Rest and hold';
    return '';
  };

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const toggleAudioEngine = () => {
    setAudioEnabled(!audioEnabled);
  };

  const triggerAdaptive = (type: FeedbackType, text?: string) => {
    onAdaptiveFeedback(type, text);
    if (text) {
      setCustomFeedbackText('');
      setShowFeedbackInput(false);
    }
  };

  const chip = 'flex items-center justify-center gap-1 py-1.5 px-1 bg-white/50 border border-orange-100/60 text-[11px] text-stone-800 rounded-xl transition-all duration-300 cursor-pointer hover:bg-orange-50 disabled:opacity-50';

  // One page, no scrolling: header line, breathing orb, current step, quick adjustments
  return (
    <div className="w-full h-full px-3 py-2 flex flex-col gap-2.5 animate-fade-in text-stone-800">

      {/* Technique, reflection, time and sound */}
      <div className="glass-panel rounded-2xl px-4 py-2.5 border border-orange-100/50 shadow-sm space-y-1.5">
        <div className="flex justify-between items-center gap-2">
          <span className="text-[11px] text-orange-700 font-semibold truncate">{session.techniqueName}</span>
          <button
            id="toggle-audio-btn"
            onClick={toggleAudioEngine}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-lg border text-[10px] font-semibold transition-all duration-300 cursor-pointer shrink-0 ${
              audioEnabled ? 'bg-orange-50 text-orange-600 border-orange-200' : 'bg-transparent text-stone-500 border-black/10 hover:bg-orange-50'
            }`}
            aria-label={audioEnabled ? 'Turn background sound off' : 'Turn background sound on'}
          >
            {audioEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            <span>Sound {audioEnabled ? 'on' : 'off'}</span>
          </button>
        </div>
        <p className="text-stone-900 font-serif text-sm italic leading-snug line-clamp-2">{session.stateReflection}</p>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-1 rounded-full overflow-hidden bg-orange-500/10">
            <div
              id="session-progress-bar-fill"
              className="bg-gradient-to-r from-orange-600 to-amber-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${((initialDurationRef.current - sessionTimeRemaining) / initialDurationRef.current) * 100}%` }}
            />
          </div>
          <span id="session-time-remaining-label" className="text-[10px] font-semibold text-orange-700 tabular-nums">
            {sessionTimeRemaining > 0 ? `${formatTime(sessionTimeRemaining)} left` : 'Complete'}
          </span>
        </div>
      </div>

      {/* Breathing orb */}
      <div className="flex-1 min-h-0 flex flex-col items-center justify-center gap-2">
        <div className="relative flex items-center justify-center h-36 w-36">
          {isPlaying && (
            <>
              <div className="absolute inset-0 water-ripple-ring" />
              <div className="absolute inset-0 water-ripple-ring-alt" />
            </>
          )}
          <div
            className={`absolute rounded-full bg-amber-200/10 blur-2xl transition-all duration-1000 ${isPlaying ? 'animate-pulse' : ''}`}
            style={{ width: `${getCircleScale() * 120}%`, height: `${getCircleScale() * 120}%` }}
          />
          <div
            className="absolute rounded-full water-droplet-3d shadow-xl transition-all duration-1000"
            style={{ transform: `scale(${getCircleScale()})`, width: '80%', height: '80%' }}
          />
          <div className="absolute rounded-full bg-white/90 backdrop-blur-md border border-white/60 flex flex-col items-center justify-center w-20 h-20 shadow-lg z-10">
            {sessionTimeRemaining > 0 ? (
              <>
                <span id="pacer-countdown-sec" className="text-lg font-display font-medium text-orange-700 tabular-nums">{secondsRemaining}s</span>
                <span id="pacer-phase-label" className="text-[9px] font-semibold text-amber-900 text-center px-1 leading-tight">{getPhaseText()}</span>
              </>
            ) : (
              <>
                <span id="pacer-done-emoji" className="text-lg">🧘</span>
                <span id="pacer-done-text" className="text-[10px] font-semibold text-orange-700">Done</span>
              </>
            )}
          </div>
        </div>

        {sessionTimeRemaining > 0 ? (
          <button
            id="toggle-playback-btn"
            onClick={togglePlayback}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-display font-semibold transition-all duration-300 border cursor-pointer ${
              isPlaying ? 'bg-white/40 text-orange-600 border-orange-300 hover:bg-orange-50' : 'bg-orange-600 text-white border-transparent hover:bg-orange-700'
            }`}
          >
            {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
            <span>{isPlaying ? 'Pause' : 'Resume'}</span>
          </button>
        ) : (
          <button
            id="completion-exit-btn"
            onClick={onExitSession}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-display font-bold bg-orange-600 text-white hover:bg-orange-700 shadow-md transition-all duration-300 cursor-pointer"
          >
            Finish and reflect
          </button>
        )}
      </div>

      {/* Current step */}
      <div className="glass-panel rounded-2xl px-4 py-2.5 border border-orange-100/50 shadow-xs space-y-2">
        <p className="text-sm font-serif italic text-stone-800 leading-snug line-clamp-3 min-h-[3.75em] animate-slide-in" key={currentStepIndex}>
          {session.steps[currentStepIndex].replace(/\[pause \d+s?\]/gi, '').replace(/\s+/g, ' ').trim()}
        </p>
        <div className="flex justify-between items-center">
          <button
            onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentStepIndex === 0}
            aria-label="Previous step"
            className="p-1.5 rounded-lg border text-orange-600 border-orange-200 hover:bg-orange-50 transition-all duration-300 cursor-pointer disabled:text-stone-300 disabled:border-orange-100/30 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="text-[11px] text-orange-700 font-semibold">Step {currentStepIndex + 1} of {session.steps.length}</span>
          {currentStepIndex < session.steps.length - 1 ? (
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.min(session.steps.length - 1, prev + 1))}
              aria-label="Next step"
              className="p-1.5 rounded-lg border text-orange-600 border-orange-200 hover:bg-orange-50 transition-all duration-300 cursor-pointer"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={onExitSession}
              className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[11px] font-display font-semibold rounded-lg transition-all duration-300 cursor-pointer"
            >
              End practice
            </button>
          )}
        </div>
      </div>

      {/* Quick adjustments */}
      <div className="glass-panel rounded-2xl px-3 py-2 border border-orange-100/50 shadow-xs">
        {isLoadingFeedback ? (
          <div className="flex items-center justify-center gap-1.5 text-[11px] text-orange-600 py-1.5">
            <div className="w-3 h-3 border border-orange-600 border-t-transparent rounded-full animate-spin" />
            <span>Adapting your session…</span>
          </div>
        ) : showFeedbackInput ? (
          <div className="flex gap-1.5 animate-slide-in">
            <input
              id="feedback-text-area"
              autoFocus
              value={customFeedbackText}
              onChange={(e) => setCustomFeedbackText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && customFeedbackText.trim() && triggerAdaptive('freeform', customFeedbackText)}
              placeholder="What's getting in the way?"
              aria-label="What's getting in the way?"
              className="flex-1 min-w-0 text-xs px-2.5 py-1.5 border border-orange-100/50 rounded-lg bg-white text-stone-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
            <button
              onClick={() => triggerAdaptive('freeform', customFeedbackText)}
              disabled={!customFeedbackText.trim()}
              className="px-3 text-[11px] bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold cursor-pointer disabled:opacity-50"
            >
              Adapt
            </button>
            <button onClick={() => setShowFeedbackInput(false)} aria-label="Cancel" className="px-2 text-[11px] text-stone-500 rounded-lg cursor-pointer">
              Cancel
            </button>
          </div>
        ) : (
          <div className="space-y-1.5">
            <p className="text-[11px] text-amber-900 text-center">How is it going?</p>
            <div className="grid grid-cols-4 gap-1.5">
              <button type="button" onClick={() => triggerAdaptive('distracted')} className={chip}>
                <HelpCircle className="w-3.5 h-3.5 text-orange-700" /> Distracted
              </button>
              <button type="button" onClick={() => triggerAdaptive('anxiety_increased')} className={chip}>
                <Activity className="w-3.5 h-3.5 text-red-500" /> Anxious
              </button>
              <button type="button" onClick={() => triggerAdaptive('feeling_better')} className={chip}>
                <Smile className="w-3.5 h-3.5 text-emerald-600" /> Better
              </button>
              <button type="button" onClick={() => setShowFeedbackInput(true)} className={chip}>
                <MessageCircle className="w-3.5 h-3.5 text-orange-600" /> Other
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
