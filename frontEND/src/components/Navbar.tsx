import { Plus } from 'lucide-react';

const smallLogo = new URL(
  '../../Gemini_Generated_Image_kcoxkrkcoxkrkcox-Photoroom.png',
  import.meta.url,
).href;

interface NavbarProps {
  onNewDocument: () => void;
}

export function Navbar({ onNewDocument }: NavbarProps) {
  return (
    <nav className="bg-white border-b border-slate-200 px-6 py-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={smallLogo}
            alt="Kirayə müqavilələri loqosu"
            className="w-9 h-9 rounded-full border border-slate-200 shadow-sm object-contain bg-white"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sənədlərin Qeydiyyatı</h1>
            <p className="text-sm text-gray-500">Sənədlərin idarə edilməsi sistemi</p>
          </div>
        </div>
        <button
          onClick={onNewDocument}
          className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-2.5 rounded-xl font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/40 hover:from-emerald-500 hover:to-teal-500 transition-all duration-200 border border-emerald-500/30"
        >
          <Plus className="w-5 h-5" strokeWidth={2.5} />
          Yeni Sənəd
        </button>
      </div>
    </nav>
  );
}
