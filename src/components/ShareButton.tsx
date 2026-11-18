import { useState } from 'react';
import { Share2 } from 'lucide-react';

// Where people can get PeMA. Empty until PeMA is hosted, so we never share a broken link.
export const APP_URL = '';

// Draws a calm, branded card. It holds only the words passed in (never moods or notes),
// is made on the device, and goes nowhere unless the person chooses to share it.
async function drawCard(headline: string, detail: string): Promise<Blob | null> {
  const W = 1080, H = 1350;
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const g = c.getContext('2d');
  if (!g) return null;
  await document.fonts?.ready;

  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, '#ffb547'); bg.addColorStop(0.45, '#ff6b4a'); bg.addColorStop(1, '#e8458b');
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  // Soft sun
  const sun = g.createRadialGradient(W * 0.78, H * 0.2, 10, W * 0.78, H * 0.2, 420);
  sun.addColorStop(0, 'rgba(255,240,200,0.85)'); sun.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = sun; g.fillRect(0, 0, W, H);

  g.fillStyle = '#ffffff'; g.textAlign = 'center';
  g.font = 'italic 600 64px "Fraunces Variable", Georgia, serif';
  g.fillText('PeMA', W / 2, 190);

  const wrap = (text: string, font: string, y: number, lineH: number, max = 860) => {
    g.font = font;
    const words = text.split(' '); let line = ''; const lines: string[] = [];
    for (const w of words) { const t = line ? `${line} ${w}` : w; if (g.measureText(t).width > max && line) { lines.push(line); line = w; } else line = t; }
    lines.push(line);
    lines.forEach((l, i) => g.fillText(l, W / 2, y + i * lineH));
    return y + lines.length * lineH;
  };
  const y = wrap(headline, '500 84px "Fraunces Variable", Georgia, serif', 560, 100);
  wrap(detail, '400 42px "Inter Variable", system-ui, sans-serif', y + 40, 56);

  g.font = '400 36px "Inter Variable", system-ui, sans-serif';
  g.fillText('Your app. Your data. Your choice.', W / 2, H - 170);
  g.font = '400 32px "Inter Variable", "Noto Sans Devanagari", system-ui, sans-serif';
  g.fillText(APP_URL || 'Built by द्रष्टा (Drasta)', W / 2, H - 110);

  return new Promise(res => c.toBlob(b => res(b), 'image/png'));
}

export default function ShareButton({ headline, detail, label = 'Share' }: { headline: string; detail: string; label?: string }) {
  const [status, setStatus] = useState<'' | 'saved' | 'shared'>('');

  const share = async () => {
    const blob = await drawCard(headline, detail);
    if (!blob) return;
    const file = new File([blob], 'pema.png', { type: 'image/png' });
    const text = `${headline} ${detail}${APP_URL ? ` ${APP_URL}` : ''}`;
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], text });
        setStatus('shared');
        return;
      }
    } catch {
      return; // the person closed the share sheet
    }
    // No share sheet (most computers): save the picture instead
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'pema.png';
    a.click();
    URL.revokeObjectURL(a.href);
    setStatus('saved');
  };

  return (
    <button
      type="button"
      onClick={share}
      className="flex items-center justify-center gap-1.5 h-11 px-4 rounded-2xl border border-orange-200 bg-white/80 text-[15px] text-orange-700 cursor-pointer hover:bg-white"
    >
      <Share2 className="w-4 h-4" /> {status === 'saved' ? 'Picture saved' : status === 'shared' ? 'Shared' : label}
    </button>
  );
}
