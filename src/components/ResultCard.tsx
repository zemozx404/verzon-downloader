import {
  Check,
  Download,
  Image as ImageIcon,
  MessageSquare,
  MonitorPlay,
  Music,
  RotateCcw,
  Share2,
  ThumbsUp,
  Unlock,
} from 'lucide-react';
import { useState } from 'react';
import type { DownloaderMode, TikTokVideoData } from '../types/tiktok';
import type { PendingDownloadInfo } from './InterstitialAdModal';

interface ResultCardProps {
  video: TikTokVideoData;
  activeMode: DownloaderMode;
  unlockedKeys: Record<string, boolean>;
  onReset: () => void;
  onStartDownload: (info: PendingDownloadInfo) => void;
}

function formatCompactNumber(num: number): string {
  if (!num) return '0';
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)} Jt`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)} Rb`;
  return String(num);
}

function formatBytes(bytes: number): string {
  if (!bytes || bytes <= 0) return '';
  const mb = bytes / (1024 * 1024);
  if (mb >= 1) return `${mb.toFixed(1)} MB`;
  const kb = bytes / 1024;
  return `${Math.round(kb)} KB`;
}

function proxyImageUrl(rawUrl?: string): string {
  if (!rawUrl) return '';
  return `/api/image?url=${encodeURIComponent(rawUrl)}`;
}

