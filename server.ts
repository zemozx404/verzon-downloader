import express from 'express';
import { Readable } from 'node:stream';
import { createServer as createViteServer } from 'vite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === 'production';

const TIKTOK_URL_PATTERN =
  /^https?:\/\/((?:www\.|m\.|vt\.|vm\.)?tiktok\.com)\/.+/i;

const PRIVATE_HOST_PATTERN =
  /^(localhost|127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|0\.0\.0\.0|::1|\[::1\])/i;

function isSafeExternalUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') {
      return false;
    }
    if (PRIVATE_HOST_PATTERN.test(parsed.hostname)) {
      return false;
    }
    return true;
  } catch {
    return false;
  }
}

function resolveTikwmAsset(url?: string): string {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://www.tikwm.com${url.startsWith('/') ? '' : '/'}${url}`;
}

interface TikwmVideoPayload {
  id?: string;
  title?: string;
  cover?: string;
  origin_cover?: string;
  duration?: number;
  play?: string;
  hdplay?: string;
  wmplay?: string;
  size?: number;
  hd_size?: number;
  music?: string;
  music_info?: {
    title?: string;
    author?: string;
    play?: string;
  };
  play_count?: number;
  digg_count?: number;
  comment_count?: number;
  share_count?: number;
  author?: {
    unique_id?: string;
    nickname?: string;
    avatar?: string;
  };
  images?: string[];
}

function normalizeTikwmData(d: TikwmVideoPayload) {
  return {
    id: d.id || String(Date.now()),
    title: d.title || 'Video TikTok Tanpa Judul',
    cover: resolveTikwmAsset(d.cover || d.origin_cover),
    duration: Number(d.duration) || 0,
    author: {
      uniqueId: d.author?.unique_id || 'pengguna_tiktok',
      nickname: d.author?.nickname || 'Kreator TikTok',
      avatar: resolveTikwmAsset(d.author?.avatar),
    },
    stats: {
      playCount: Number(d.play_count) || 0,
      diggCount: Number(d.digg_count) || 0,
      commentCount: Number(d.comment_count) || 0,
      shareCount: Number(d.share_count) || 0,
    },
    music: {
      title: d.music_info?.title || 'Audio Asli TikTok',
      author: d.music_info?.author || d.author?.nickname || 'TikTok Sound',
      playUrl: resolveTikwmAsset(d.music || d.music_info?.play),
    },
    video: {
      noWatermark: resolveTikwmAsset(d.play),
      hd: resolveTikwmAsset(d.hdplay || d.play),
      watermark: resolveTikwmAsset(d.wmplay),
      size: Number(d.size) || 0,
      hdSize: Number(d.hd_size) || 0,
    },
    images: Array.isArray(d.images)
      ? d.images.map((img) => resolveTikwmAsset(img)).filter(Boolean)
      : [],
  };
}

