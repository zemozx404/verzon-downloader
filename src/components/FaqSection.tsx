import { ChevronDown } from 'lucide-react';
import { useState } from 'react';

interface FaqItem {
  question: string;
  answer: string;
}

const FAQ_ITEMS: FaqItem[] = [
  {
    question: 'Apakah saya harus membayar untuk mengunduh video TikTok di Verzon Downloader?',
    answer:
      'Tidak. Layanan pengunduh video TikTok kami sepenuhnya gratis dan dapat digunakan tanpa batas jumlah unduhan setiap hari. Anda tidak perlu mendaftar akun atau memasang ekstensi tambahan.',
  },
  {
    question: 'Apakah video yang diunduh benar-benar bebas watermark?',
    answer:
      'Ya. Ketika Anda memilih tombol Unduh Tanpa Watermark (MP4) atau Kualitas HD, sistem kami mengambil berkas video bersih tanpa logo TikTok maupun nama pengguna yang melayang.',
  },
  {
    question: 'Bagaimana cara mengunduh video TikTok di iPhone atau iPad (iOS)?',
    answer:
      'Untuk pengguna iPhone/iPad dengan iOS 13 ke atas, buka Verzon Downloader melalui peramban Safari, tempel tautan video TikTok, lalu tekan tombol Unduh. Setelah berkas selesai diunduh, ketuk ikon panah unduhan di pojok kanan atas atau bawah Safari dan pilih Simpan ke File atau Simpan Video.',
  },
  {
    question: 'Di mana file video MP4 atau audio MP3 tersimpan setelah diunduh?',
    answer:
      'Pada perangkat Android, Windows, dan Mac, berkas akan otomatis masuk ke folder Unduhan (Downloads) bawaan perangkat atau peramban Anda. Anda dapat memutarnya langsung lewat galeri maupun pemutar media.',
  },
  {
    question: 'Bisakah saya mengunduh lagu atau suara TikTok dalam format MP3 saja?',
    answer:
      'Bisa. Pilih tab TikTok MP3 di bagian atas atau tekan tombol Unduh Audio MP3 pada kartu hasil setelah menempelkan tautan video TikTok yang diinginkan.',
  },
  {
    question: 'Apakah Verzon Downloader menyimpan salinan video atau riwayat pribadi saya di server?',
    answer:
      'Tidak. Kami tidak menyimpan video di server kami. Riwayat unduhan hanya disimpan secara lokal di peramban perangkat Anda (localStorage) agar mudah diakses kembali dan bisa dihapus kapan saja.',
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="max-w-4xl mx-auto px-4 sm:px-6 py-16">
      <div className="mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-950 mb-2">
          Pertanyaan yang Sering Diajukan
        </h2>
        <p className="text-slate-600 text-sm sm:text-base">
          Informasi lengkap seputar cara menyimpan video TikTok tanpa tanda air dan audio MP3.
        </p>
      </div>

      <div className="divide-y divide-slate-200 border border-slate-200 rounded-2xl bg-white overflow-hidden">
        {FAQ_ITEMS.map((item, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div key={item.question}>
              <button
                type="button"
                aria-expanded={isOpen}
                onClick={() => setOpenIndex(isOpen ? null : idx)}
                className="w-full px-5 sm:px-6 py-4.5 text-left flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors cursor-pointer"
              >
                <span className="font-semibold text-sm sm:text-base text-slate-900">
                  {item.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-slate-500 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-indigo-600' : ''
                  }`}
                />
              </button>
              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 pt-0.5 text-sm sm:text-base text-slate-600 leading-relaxed">
                  {item.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