function triggerDirectDownload(href: string, filename: string) {
  const link = document.createElement('a');
  link.href = href;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function ResultCard({
  video,
  activeMode,
  unlockedKeys,
  onReset,
  onStartDownload,
}: ResultCardProps) {
  const [coverFailed, setCoverFailed] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [startedKey, setStartedKey] = useState<string | null>(null);

  const baseFilename = `verzon_${video.author.uniqueId}_${video.id}`;
  const proxiedCover = proxyImageUrl(video.cover);
  const proxiedAvatar = proxyImageUrl(video.author.avatar);

  const buildDownloadHref = (
    mediaUrl: string,
    suffix: string,
    type: 'mp4' | 'mp3' | 'jpg'
  ) => {
    const params = new URLSearchParams({
      url: mediaUrl,
      filename: `${baseFilename}_${suffix}`,
      type,
    });
    return `/api/download?${params.toString()}`;
  };

  const handleActionClick = (
    key: string,
    label: string,
    href: string,
    filename: string
  ) => {
    const fullKey = `${video.id}:${key}`;
    if (unlockedKeys[fullKey]) {
      setStartedKey(key);
      triggerDirectDownload(href, filename);
      window.setTimeout(() => {
        setStartedKey((current) => (current === key ? null : current));
      }, 2500);
      return;
    }

    onStartDownload({ key: fullKey, label, href, filename });
  };

  const hasImages = video.images.length > 0;
  const hdTargetUrl = video.video.hd || video.video.noWatermark;

  const isSdUnlocked = Boolean(unlockedKeys[`${video.id}:sd`]);
  const isHdUnlocked = Boolean(unlockedKeys[`${video.id}:hd`]);
  const isMp3Unlocked = Boolean(unlockedKeys[`${video.id}:mp3`]);

  return (
    <div className="max-w-4xl mx-auto mt-6 text-left">
      <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/15 bg-indigo-950">
        {!coverFailed && proxiedCover && (
          <img
            src={proxiedCover}
            alt=""
            aria-hidden="true"
            referrerPolicy="no-referrer"
            onError={() => setCoverFailed(true)}
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
        )}

        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-r from-indigo-950/90 via-violet-950/75 to-indigo-950/88"
        />

        <div className="relative z-10 p-5 sm:p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
            <div className="flex-1 flex items-start gap-4 min-w-0">
              {!avatarFailed && proxiedAvatar ? (
                <img
                  src={proxiedAvatar}
                  alt={video.author.nickname}
                  referrerPolicy="no-referrer"
                  onError={() => setAvatarFailed(true)}
                  className="w-18 h-18 sm:w-22 sm:h-22 rounded-full object-cover border-2 border-white/85 shadow-lg shrink-0 bg-indigo-900"
                />
              ) : (
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-full bg-indigo-600 border-2 border-white/85 text-white font-bold text-2xl flex items-center justify-center shrink-0">
                  {video.author.nickname.slice(0, 1).toUpperCase()}
                </div>
              )}

              <div className="min-w-0 pt-0.5">
                <h2 className="text-lg sm:text-xl font-extrabold text-white truncate">
                  {video.author.nickname}
                </h2>
                <p className="text-xs text-indigo-200 mb-2 truncate">
                  @{video.author.uniqueId}
                </p>
                <p className="text-sm text-white/95 font-medium leading-snug line-clamp-3">
                  {video.title}
                </p>
              </div>
            </div>

            <div className="w-full md:w-[360px] shrink-0 space-y-2.5">
              {!hasImages && video.video.noWatermark && (
                <button
                  type="button"
                  onClick={() =>
                    handleActionClick(
                      'sd',
                      'Video Tanpa Watermark (MP4)',
                      buildDownloadHref(
                        video.video.noWatermark,
                        'tanpa_watermark',
                        'mp4'
                      ),
                      `${baseFilename}_tanpa_watermark.mp4`
                    )
                  }
                  className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                    activeMode === 'video'
                      ? 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                      : 'bg-sky-500 hover:bg-sky-400 text-slate-950'
                  }`}
                >
                  {startedKey === 'sd' ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : isSdUnlocked ? (
                    <Unlock className="w-4 h-4 shrink-0" />
                  ) : (
                    <Download className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {startedKey === 'sd'
                      ? 'Mengunduh Video...'
                      : isSdUnlocked
                        ? `Simpan Video MP4 (Terbuka)${formatBytes(video.video.size) ? ` · ${formatBytes(video.video.size)}` : ''}`
                        : `Tanpa tanda air${formatBytes(video.video.size) ? ` (${formatBytes(video.video.size)})` : ''}`}
                  </span>
                </button>
              )}

              {!hasImages && hdTargetUrl && (
                <button
                  type="button"
                  onClick={() =>
                    handleActionClick(
                      'hd',
                      'Video Tanpa Tanda Air HD (MP4)',
                      buildDownloadHref(hdTargetUrl, 'hd', 'mp4'),
                      `${baseFilename}_hd.mp4`
                    )
                  }
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-bold text-sm bg-sky-400 hover:bg-sky-300 text-slate-950 transition-colors cursor-pointer"
                >
                  {startedKey === 'hd' ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : isHdUnlocked ? (
                    <Unlock className="w-4 h-4 shrink-0" />
                  ) : (
                    <MonitorPlay className="w-4 h-4 shrink-0" />
                  )}
                  <span>
                    {startedKey === 'hd'
                      ? 'Mengunduh Video HD...'
                      : isHdUnlocked
                        ? 'Simpan Video HD (Reward Terbuka)'
                        : 'Tanpa tanda air HD · Watch ads'}
                  </span>
                </button>
              )}

              {video.music.playUrl && (
                <button
                  type="button"
                  onClick={() =>
                    handleActionClick(
                      'mp3',
                      `Audio MP3 · ${video.music.title}`,
                      buildDownloadHref(video.music.playUrl, 'audio', 'mp3'),
                      `${baseFilename}_audio.mp3`
                    )
                  }
                  className={`w-full flex items-center justify-center gap-2 px-5 py-3 rounded-lg font-semibold text-sm transition-colors cursor-pointer ${
                    activeMode === 'mp3'
                      ? 'bg-white text-indigo-950 hover:bg-indigo-50'
                      : 'bg-sky-400 hover:bg-sky-300 text-slate-950'
                  }`}
                >
                  {startedKey === 'mp3' ? (
                    <Check className="w-4 h-4 shrink-0" />
                  ) : isMp3Unlocked ? (
                    <Unlock className="w-4 h-4 shrink-0" />
                  ) : (
                    <Music className="w-4 h-4 shrink-0" />
                  )}
                  <span className="truncate">
                    {startedKey === 'mp3'
                      ? 'Mengunduh MP3...'
                      : isMp3Unlocked
                        ? 'Simpan MP3 (Reward Terbuka)'
                        : 'Unduh MP3'}
                  </span>
                </button>
              )}

              <div className="bg-indigo-950/65 border border-white/10 rounded-lg px-3.5 py-2 flex items-center justify-between gap-3 text-xs text-white/90 tabular-nums">
                <div className="flex items-center gap-4">
                  <span className="inline-flex items-center gap-1.5">
                    <ThumbsUp className="w-3.5 h-3.5 text-sky-300" />
                    {formatCompactNumber(video.stats.diggCount)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-sky-300" />
                    {formatCompactNumber(video.stats.commentCount)}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Share2 className="w-3.5 h-3.5 text-sky-300" />
                    {formatCompactNumber(video.stats.shareCount)}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={onReset}
                  className="inline-flex items-center gap-1 font-semibold text-sky-300 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  Lainnya
                </button>
              </div>
            </div>
          </div>

          {hasImages && (
            <div className="mt-6 pt-5 border-t border-white/15">
              <div className="flex items-center justify-between gap-4 mb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-sky-300" />
                  Slide Foto TikTok ({video.images.length} Gambar)
                </h3>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {video.images.map((imgUrl, index) => {
                  const slideKey = `slide_${index}`;
                  const isSlideUnlocked = Boolean(
                    unlockedKeys[`${video.id}:${slideKey}`]
                  );
                  return (
                    <div
                      key={`${imgUrl}-${index}`}
                      className="rounded-xl border border-white/15 overflow-hidden bg-slate-900/70 flex flex-col"
                    >
                      <div className="aspect-[3/4] bg-slate-900 overflow-hidden">
                        <img
                          src={proxyImageUrl(imgUrl)}
                          alt={`Slide ${index + 1}`}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          handleActionClick(
                            slideKey,
                            `Slide Foto ${index + 1} (JPG)`,
                            buildDownloadHref(
                              imgUrl,
                              `slide_${index + 1}`,
                              'jpg'
                            ),
                            `${baseFilename}_slide_${index + 1}.jpg`
                          )
                        }
                        className="px-3 py-2.5 text-xs font-semibold text-center bg-sky-400 hover:bg-sky-300 text-slate-950 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {isSlideUnlocked ? (
                          <Unlock className="w-3.5 h-3.5" />
                        ) : (
                          <Download className="w-3.5 h-3.5" />
                        )}
                        {isSlideUnlocked
                          ? `Simpan Foto ${index + 1}`
                          : `Unduh Foto ${index + 1}`}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
