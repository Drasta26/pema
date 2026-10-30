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
    if (breathPhase === 'inhale') return 'Breathe In';
    if (breathPhase === 'hold1') return 'Hold Breath';
    if (breathPhase === 'exhale') return 'Exhale Slowly';
    if (breathPhase === 'hold2') return 'Rest and Hold';
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

  return (
    <div className="w-full px-3 py-3 space-y-4 animate-fade-in text-stone-800">
      
      {/* Session Header State Reflection */}
      <div className="glass-panel rounded-2xl p-4 border border-orange-100/50 shadow-sm space-y-2">
        <div className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-100 px-2.5 py-0.5 rounded-full text-[9px] font-mono tracking-wider text-orange-600 font-bold">
          CORE TECHNIQUE: {session.techniqueName}
        </div>
        <p className="text-stone-900 font-serif text-sm italic leading-relaxed">
          "{session.stateReflection}"
        </p>
        <p className="text-stone-500 text-[10px] font-sans">
          {session.purpose}
        </p>
      </div>

      {/* Main interactive player interface */}
      <div className="space-y-4">
        
        {/* Gorgeous Circular Breathing Visualizer Card */}
        <div className="glass-panel border-orange-100/50 text-stone-800 rounded-2xl p-4 shadow-xs flex flex-col items-center justify-between min-h-[340px] relative">
          
          <div className="w-full flex justify-between items-center mb-1 gap-2 flex-wrap sm:flex-nowrap">
            <div className="flex flex-col">
              <span id="session-time-remaining-label" className="text-[10px] font-mono font-bold mt-0.5 text-orange-700">
                {sessionTimeRemaining > 0 ? `${formatTime(sessionTimeRemaining)} remaining` : 'Practice Complete'}
              </span>
            </div>
            
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Drone frequency selector / toggle */}
              <button
                id="toggle-audio-btn"
                onClick={toggleAudioEngine}
                className={`flex items-center gap-1 p-1 px-1.5 sm:px-2 rounded-lg border text-[9px] font-mono font-bold transition-all duration-300 cursor-pointer ${
                  audioEnabled
                    ? 'bg-orange-50 text-orange-600 border-orange-200 shadow-[0_0_12px_rgba(249,115,22,0.12)]'
                    : 'bg-transparent text-stone-500 border-black/10 hover:bg-orange-50'
                }`}
                title={audioEnabled ? 'Mute background drone frequencies' : 'Enable cosmic hum ambient frequencies'}
              >
                {audioEnabled ? <Volume2 className="w-3.5 h-3.5 animate-pulse" /> : <VolumeX className="w-3.5 h-3.5" />}
                <span>Drone {audioEnabled ? 'On' : 'Off'}</span>
              </button>
            </div>
          </div>

          {/* Elegant Session Progress Bar */}
          <div className="w-full h-1 mt-1 mb-2 rounded-full overflow-hidden border bg-orange-500/5 border-orange-100">
            <div 
              id="session-progress-bar-fill"
              className="bg-gradient-to-r from-orange-600 to-amber-500 h-full transition-all duration-500 ease-out"
              style={{ width: `${((initialDurationRef.current - sessionTimeRemaining) / initialDurationRef.current) * 100}%` }}
            />
          </div>

          {/* GORGEOUS 3D WATER DROPLET ORB PACER VISUALIZER */}
          <div className="relative flex items-center justify-center h-44 w-44 my-auto">
            {/* Interactive 3D Water Ripple Rings (Active only when playing) */}
            {isPlaying && (
              <>
                <div className="absolute inset-0 water-ripple-ring" />
                <div className="absolute inset-0 water-ripple-ring-alt" />
              </>
            )}

            {/* Glowing Halo */}
            <div
              className={`absolute rounded-full bg-amber-200/10 blur-2xl transition-all duration-1000 ${
                isPlaying ? 'animate-pulse' : ''
              }`}
              style={{
                width: `${getCircleScale() * 120}%`,
                height: `${getCircleScale() * 120}%`,
              }}
            />

            {/* Gorgeous 3D Water Droplet (Interactive Scale and Wobble Animation) */}
            <div
              className="absolute rounded-full water-droplet-3d shadow-xl transition-all duration-1000"
              style={{
                transform: `scale(${getCircleScale()})`,
                width: '80%',
                height: '80%',
              }}
            />

            {/* Real 3D Glass Center Core */}
            <div className="absolute rounded-full bg-white/90 backdrop-blur-md border border-white/60 flex flex-col items-center justify-center w-24 h-24 shadow-lg z-10">
              {sessionTimeRemaining > 0 ? (
                <>
                  <span id="pacer-countdown-sec" className="text-xl font-display font-medium text-orange-700 tabular-nums drop-shadow-[0_0_8px_rgba(249,115,22,0.15)]">
                    {secondsRemaining}s
                  </span>
                  <span id="pacer-phase-label" className="text-[8px] font-mono font-bold tracking-wider text-amber-900 mt-0.5 text-center px-1 leading-tight">
                    {getPhaseText()}
                  </span>
                </>
              ) : (
                <>
                  <span id="pacer-done-emoji" className="text-xl animate-bounce">
                    🧘
                  </span>
                  <span id="pacer-done-text" className="text-[9px] font-mono font-bold tracking-wider text-orange-700 mt-0.5 text-center leading-tight">
                    Done
                  </span>
                </>
              )}
            </div>
          </div>

          <div className="w-full text-center space-y-2 mt-2">
            <div className="flex justify-center">
              {sessionTimeRemaining > 0 ? (
                <button
                  id="toggle-playback-btn"
                  onClick={togglePlayback}
                  style={{ contentVisibility: 'auto' }}
                  className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-xs font-display font-semibold tracking-wide transition-all duration-300 shadow-xs border cursor-pointer ${
                    isPlaying
                      ? 'bg-transparent text-orange-600 border-orange-300 hover:bg-orange-50'
                      : 'bg-orange-600 text-white border-transparent hover:bg-orange-700'
                  }`}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                  <span>{isPlaying ? 'Pause' : 'Resume Pacer'}</span>
                </button>
              ) : (
                <button
                  id="completion-exit-btn"
                  onClick={onExitSession}
                  className="flex items-center gap-1.5 px-5 py-2 rounded-xl text-xs font-display font-bold bg-orange-600 text-white border-transparent hover:bg-orange-700 shadow-md transition-all duration-300 cursor-pointer animate-pulse"
                >
                  <span>Complete & Journal</span>
                </button>
              )}
            </div>
            {audioEnabled && (
              <p className="text-[9px] font-sans text-amber-900">
                Background drone active. Relax into the sound.
              </p>
            )}
          </div>

        </div>

        {/* Stepper text panel */}
        <div className="glass-panel rounded-2xl p-4 border border-orange-100/50 shadow-xs flex flex-col justify-between min-h-[170px]">
          <div className="space-y-2">
            <div className="flex justify-between items-center border-b border-orange-100/40 pb-1.5">
              <span className="text-[9px] font-mono tracking-widest font-bold text-orange-600">
                Step {currentStepIndex + 1} of {session.steps.length}
              </span>
              <span className="text-[9px] text-orange-700 font-sans italic">
                Mindfulness cue
              </span>
            </div>

            {/* Stepper instruction */}
            <div className="py-1">
              <p className="text-sm sm:text-base font-serif italic text-stone-800 leading-relaxed transition-all duration-300 animate-slide-in">
                {session.steps[currentStepIndex].replace(/\[pause \d+s?\]/gi, '').replace(/\s+/g, ' ').trim()}
              </p>
            </div>
          </div>

          {/* Bullet navigators */}
          <div className="flex justify-between items-center pt-2.5 border-t border-orange-100/40">
            <button
              onClick={() => setCurrentStepIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentStepIndex === 0}
              className={`p-1 rounded-lg border transition-all duration-300 cursor-pointer ${
                currentStepIndex === 0
                  ? 'text-stone-300 border-orange-100/10 cursor-not-allowed shadow-none'
                  : 'text-orange-600 border-orange-200 hover:bg-orange-50'
              }`}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>

            <div className="flex gap-1.5">
              {session.steps.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === currentStepIndex ? 'w-4 bg-orange-600' : 'w-1.5 bg-orange-200/50'
                  }`}
                />
              ))}
            </div>

            {currentStepIndex < session.steps.length - 1 ? (
              <button
                onClick={() => setCurrentStepIndex((prev) => Math.min(session.steps.length - 1, prev + 1))}
                className="p-1 rounded-lg border text-orange-600 border-orange-200 hover:bg-orange-50 transition-all duration-300 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={onExitSession}
                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-[9px] font-display font-semibold tracking-wider rounded-lg transition-all duration-300 cursor-pointer shadow-sm"
              >
                End practice
              </button>
            )}
          </div>
        </div>

        {/* Real-time calibration tools */}
        <div className="glass-panel rounded-2xl p-4 border border-orange-100/50 shadow-xs space-y-3">
          <h3 className="text-[9px] font-mono tracking-widest font-bold text-orange-600">
            Adjust session
          </h3>
          
          <p className="text-[9px] text-amber-900 font-sans leading-relaxed">
            Distracted or anxious? Let me adapt your session.
          </p>

          <div className="grid grid-cols-3 gap-2">
            <button
               type="button"
               disabled={isLoadingFeedback}
               onClick={() => triggerAdaptive('distracted')}
               className="flex flex-col items-center justify-center text-center gap-1.5 py-1.5 px-1 bg-white/40 border border-orange-100/40 text-[10px] text-stone-800 rounded-xl transition-all duration-300 cursor-pointer hover:border-orange-200 hover:bg-orange-50"
            >
              <HelpCircle className="w-3.5 h-3.5 text-orange-700" />
              <span>Distracted</span>
            </button>
            <button
               type="button"
               disabled={isLoadingFeedback}
               onClick={() => triggerAdaptive('anxiety_increased')}
               className="flex flex-col items-center justify-center text-center gap-1.5 py-1.5 px-1 bg-white/40 border border-orange-100/40 text-[10px] text-red-800 rounded-xl transition-all duration-300 cursor-pointer hover:border-red-450 hover:bg-red-50"
            >
              <Activity className="w-3.5 h-3.5 text-red-500 animate-pulse" />
              <span>Anxious</span>
            </button>
            <button
               type="button"
               disabled={isLoadingFeedback}
               onClick={() => triggerAdaptive('feeling_better')}
               className="flex flex-col items-center justify-center text-center gap-1.5 py-1.5 px-1 bg-white/40 border border-orange-100/40 text-[10px] text-emerald-800 rounded-xl transition-all duration-300 cursor-pointer hover:border-emerald-450 hover:bg-emerald-50"
            >
              <Smile className="w-3.5 h-3.5 text-emerald-500" />
              <span>Better</span>
            </button>
          </div>

          <div className="pt-1.5 border-t border-black/5">
            {!showFeedbackInput ? (
               <button
                onClick={() => setShowFeedbackInput(true)}
                className="text-[9px] font-semibold text-orange-600 hover:text-amber-900 flex items-center justify-center w-full gap-1 cursor-pointer animate-pulse"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>Specify obstacle? Tap here</span>
              </button>
            ) : (
              <div className="space-y-2 animate-slide-in">
                <textarea
                  id="feedback-text-area"
                  value={customFeedbackText}
                  onChange={(e) => setCustomFeedbackText(e.target.value)}
                  placeholder="e.g., loud noise, racing mind..."
                  className="w-full text-xs p-2.5 border border-orange-100/50 rounded-lg bg-white text-stone-800 placeholder-slate-400 resize-none h-16 focus:outline-none focus:ring-1 focus:ring-orange-500 font-sans"
                />
                <div className="flex justify-end gap-1.5">
                  <button
                    onClick={() => setShowFeedbackInput(false)}
                    className="px-2.5 py-1 text-[9px] text-stone-500 bg-black/5 hover:bg-black/10 rounded-lg transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => triggerAdaptive('freeform', customFeedbackText)}
                    disabled={!customFeedbackText.trim() || isLoadingFeedback}
                    className="px-3.5 py-1 text-[9px] bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-display font-medium transition-all cursor-pointer disabled:opacity-50"
                  >
                    Adapt now
                  </button>
                </div>
              </div>
            )}
          </div>

          {isLoadingFeedback && (
            <div className="flex items-center justify-center gap-1.5 text-[9px] text-orange-600 mt-1.5 animate-pulse bg-orange-50/80 p-1.5 border border-orange-100 rounded-lg">
              <div className="w-3 h-3 border border-orange-600 border-t-transparent rounded-full animate-spin" />
              <span>Adapting session...</span>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
