import { useState } from 'react';
import { Play, Sparkles, ChevronRight, Wind, X } from 'lucide-react';
import { GUIDED_VIDEOS } from '../content';

const TILE_GRADIENTS = [
  'linear-gradient(135deg, #ff6b4a, #e8458b)',
  'linear-gradient(135deg, #ffb547, #ff6b4a)',
  'linear-gradient(135deg, #e8458b, #7a2a6e)',
  'linear-gradient(135deg, #ffcd66, #f2577a)',
];

interface PractiseProps {
  onStartSpa: () => void;
  onStartReset: () => void;
}

// One page for every practice: the signature Mental SPA first, the 60-second reset,
// then द्रष्टा (Drasta)'s guided videos. Nothing loads from YouTube until a video is opened.
export default function Practise({ onStartSpa, onStartReset }: PractiseProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);
  const playing = GUIDED_VIDEOS.find(v => v.id === playingId);

  return (
    <div className="h-full px-4 py-1 flex flex-col justify-evenly gap-2.5 animate-fade-in">
      <h1 className="font-display text-[24px] text-amber-950 text-center">Practise</h1>

      <button
        type="button"
        onClick={onStartSpa}
        className="w-full text-left rounded-2xl px-4 py-3 text-white cursor-pointer transition-transform duration-300 active:scale-[0.99] shadow-lg mood-chip-on"
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 text-[12px] text-white/90">
              <Sparkles className="w-3.5 h-3.5" /> Signature · 5 minutes · in Drasta's voice
            </span>
            <span className="block font-display text-[20px] text-white mt-0.5">The Mental SPA</span>
            <span className="block text-[13px] text-white/90">Five gentle steps for peace, joy and love</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white shrink-0" />
        </div>
      </button>

      <button
        type="button"
        onClick={onStartReset}
        className="w-full flex items-center gap-3 rounded-2xl px-4 py-2.5 glass-panel cursor-pointer text-left"
      >
        <span className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #ffb547, #ff6b4a)' }}>
          <Wind className="w-5 h-5 text-white" />
        </span>
        <span className="flex-1">
          <span className="block font-display text-[16px] text-stone-900">60-second reset</span>
          <span className="block text-[13px] text-stone-500">Six slow breaths, works offline</span>
        </span>
        <ChevronRight className="w-5 h-5 text-orange-500" />
      </button>

      <div className="space-y-2">
        <div className="flex items-baseline justify-between">
          <h2 className="font-display text-[17px] text-stone-900">Guided by द्रष्टा (Drasta)</h2>
          <span className="text-[12px] text-stone-500">Swipe for more →</span>
        </div>
        {/* Four at a time (two by two); swipe sideways for more */}
        <div className="grid grid-rows-2 grid-flow-col auto-cols-[calc(50%-4px)] gap-2 overflow-x-auto snap-x snap-mandatory scroller-none" aria-label="Guided videos, swipe for more">
          {GUIDED_VIDEOS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setPlayingId(v.id)}
              aria-label={`${v.title}, ${v.duration}`}
              className={`flex flex-col text-left glass-panel rounded-xl overflow-hidden cursor-pointer ${i % 2 === 0 ? 'snap-start' : ''}`}
            >
              <div className="relative h-12 flex items-center justify-center" style={{ background: TILE_GRADIENTS[i % TILE_GRADIENTS.length] }}>
                <Play className="w-5 h-5 text-white" />
                <span className="absolute bottom-1 right-1.5 text-[11px] text-white">{v.duration}</span>
              </div>
              <span className="px-2 py-1.5 text-[13px] text-stone-800 leading-tight line-clamp-2 min-h-[2.6em]">{v.title}</span>
            </button>
          ))}
        </div>
      </div>

      {playing && (
        <div className="absolute inset-0 z-20 flex flex-col justify-center gap-3 px-3 bg-[#2a1036]/85 backdrop-blur-sm animate-fade-in">
          <div className="rounded-2xl overflow-hidden aspect-video bg-black">
            {/* Standard YouTube player, started by the viewer, so plays count on the channel */}
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${playing.id}?rel=0&playsinline=1`}
              title={playing.title}
              allow="encrypted-media; picture-in-picture; fullscreen"
              allowFullScreen
            />
          </div>
          <span className="block text-[15px] text-white text-center">{playing.title}</span>
          <span className="block text-[12px] text-white/80 text-center">Tap play. This video plays from YouTube.</span>
          <button
            type="button"
            onClick={() => setPlayingId(null)}
            className="mx-auto flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-white/90 text-[15px] text-stone-900 cursor-pointer"
          >
            <X className="w-4 h-4" /> Close
          </button>
        </div>
      )}
    </div>
  );
}