async function startServer() {
  const app = express();
  app.use(express.json());

  app.get('/ad-slot', (req, res) => {
    const variant = req.query.variant === 'leaderboard' ? 'leaderboard' : 'rectangle';
    const adConfig =
      variant === 'leaderboard'
        ? {
            key: 'f499ca57b48e1b1f25dcfa51c742777f',
            width: 728,
            height: 90,
            src: 'https://bancadeltempoidea.org/22/f499ca57b48e1b1f25dcfa51c742777f',
          }
        : {
            key: 'b5815a366a899a3a9e1826e2140efe28',
            width: 300,
            height: 250,
            src: 'https://bancadeltempoidea.org/22/b5815a366a899a3a9e1826e2140efe28',
          };

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.send(`<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <style>
      html, body {
        margin: 0;
        padding: 0;
        width: ${adConfig.width}px;
        height: ${adConfig.height}px;
        overflow: hidden;
        background: transparent;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    </style>
  </head>
  <body>
    <script>
      atOptions = {
        'key' : '${adConfig.key}',
        'format' : 'iframe',
        'height' : ${adConfig.height},
        'width' : ${adConfig.width},
        'params' : {}
      };
    </script>
    <script src="${adConfig.src}"></script>
  </body>
</html>`);
  });

  app.post('/api/tiktok', async (req, res) => {
    const rawUrl = typeof req.body?.url === 'string' ? req.body.url.trim() : '';

    if (!rawUrl || !TIKTOK_URL_PATTERN.test(rawUrl)) {
      res.status(400).json({
        error:
          'Tautan TikTok tidak valid. Pastikan Anda menempelkan URL dari tiktok.com atau vt.tiktok.com.',
      });
      return;
    }

    try {
      const formBody = new URLSearchParams({
        url: rawUrl,
        count: '12',
        cursor: '0',
        web: '1',
        hd: '1',
      });

      const response = await fetch('https://www.tikwm.com/api/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          Accept: 'application/json, text/javascript, */*; q=0.01',
          Referer: 'https://www.tikwm.com/',
        },
        body: formBody.toString(),
      });

      if (!response.ok) {
        res.status(502).json({
          error: 'Server pemrosesan sedang sibuk. Silakan coba beberapa saat lagi.',
        });
        return;
      }

      const payload = (await response.json()) as {
        code?: number;
        msg?: string;
        data?: TikwmVideoPayload;
      };

      if (payload.code !== 0 || !payload.data) {
        res.status(404).json({
          error:
            payload.msg ||
            'Video tidak ditemukan atau bersifat privat. Pastikan tautan video publik.',
        });
        return;
      }

      res.json({ data: normalizeTikwmData(payload.data) });
    } catch {
      res.status(502).json({
        error:
          'Gagal terhubung ke layanan pengambil video TikTok. Periksa koneksi atau coba lagi.',
      });
    }
  });

  app.get('/api/tiktok/sample', async (_req, res) => {
    try {
      const response = await fetch(
        'https://www.tikwm.com/api/feed/list?region=ID&count=3',
        {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
            Accept: 'application/json',
          },
        }
      );

      if (!response.ok) {
        res.status(502).json({
          error: 'Tidak dapat mengambil tautan contoh saat ini.',
        });
        return;
      }

      const payload = (await response.json()) as {
        code?: number;
        data?: Array<
          TikwmVideoPayload & {
            video_id?: string;
            author?: { unique_id?: string };
          }
        >;
      };

      const first = payload.data?.[0];
      if (!first) {
        res.status(404).json({
          error: 'Belum ada tautan contoh tersedia saat ini.',
        });
        return;
      }

      const uniqueId = first.author?.unique_id || 'tiktok';
      const videoId = first.video_id || first.id;
      const sampleUrl = `https://www.tiktok.com/@${uniqueId}/video/${videoId}`;

      res.json({
        url: sampleUrl,
        data: normalizeTikwmData(first),
      });
    } catch {
      res.status(502).json({
        error: 'Gagal mengambil tautan contoh dari jaringan.',
      });
    }
  });

  app.get('/api/download', async (req, res) => {
    const mediaUrl =
      typeof req.query.url === 'string' ? req.query.url.trim() : '';
    const rawName =
      typeof req.query.filename === 'string'
        ? req.query.filename.trim()
        : 'ssstik-media';
    const mediaType =
      typeof req.query.type === 'string' ? req.query.type.trim() : 'mp4';

    if (!mediaUrl || !isSafeExternalUrl(mediaUrl)) {
      res.status(400).json({ error: 'URL unduhan tidak valid.' });
      return;
    }

    const sanitizedName = rawName
      .replace(/[^a-zA-Z0-9_-]+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 64) || 'verzon_download';

    const ext = mediaType === 'mp3' ? 'mp3' : mediaType === 'jpg' ? 'jpg' : 'mp4';
    const contentType =
      ext === 'mp3'
        ? 'audio/mpeg'
        : ext === 'jpg'
          ? 'image/jpeg'
          : 'video/mp4';

    try {
      const upstream = await fetch(mediaUrl, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          Referer: 'https://www.tikwm.com/',
        },
      });

      if (!upstream.ok || !upstream.body) {
        res.redirect(mediaUrl);
        return;
      }

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${sanitizedName}.${ext}"`
      );
      res.setHeader(
        'Content-Type',
        upstream.headers.get('content-type') || contentType
      );
      const len = upstream.headers.get('content-length');
      if (len) {
        res.setHeader('Content-Length', len);
      }

      const nodeStream = Readable.fromWeb(
        upstream.body as unknown as import('node:stream/web').ReadableStream
      );
      nodeStream.pipe(res);
    } catch {
      res.redirect(mediaUrl);
    }
  });

  app.get('/api/image', async (req, res) => {
    const imageUrl =
      typeof req.query.url === 'string' ? req.query.url.trim() : '';

    if (!imageUrl || !isSafeExternalUrl(imageUrl)) {
      res.status(400).send('Invalid image URL');
      return;
    }

    const referers = ['https://www.tiktok.com/', 'https://www.tikwm.com/', ''];

    try {
      let upstream: Response | null = null;
      for (const ref of referers) {
        const headers: Record<string, string> = {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
          Accept: 'image/avif,image/webp,image/apng,image/*,*/*;q=0.8',
        };
        if (ref) headers.Referer = ref;

        const attempt = await fetch(imageUrl, { headers });
        if (attempt.ok && attempt.body) {
          upstream = attempt;
          break;
        }
      }

      if (!upstream || !upstream.body) {
        res.status(502).send('Failed to fetch image');
        return;
      }

      res.setHeader(
        'Content-Type',
        upstream.headers.get('content-type') || 'image/jpeg'
      );
      res.setHeader('Cache-Control', 'public, max-age=3600');

      const nodeStream = Readable.fromWeb(
        upstream.body as unknown as import('node:stream/web').ReadableStream
      );
      nodeStream.pipe(res);
    } catch {
      res.status(502).send('Image proxy error');
    }
  });

  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`SSSTik ID server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
