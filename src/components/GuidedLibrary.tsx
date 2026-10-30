import { useState } from 'react';
import { Play, Sparkles, ChevronRight } from 'lucide-react';
import { GUIDED_VIDEOS } from '../content';

const TILE_GRADIENTS = [
  'linear-gradient(135deg, #ff6b4a, #e8458b)',
  'linear-gradient(135deg, #ffb547, #ff6b4a)',
  'linear-gradient(135deg, #e8458b, #7a2a6e)',
  'linear-gradient(135deg, #ffcd66, #f2577a)',
];

interface GuidedLibraryProps {
  onStartSpa: () => void;
}

// Videos load only when tapped, from youtube-nocookie.com, so nothing is
// shared with YouTube until the user chooses to watch.
export default function GuidedLibrary({ onStartSpa }: GuidedLibraryProps) {
  const [playingId, setPlayingId] = useState<string | null>(null);

  return (
    <div className="px-4 pt-5 space-y-4">
      <button
        type="button"
        onClick={onStartSpa}
        className="w-full text-left rounded-2xl p-4 text-white cursor-pointer transition-transform duration-300 hover:-translate-y-0.5 active:scale-[0.99] shadow-lg"
        style={{ background: 'linear-gradient(120deg, #ff6b4a 0%, #f2577a 55%, #e8458b 100%)' }}
      >
        <div className="flex items-center justify-between gap-3">
          <div>
            <span className="flex items-center gap-1.5 text-[11px] text-white/90">
              <Sparkles className="w-3.5 h-3.5" /> Signature practice · 5 minutes
            </span>
            <span className="block font-display text-lg text-white mt-1">The Mental SPA</span>
            <span className="block text-xs text-white/90 mt-0.5">Five gentle steps for peace, joy and love</span>
          </div>
          <ChevronRight className="w-5 h-5 text-white shrink-0" />
        </div>
      </button>

      <div className="space-y-2.5">
        <h3 className="font-display text-base text-stone-900">Guided by Dr Asta</h3>

        {playingId && (
          <div className="rounded-2xl overflow-hidden aspect-video bg-black">
            <iframe
              className="w-full h-full"
              src={`https://www.youtube-nocookie.com/embed/${playingId}?autoplay=1&rel=0`}
              title="Guided meditation"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}

        <div className="flex gap-2.5 overflow-x-auto scroller-none pb-1 -mx-4 px-4">
          {GUIDED_VIDEOS.map((v, i) => (
            <button
              key={v.id}
              type="button"
              onClick={() => setPlayingId(v.id)}
              className={`shrink-0 w-36 text-left glass-panel rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:-translate-y-0.5 ${playingId === v.id ? 'ring-2 ring-orange-500' : ''}`}
            >
              {/* Local colour tiles, not YouTube thumbnails, so nothing loads from Google until play */}
              <div
                className="relative aspect-video"
                style={{ background: TILE_GRADIENTS[i % TILE_GRADIENTS.length] }}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow">
                    <Play className="w-3.5 h-3.5 text-orange-600 ml-0.5" />
                  </span>
                </span>
                <span className="absolute bottom-1 right-1 text-[10px] text-white bg-black/60 rounded px-1">{v.duration}</span>
              </div>
              <div className="p-2">
                <span className="block text-[10px] text-blue-600">{v.tag}</span>
                <span className="block text-xs text-stone-800 leading-snug line-clamp-2">{v.title}</span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
