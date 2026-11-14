export type DownloaderMode = 'video' | 'mp3' | 'slide';

export interface TikTokVideoData {
  id: string;
  title: string;
  cover: string;
  duration: number;
  author: {
    uniqueId: string;
    nickname: string;
    avatar: string;
  };
  stats: {
    playCount: number;
    diggCount: number;
    commentCount: number;
    shareCount: number;
  };
  music: {
    title: string;
    author: string;
    playUrl: string;
  };
  video: {
    noWatermark: string;
    hd: string;
    watermark: string;
    size: number;
    hdSize: number;
  };
  images: string[];
}

export interface DownloadHistoryItem {
  id: string;
  url: string;
  title: string;
  authorHandle: string;
  cover: string;
  savedAt: string;
}
