import { Clock, ExternalLink, Trash2, X } from 'lucide-react';
import type { DownloadHistoryItem } from '../types/tiktok';

interface HistoryDrawerProps {
  open: boolean;
  items: DownloadHistoryItem[];
  onClose: () => void;
  onSelectUrl: (url: string) => void;
  onClear: () => void;
}

export function HistoryDrawer({
  open,
  items,
  onClose,
  onSelectUrl,
  onClear,
}: HistoryDrawerProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/40 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label="Riwayat unduhan TikTok"
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <aside className="relative z-10 w-full max-w-md bg-white h-full border-l border-slate-200 flex flex-col shadow-xl">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-950">
              Riwayat Unduhan
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup riwayat"
            className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 px-4">
              <p className="text-sm font-semibold text-slate-800 mb-1">
                Belum ada riwayat unduhan
              </p>
              <p className="text-xs text-slate-500 leading-relaxed">
                Video TikTok yang berhasil Anda proses akan muncul di sini agar mudah diunduh ulang kapan saja.
              </p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.savedAt}`}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-white transition-colors flex items-start gap-3"
              >
                {item.cover ? (
                  <img
                    src={`/api/image?url=${encodeURIComponent(item.cover)}`}
                    alt={item.title}
                    referrerPolicy="no-referrer"
                    className="w-12 h-16 rounded-lg object-cover border border-slate-200 shrink-0 bg-slate-200"
                  />
                ) : (
                  <div className="w-12 h-16 rounded-lg bg-slate-200 shrink-0" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 line-clamp-2 leading-snug mb-1">
                    {item.title}
                  </p>
                  <p className="text-xs text-slate-500 truncate mb-2">
                    @{item.authorHandle} ·{' '}
                    {new Date(item.savedAt).toLocaleDateString('id-ID', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectUrl(item.url);
                      onClose();
                    }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Proses Ulang Tautan
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50">
            <button
              type="button"
              onClick={onClear}
              className="w-full py-2.5 px-4 rounded-lg border border-slate-300 bg-white hover:bg-slate-100 text-xs font-semibold text-slate-700 inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Hapus Semua Riwayat
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}
