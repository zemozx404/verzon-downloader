import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  ClipboardPaste,
  Download,
  Image as ImageIcon,
  Loader2,
  Music,
  Smartphone,
  Sparkles,
  X,
} from 'lucide-react';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { AdBanner } from './components/AdBanner';
import { FaqSection } from './components/FaqSection';
import { HistoryDrawer } from './components/HistoryDrawer';
import {
  InterstitialAdModal,
  type PendingDownloadInfo,
} from './components/InterstitialAdModal';
import { LegalModal, type LegalModalType } from './components/LegalModal';
import { Navbar } from './components/Navbar';
import { ResultCard } from './components/ResultCard';
import type {
  DownloaderMode,
  DownloadHistoryItem,
  TikTokVideoData,
} from './types/tiktok';

const HISTORY_STORAGE_KEY = 'ssstik_id_history_v1';

const MODE_COPY: Record<
  DownloaderMode,
  { title: string; subtitle: string; placeholder: string }
> = {
  video: {
    title: 'Download Video TikTok Tanpa Watermark',
    subtitle:
      'Simpan video TikTok kualitas HD (MP4) tanpa logo atau tanda air secara gratis dan cepat di semua perangkat.',
    placeholder: 'Tempel tautan video TikTok di sini (contoh: https://vt.tiktok.com/...)',
  },
  mp3: {
    title: 'Download Audio & Lagu TikTok MP3',
    subtitle:
      'Ekstrak musik dan suara latar TikTok favorit Anda ke format audio MP3 jernih hanya dengan satu klik.',
    placeholder: 'Tempel tautan video TikTok untuk diambil MP3-nya...',
  },
  slide: {
    title: 'Download Slide Foto TikTok Tanpa Watermark',
    subtitle:
      'Simpan seluruh gambar dari postingan slide foto TikTok (carousel) dalam resolusi penuh tanpa tanda air.',
    placeholder: 'Tempel tautan slide foto TikTok di sini...',
  },
};

