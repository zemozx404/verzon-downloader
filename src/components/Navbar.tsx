import { Menu, X } from 'lucide-react';
import { useState } from 'react';
import type { DownloaderMode } from '../types/tiktok';

interface NavbarProps {
  historyCount: number;
  onOpenHistory: () => void;
  onSelectMode: (mode: DownloaderMode) => void;
}

export function Navbar({
  historyCount,
  onOpenHistory,
  onSelectMode,
}: NavbarProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavMode = (mode: DownloaderMode) => {
    onSelectMode(mode);
    setMobileMenuOpen(false);
    const el = document.getElementById('downloader');
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
        <a
          href="#downloader"
          onClick={(e) => {
            e.preventDefault();
            handleNavMode('video');
          }}
          className="text-xl font-extrabold tracking-tight text-slate-950 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-indigo-600"
        >
          Verzon <span className="text-indigo-600">Downloader</span>
        </a>

        <nav
          aria-label="Navigasi utama"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600"
        >
          <button
            type="button"
            onClick={() => handleNavMode('video')}
            className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            Video TikTok
          </button>
          <button
            type="button"
            onClick={() => handleNavMode('mp3')}
            className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            TikTok MP3
          </button>
          <a
            href="#cara-unduh"
            className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Cara Unduh
          </a>
          <a
            href="#faq"
            className="hover:text-slate-950 hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            FAQ
          </a>
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onOpenHistory}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            Riwayat{historyCount > 0 ? ` (${historyCount})` : ''}
          </button>

          <button
            type="button"
            aria-label={mobileMenuOpen ? 'Tutup menu' : 'Buka menu'}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden p-2.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => handleNavMode('video')}
            className="text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            Video TikTok
          </button>
          <button
            type="button"
            onClick={() => handleNavMode('mp3')}
            className="text-left px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg cursor-pointer"
          >
            TikTok MP3
          </button>
          <a
            href="#cara-unduh"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Cara Unduh
          </a>
          <a
            href="#faq"
            onClick={() => setMobileMenuOpen(false)}
            className="px-3 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            FAQ
          </a>
        </div>
      )}
    </header>
  );
}
