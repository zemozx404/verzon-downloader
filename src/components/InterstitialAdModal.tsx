import { CheckCircle2, Download, Lock, Unlock, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { AdBanner } from './AdBanner';

export interface PendingDownloadInfo {
  key: string;
  label: string;
  href: string;
  filename: string;
}

interface InterstitialAdModalProps {
  downloadInfo: PendingDownloadInfo | null;
  onUnlockReward: (key: string) => void;
  onClose: () => void;
}

const AD_DURATION_SECONDS = 5;

function triggerFileDownload(href: string, filename: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function InterstitialAdModal({
  downloadInfo,
  onUnlockReward,
  onClose,
}: InterstitialAdModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(AD_DURATION_SECONDS);
  const [rewardUnlocked, setRewardUnlocked] = useState(false);
  const triggeredForRef = useRef<string | null>(null);

  useEffect(() => {
    if (!downloadInfo) {
      triggeredForRef.current = null;
      return;
    }

    setSecondsLeft(AD_DURATION_SECONDS);
    setRewardUnlocked(false);
    triggeredForRef.current = null;

    const interval = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [downloadInfo]);

  useEffect(() => {
    if (!downloadInfo || secondsLeft > 0) return;

    setRewardUnlocked(true);
    onUnlockReward(downloadInfo.key);

    const rewardToken = `${downloadInfo.key}:${downloadInfo.href}`;
    if (triggeredForRef.current !== rewardToken) {
      triggeredForRef.current = rewardToken;
      triggerFileDownload(downloadInfo.href, downloadInfo.filename);
    }
  }, [downloadInfo, onUnlockReward, secondsLeft]);

  if (!downloadInfo) return null;

  const progressPercent =
    ((AD_DURATION_SECONDS - secondsLeft) / AD_DURATION_SECONDS) * 100;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md"
      role="dialog"
      aria-modal="true"
      aria-label="Tonton iklan untuk membuka unduhan"
    >
      <div className="w-full max-w-3xl flex flex-col">
        <div className="flex justify-end mb-2">
          <button
            type="button"
            disabled={!rewardUnlocked}
            onClick={onClose}
            aria-label={
              rewardUnlocked
                ? 'Tutup iklan'
                : `Tutup terkunci selama ${secondsLeft} detik`
            }
            className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              rewardUnlocked
                ? 'bg-white text-slate-950 hover:bg-slate-100 cursor-pointer shadow-sm'
                : 'bg-slate-900/80 text-slate-300 border border-white/15 cursor-not-allowed'
            }`}
          >
            {rewardUnlocked ? (
              <>
                <X className="w-4 h-4" />
                <span>Tutup</span>
              </>
            ) : (
              <>
                <Lock className="w-3.5 h-3.5" />
                <span className="tabular-nums">Tutup ({secondsLeft}d)</span>
              </>
            )}
          </button>
        </div>

        <div className="relative w-full bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-200">
          <div className="h-1.5 w-full bg-slate-200">
            <div
              className="h-full bg-amber-400 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] bg-white">
            <div className="bg-slate-100/95 p-5 sm:p-6 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
              <div>
                <p className="text-xs font-medium text-slate-500 mb-2">
                  Verzon Downloader
                </p>

                {rewardUnlocked ? (
                  <>
                    <div className="inline-flex items-center gap-1.5 text-emerald-700 text-xs font-semibold mb-2">
                      <Unlock className="w-4 h-4" />
                      <span>Reward Terbuka</span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-950 leading-snug mb-2">
                      Unduhan Siap Disimpan
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Berkas <strong>{downloadInfo.label}</strong> sedang diunduh. Anda dapat menutup jendela ini atau tekan tombol di bawah jika belum mulai.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="inline-flex items-center gap-1.5 text-amber-700 text-xs font-semibold mb-2">
                      <Lock className="w-4 h-4" />
                      <span className="tabular-nums">
                        Iklan Berjalan ({secondsLeft}d)
                      </span>
                    </div>
                    <h3 className="text-lg font-extrabold text-slate-950 leading-snug mb-2">
                      Tunggu Iklan Selesai
                    </h3>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Unduhan <strong>{downloadInfo.label}</strong> terkunci hingga hitungan mundur iklan selesai.
                    </p>
                  </>
                )}
              </div>

              <div className="mt-5 pt-4 border-t border-slate-200/80">
                {rewardUnlocked ? (
                  <button
                    type="button"
                    onClick={() =>
                      triggerFileDownload(
                        downloadInfo.href,
                        downloadInfo.filename
                      )
                    }
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Simpan Berkas Sekarang
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-slate-200 text-slate-500 text-xs font-semibold cursor-not-allowed tabular-nums"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    Terkunci ({secondsLeft}d)
                  </button>
                )}

                {rewardUnlocked && (
                  <div className="mt-2.5 flex items-center justify-center gap-1.5 text-[11px] font-medium text-emerald-700">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Unduhan telah dipicu otomatis</span>
                  </div>
                )}
              </div>
            </div>

            <div className="p-5 sm:p-6 flex flex-col items-center justify-center min-h-[290px] bg-white">
              <AdBanner variant="rectangle" hideLabel />
              <p className="mt-3 text-[11px] text-slate-400 text-center">
                Iklan sponsor membuka unduhan gratis berkualitas tinggi.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
