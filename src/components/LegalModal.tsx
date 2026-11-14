import { X } from 'lucide-react';

export type LegalModalType = 'privacy' | 'terms' | 'contact' | null;

interface LegalModalProps {
  type: LegalModalType;
  onClose: () => void;
}

const MODAL_CONTENT: Record<
  Exclude<LegalModalType, null>,
  { title: string; paragraphs: string[] }
> = {
  privacy: {
    title: 'Kebijakan Privasi',
    paragraphs: [
      'Verzon Downloader menghargai privasi setiap pengunjung. Kami tidak mewajibkan pendaftaran akun dan tidak mengumpulkan data pribadi sensitif saat Anda mengunduh video atau audio TikTok.',
      'Tautan video yang Anda tempel hanya diproses sementara untuk mengambil tautan unduhan langsung. Riwayat unduhan hanya tersimpan di penyimpanan lokal peramban Anda dan dapat dihapus kapan saja.',
      'Situs ini menampilkan iklan pihak ketiga yang mungkin menggunakan cookie standar peramban untuk menayangkan iklan yang relevan.',
    ],
  },
  terms: {
    title: 'Ketentuan Layanan',
    paragraphs: [
      'Layanan Verzon Downloader ditujukan hanya untuk penggunaan pribadi dan non-komersial. Hak cipta seluruh konten video, gambar, dan musik tetap dimiliki sepenuhnya oleh kreator asli di TikTok.',
      'Pengguna bertanggung jawab penuh untuk menghormati hak kekayaan intelektual dan tidak mengunggah ulang konten milik orang lain tanpa izin pemilik hak cipta.',
      'Verzon Downloader tidak berafiliasi dengan, disponsori oleh, atau didukung oleh TikTok maupun ByteDance Ltd.',
    ],
  },
  contact: {
    title: 'Hubungi Kami',
    paragraphs: [
      'Apabila Anda menemukan kendala teknis saat mengunduh video, tautan rusak, atau memiliki pertanyaan terkait hak cipta (DMCA), silakan hubungi tim pengelola kami.',
      'Email dukungan: support@verzon-downloader.example — Kami meninjau laporan yang masuk dalam 1–2 hari kerja.',
    ],
  },
};

export function LegalModal({ type, onClose }: LegalModalProps) {
  if (!type) return null;
  const content = MODAL_CONTENT[type];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/45 backdrop-blur-[2px]"
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
    >
      <div className="absolute inset-0" onClick={onClose} aria-hidden="true" />
      <div className="relative z-10 w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-6 shadow-xl">
        <div className="flex items-center justify-between gap-4 pb-4 border-b border-slate-200 mb-4">
          <h2 className="text-lg font-bold text-slate-950">{content.title}</h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup jendela"
            className="p-2 text-slate-500 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="space-y-3 text-sm text-slate-600 leading-relaxed">
          {content.paragraphs.map((text, idx) => (
            <p key={idx}>{text}</p>
          ))}
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
