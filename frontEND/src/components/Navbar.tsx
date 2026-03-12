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
    <nav className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={smallLogo}
            alt="Kirayə müqavilələri loqosu"
            className="w-9 h-9 rounded-full border border-blue-100 shadow-sm object-contain bg-white"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900">Sənədlərin Qeydiyyatı</h1>
            <p className="text-sm text-gray-500">Sənədlərin idarə edilməsi sistemi</p>
          </div>
        </div>
        <button
          onClick={onNewDocument}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Yeni Sənəd
        </button>
      </div>
    </nav>
  );
}