function loadSavedHistory(): DownloadHistoryItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [mode, setMode] = useState<DownloaderMode>('video');
  const [urlInput, setUrlInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingSample, setLoadingSample] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [pasteFeedback, setPasteFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<TikTokVideoData | null>(null);

  const [history, setHistory] = useState<DownloadHistoryItem[]>(() =>
    loadSavedHistory()
  );
  const [historyOpen, setHistoryOpen] = useState(false);
  const [legalModal, setLegalModal] = useState<LegalModalType>(null);
  const [pendingDownload, setPendingDownload] =
    useState<PendingDownloadInfo | null>(null);
  const [unlockedKeys, setUnlockedKeys] = useState<Record<string, boolean>>({});

  const handleUnlockReward = useCallback((key: string) => {
    setUnlockedKeys((prev) => (prev[key] ? prev : { ...prev, [key]: true }));
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota errors
    }
  }, [history]);

  const recordHistory = (sourceUrl: string, videoData: TikTokVideoData) => {
    const entry: DownloadHistoryItem = {
      id: videoData.id,
      url: sourceUrl,
      title: videoData.title,
      authorHandle: videoData.author.uniqueId,
      cover: videoData.cover,
      savedAt: new Date().toISOString(),
    };

    setHistory((prev) => {
      const filtered = prev.filter((item) => item.id !== entry.id);
      return [entry, ...filtered].slice(0, 12);
    });
  };

  const fetchTikTokVideo = async (targetUrl: string) => {
    const trimmed = targetUrl.trim();
    if (!trimmed) {
      setErrorMsg('Silakan tempelkan tautan video TikTok terlebih dahulu.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch('/api/tiktok', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: trimmed }),
      });

      const payload = (await res.json()) as {
        data?: TikTokVideoData;
        error?: string;
      };

      if (!res.ok || !payload.data) {
        setErrorMsg(
          payload.error ||
            'Gagal memproses tautan. Periksa kembali URL TikTok Anda.'
        );
        setResult(null);
        return;
      }

      setResult(payload.data);
      recordHistory(trimmed, payload.data);
    } catch {
      setErrorMsg(
        'Terjadi gangguan jaringan saat menghubungi server. Silakan coba lagi.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    void fetchTikTokVideo(urlInput);
  };

  const handlePasteClipboard = async () => {
    setErrorMsg(null);
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        setUrlInput(text.trim());
        setPasteFeedback('Tautan ditempel');
        window.setTimeout(() => setPasteFeedback(null), 2000);
      } else {
        setErrorMsg('Papan klip kosong. Salin tautan video TikTok terlebih dahulu.');
      }
    } catch {
      setErrorMsg(
        'Izin papan klip diblokir peramban. Silakan tempel manual (Ctrl+V / tekan lama).'
      );
    }
  };

  const handleLoadSample = async () => {
    setLoadingSample(true);
    setErrorMsg(null);
    try {
      const res = await fetch('/api/tiktok/sample');
      const payload = (await res.json()) as {
        url?: string;
        data?: TikTokVideoData;
        error?: string;
      };
      if (!res.ok || !payload.url || !payload.data) {
        setErrorMsg(
          payload.error || 'Tautan contoh sedang tidak tersedia. Silakan tempel tautan TikTok Anda.'
        );
        return;
      }
      setUrlInput(payload.url);
      setResult(payload.data);
      recordHistory(payload.url, payload.data);
    } catch {
      setErrorMsg('Tidak dapat memuat tautan contoh saat ini.');
    } finally {
      setLoadingSample(false);
    }
  };

  const activeCopy = MODE_COPY[mode];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      <Navbar
        historyCount={history.length}
        onOpenHistory={() => setHistoryOpen(true)}
        onSelectMode={(nextMode) => setMode(nextMode)}
      />

      <main className="flex-1">
        <section
          id="downloader"
          className={`relative overflow-hidden bg-gradient-to-br from-indigo-700 via-violet-700 to-sky-600 text-white px-4 sm:px-6 ${
            result ? 'py-8 sm:py-10' : 'py-14 sm:py-20'
          }`}
        >
          <div className="max-w-4xl mx-auto text-center">
            <div
              role="tablist"
              aria-label="Pilih format unduhan"
              className="inline-flex items-center gap-1 p-1 rounded-xl bg-slate-950/25 border border-white/15 mb-6"
            >
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'video'}
                onClick={() => setMode('video')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'video'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Video HD
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'mp3'}
                onClick={() => setMode('mp3')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'mp3'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Audio MP3
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mode === 'slide'}
                onClick={() => setMode('slide')}
                className={`px-3.5 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  mode === 'slide'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-white/90 hover:text-white hover:bg-white/10'
                }`}
              >
                Slide Foto
              </button>
            </div>

            <h1
              className="font-extrabold tracking-tight text-white mb-4 mx-auto max-w-3xl leading-[1.12]"
              style={{
                fontSize: 'clamp(2rem, 4.2vw, 3.35rem)',
                textWrap: 'balance',
              }}
            >
              {activeCopy.title}
            </h1>

            <p className="text-sm sm:text-base text-indigo-100 max-w-2xl mx-auto mb-8 leading-relaxed">
              {activeCopy.subtitle}
            </p>

            <form
              onSubmit={handleSubmit}
              className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-white/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-2"
            >
              <div className="relative flex-1 flex items-center">
                <label htmlFor="tiktok-url-input" className="sr-only">
                  Tautan video TikTok
                </label>
                <input
                  id="tiktok-url-input"
                  type="url"
                  inputMode="url"
                  value={urlInput}
                  onChange={(e) => {
                    setUrlInput(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  placeholder={activeCopy.placeholder}
                  className="w-full h-12 sm:h-13 pl-4 pr-24 text-sm sm:text-base text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-600"
                />

                <div className="absolute right-1.5 flex items-center gap-1">
                  {urlInput ? (
                    <button
                      type="button"
                      onClick={() => {
                        setUrlInput('');
                        setErrorMsg(null);
                      }}
                      aria-label="Hapus tautan"
                      className="inline-flex items-center gap-1 px-2.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      Hapus
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => void handlePasteClipboard()}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      {pasteFeedback ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          {pasteFeedback}
                        </>
                      ) : (
                        <>
                          <ClipboardPaste className="w-3.5 h-3.5" />
                          Tempel
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="h-12 sm:h-13 px-7 rounded-xl bg-slate-950 hover:bg-slate-800 disabled:opacity-60 text-white font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memproses...
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Unduh
                  </>
                )}
              </button>
            </form>

            {errorMsg && (
              <div
                role="alert"
                className="max-w-3xl mx-auto mt-4 px-4 py-3 rounded-xl bg-rose-950/60 border border-rose-300/40 text-white text-xs sm:text-sm flex items-center justify-center gap-2 text-left"
              >
                <AlertCircle className="w-4 h-4 text-rose-200 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="mt-5 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-indigo-100">
              <span>Mendukung tautan tiktok.com, vt.tiktok.com, dan vm.tiktok.com</span>
              <span aria-hidden="true">·</span>
              <button
                type="button"
                disabled={loadingSample}
                onClick={() => void handleLoadSample()}
                className="inline-flex items-center gap-1 font-semibold text-white underline underline-offset-4 hover:text-indigo-200 transition-colors cursor-pointer disabled:opacity-60"
              >
                {loadingSample ? 'Memuat contoh...' : 'Coba tautan contoh'}
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
            {result && (
              <ResultCard
                video={result}
                activeMode={mode}
                unlockedKeys={unlockedKeys}
                onStartDownload={(info) => {
                  setPendingDownload(info);
                  if (window.location.hash !== '#fullscreen_ad') {
                    window.history.replaceState(null, '', '#fullscreen_ad');
                  }
                }}
                onReset={() => {
                  setResult(null);
                  setUrlInput('');
                  setErrorMsg(null);
                }}
              />
            )}
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-4">
          <AdBanner variant="leaderboard" />
        </section>

        <section
          id="cara-unduh"
          className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16"
        >
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 lg:gap-10 items-start">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mb-3">
                Cara Mengunduh Video TikTok Tanpa Watermark
              </h2>
              <p className="text-slate-600 text-sm sm:text-base mb-8 max-w-2xl leading-relaxed">
                Ikuti tiga langkah sederhana berikut untuk menyimpan video TikTok dalam format MP4 atau audio MP3 langsung ke galeri ponsel maupun komputer Anda.
              </p>

              <div className="space-y-4">
                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 mb-1.5">
                    01. Salin Tautan Video TikTok
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Buka aplikasi TikTok di ponsel atau situs web di komputer, pilih video yang ingin disimpan, ketuk tombol <strong>Bagikan</strong> lalu pilih <strong>Salin Tautan</strong>.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 mb-1.5">
                    02. Tempel di Kolom Unduh Verzon Downloader
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Kembali ke halaman ini, ketuk tombol <strong>Tempel</strong> pada kotak input di atas atau tempel tautan secara manual, kemudian tekan tombol <strong>Unduh</strong>.
                  </p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6">
                  <h3 className="text-base sm:text-lg font-bold text-slate-950 mb-1.5">
                    03. Pilih Format Video MP4 atau Audio MP3
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Dalam beberapa detik, pratinjau video muncul beserta pilihan kualitas. Pilih <strong>Tanpa Watermark (MP4)</strong>, <strong>Kualitas HD</strong>, atau <strong>Unduh Audio MP3</strong>.
                  </p>
                </div>
              </div>
            </div>

            <aside className="lg:sticky lg:top-24 flex flex-col items-center bg-white rounded-2xl border border-slate-200 p-4">
              <AdBanner variant="rectangle" />
              <p className="mt-3 text-xs text-slate-500 text-center leading-relaxed">
                Layanan gratis tanpa batas unduhan harian berkat dukungan mitra iklan.
              </p>
            </aside>
          </div>
        </section>

        <section className="bg-white border-y border-slate-200 py-14 sm:py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mb-2">
                Mengapa Memilih Verzon Downloader
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                Dirancang khusus agar proses penyimpanan video dan lagu TikTok berlangsung cepat tanpa mengganggu kenyamanan perangkat Anda.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    Video Jernih Tanpa Watermark &amp; Resolusi HD
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                    Dapatkan salinan video asli tanpa logo TikTok yang menutupi layar. Cocok untuk diarsipkan secara pribadi, ditonton ulang secara offline, atau dijadikan referensi konten.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 tabular-nums">
                  <span>Format MP4 H.264</span>
                  <span aria-hidden="true">·</span>
                  <span>Hingga 1080p Full HD</span>
                  <span aria-hidden="true">·</span>
                  <span>Tanpa batas unduhan</span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
                    <Music className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    Ekstrak Audio MP3 Instan
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Butuh lagunya saja? Unduh suara latar atau musik viral TikTok langsung menjadi file MP3 yang siap diputar di pemutar musik mana pun.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/80 text-xs text-slate-500">
                  Kompatibel nada dering &amp; pemutar audio
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center mb-4">
                    <ImageIcon className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    Simpan Slide Foto TikTok
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    Mendukung unggahan galeri foto geser (slideshow) TikTok. Unduh setiap gambar dalam resolusi penuh tanpa tanda air.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/80 text-xs text-slate-500">
                  Format JPG resolusi tinggi
                </div>
              </div>

              <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-slate-50/70 p-6 flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-950 mb-2">
                    Berjalan Langsung di Semua Perangkat Tanpa Aplikasi Tambahan
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed max-w-xl">
                    Tidak perlu menginstal APK atau ekstensi peramban apa pun. Verzon Downloader bekerja mulus di Chrome, Safari iPhone/iPad, Android, Windows, dan macOS.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-slate-200/80 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span>Android &amp; iOS Safari</span>
                  <span aria-hidden="true">·</span>
                  <span>Windows &amp; macOS</span>
                  <span aria-hidden="true">·</span>
                  <span>Tanpa login akun</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <FaqSection />
      </main>

      <footer className="bg-slate-950 text-slate-300 border-t border-slate-800 py-10 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="text-lg font-extrabold tracking-tight text-white mb-1.5">
              Verzon <span className="text-indigo-400">Downloader</span>
            </div>
            <p className="text-xs text-slate-400 max-w-md leading-relaxed">
              Alat pengunduh video TikTok tanpa watermark dan konverter MP3 berbasis web. Kami tidak berafiliasi dengan TikTok atau ByteDance Ltd.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs sm:text-sm">
            <button
              type="button"
              onClick={() => {
                setMode('video');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Video TikTok
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('mp3');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-white transition-colors cursor-pointer"
            >
              TikTok MP3
            </button>
            <button
              type="button"
              onClick={() => setLegalModal('privacy')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Kebijakan Privasi
            </button>
            <button
              type="button"
              onClick={() => setLegalModal('terms')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Ketentuan Layanan
            </button>
            <button
              type="button"
              onClick={() => setLegalModal('contact')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Kontak
            </button>
          </div>
        </div>
      </footer>

      <HistoryDrawer
        open={historyOpen}
        items={history}
        onClose={() => setHistoryOpen(false)}
        onSelectUrl={(savedUrl) => {
          setUrlInput(savedUrl);
          void fetchTikTokVideo(savedUrl);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onClear={() => setHistory([])}
      />

      <LegalModal type={legalModal} onClose={() => setLegalModal(null)} />

      <InterstitialAdModal
        downloadInfo={pendingDownload}
        onUnlockReward={handleUnlockReward}
        onClose={() => {
          setPendingDownload(null);
          if (window.location.hash === '#fullscreen_ad') {
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
          }
        }}
      />
    </div>
  );
}
