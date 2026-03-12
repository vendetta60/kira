import { CreditCard as Edit2, Trash2, Search, Filter } from 'lucide-react';
import { useMemo, useState } from 'react';
import type { Document } from '../lib/database.types';
import { DateInput } from './DateInput';

interface DocumentTableProps {
  documents: Document[];
  onEdit: (document: Document) => void;
  onDelete: (id: number) => void;
  priorityIds: number[];
  onTogglePriority: (id: number) => void;
}

export function DocumentTable({
  documents,
  onEdit,
  onDelete,
  priorityIds,
  onTogglePriority,
}: DocumentTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [controlFilter, setControlFilter] = useState<'all' | 'only' | 'none'>('all');
  const [rankFilter, setRankFilter] = useState<string>('all');
  const [missingFilter, setMissingFilter] = useState<string[]>([]);
  const [showMissingMenu, setShowMissingMenu] = useState(false);
  const [protocolNoFilter, setProtocolNoFilter] = useState('');
  const [protocolFrom, setProtocolFrom] = useState('');
  const [protocolTo, setProtocolTo] = useState('');
  const [raportNoFilter, setRaportNoFilter] = useState('');
  const [raportFrom, setRaportFrom] = useState('');
  const [raportTo, setRaportTo] = useState('');

  const ranks = useMemo(
    () =>
      Array.from(
        new Set(
          documents
            .map((d) => d.rutbe || '')
            .filter((x) => x && x.trim().length > 0),
        ),
      ).sort(),
    [documents],
  );

  const lower = searchTerm.toLowerCase();

  const missingOptions = [
    { key: 'kiraya_muqavilesi', label: 'Kirayə müqaviləsi' },
    { key: 'daginmaz_emlak_arayisi_check', label: 'Daşınmaz əmlak arayışı' },
    {
      key: 'daginmaz_emlak_arayisi_avadl_check',
      label: 'Daşınmaz əmlak arayışı (arvadı və ya əri)',
    },
    { key: 'nigah_haqqinda_sehadename_check', label: 'Nigah haqqında şəhadətnamə' },
    { key: 'menzil_attestat', label: 'Mənzil attestatı' },
    { key: 'qrafeden_18ci_cixarig_check', label: '18-ci qrafədən çıxarış' },
    { key: 'sexsiyyet_vezigesinin_surati_check', label: 'Şəxsiyyət vəsiqəsinin surəti' },
    {
      key: 'sexsiyyet_vezigesinin_surati_avadl_check',
      label: 'Şəxsiyyət vəsiqəsinin surəti (yoldaş)',
    },
  ] as const;

  const filteredDocuments = documents
    .filter((doc) => {
      if (!lower) return true;
      const fields = [
        doc.soyad_ad_ata,
        doc.unvan_sahibi ?? '',
        doc.rutbe ?? '',
        doc.protokol_no ?? '',
        doc.il ?? '',
        doc.ay ?? '',
        doc.odelik ?? '',
        doc.senedleri_qebul_eden ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return fields.includes(lower);
    })
    .filter((doc) => {
      const isPriority = priorityIds.includes(doc.id);
      if (controlFilter === 'only') return isPriority;
      if (controlFilter === 'none') return !isPriority;
      return true;
    })
    .filter((doc) => {
      if (rankFilter === 'all') return true;
      return (doc.rutbe || '') === rankFilter;
    })
    .filter((doc) => {
      if (missingFilter.length === 0) return true;
      // Çatışmayan sənədlər: seçilmiş hər bir açar üçün müvafiq sahə true olmalıdır
      return missingFilter.every((key) => !!(doc as any)[key]);
    })
    .filter((doc) => {
      // Protokol nömrəsi filteri
      if (protocolNoFilter.trim()) {
        const value = (doc.protokol_no || '').toString().toLowerCase();
        if (!value.includes(protocolNoFilter.trim().toLowerCase())) return false;
      }
      // Protokol tarix aralığı
      if (protocolFrom || protocolTo) {
        if (!doc.protokol_tarixi) return false;
        const d = new Date(doc.protokol_tarixi as any);
        if (protocolFrom) {
          const from = new Date(protocolFrom);
          if (d < from) return false;
        }
        if (protocolTo) {
          const to = new Date(protocolTo);
          // gün sonuna qədər daxil etmək üçün
          to.setHours(23, 59, 59, 999);
          if (d > to) return false;
        }
      }
      // Raportun daxil olma nömrəsi filteri
      if (raportNoFilter.trim()) {
        const value = (doc.report_senedlerin_ucot_no || '').toString().toLowerCase();
        if (!value.includes(raportNoFilter.trim().toLowerCase())) return false;
      }
      // Raport tarix aralığı
      if (raportFrom || raportTo) {
        if (!doc.report_senedlerin_ucot_tarixi) return false;
        const d = new Date(doc.report_senedlerin_ucot_tarixi as any);
        if (raportFrom) {
          const from = new Date(raportFrom);
          if (d < from) return false;
        }
        if (raportTo) {
          const to = new Date(raportTo);
          to.setHours(23, 59, 59, 999);
          if (d > to) return false;
        }
      }
      return true;
    })
    .slice()
    // Sıra pozulmasın deyə yalnız id-ə görə azalan sort
    .sort((a, b) => b.id - a.id);

  const formatDate = (date: string | null) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('az-AZ');
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200 flex flex-col gap-3">
        <div className="relative md:w-1/2">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Sənəd axtar..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
          />
        </div>
        <div className="flex flex-wrap gap-2 items-center text-xs md:justify-between">
          <span className="inline-flex items-center gap-1 text-gray-500">
            <Filter className="w-3 h-3" />
            Filtrlər:
          </span>
          <select
            value={controlFilter}
            onChange={(e) => setControlFilter(e.target.value as any)}
            className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white"
          >
            <option value="all">Hamısı</option>
            <option value="only">Yalnız nəzarətdə olanlar</option>
            <option value="none">Yalnız nəzarətdə olmayanlar</option>
          </select>
          <select
            value={rankFilter}
            onChange={(e) => setRankFilter(e.target.value)}
            className="px-2 py-1 border border-gray-300 rounded-md text-xs bg-white"
          >
            <option value="all">Bütün rütbələr</option>
            {ranks.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowMissingMenu((v) => !v)}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs hover:bg-gray-50"
            >
              Çatışmayan sənədlər
            </button>
            {showMissingMenu && (
              <div className="absolute right-0 mt-1 w-60 bg-white border border-gray-200 rounded-md shadow-lg p-2 z-20">
                <div className="max-h-56 overflow-y-auto space-y-1">
                  {missingOptions.map((opt) => {
                    const checked = missingFilter.includes(opt.key);
                    return (
                      <label
                        key={opt.key}
                        className="flex items-center gap-2 text-[11px] text-gray-700 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => {
                            const next = e.target.checked
                              ? [...missingFilter, opt.key]
                              : missingFilter.filter((k) => k !== opt.key);
                            setMissingFilter(next);
                          }}
                          className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <span>{opt.label}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2 text-xs">
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-600">Protokol №</span>
            <input
              type="text"
              value={protocolNoFilter}
              onChange={(e) => setProtocolNoFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-600">Protokol tarixi (dən)</span>
            <DateInput
              value={protocolFrom}
              onChange={setProtocolFrom}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-600">Protokol tarixi (dək)</span>
            <DateInput
              value={protocolTo}
              onChange={setProtocolTo}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-600">Raportun daxil olma №</span>
            <input
              type="text"
              value={raportNoFilter}
              onChange={(e) => setRaportNoFilter(e.target.value)}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-600">Raport tarixi (dən)</span>
            <DateInput
              value={raportFrom}
              onChange={setRaportFrom}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs"
            />
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[11px] text-gray-600">Raport tarixi (dək)</span>
            <DateInput
              value={raportTo}
              onChange={setRaportTo}
              className="px-2 py-1 border border-gray-300 rounded-md bg-white text-xs"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                №
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Nəzarətdədir
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider min-w-[200px]">
                Soyad, ad və atasının adı
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ünvan sahibi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Protokol №
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Protokol tarixi
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                İl
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Ay
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Qəbul edən
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                Əməliyyatlar
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredDocuments.length === 0 ? (
              <tr>
                <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                  Sənəd tapılmadı
                </td>
              </tr>
            ) : (
              filteredDocuments.map((doc, index) => {
                const isPriority = priorityIds.includes(doc.id);
                return (
                  <tr
                    key={doc.id}
                    className={`hover:bg-gray-50 transition-colors ${
                      isPriority ? 'bg-amber-50' : ''
                    }`}
                  >
                    <td className="px-4 py-3 text-sm text-gray-900">{index + 1}</td>
                    <td className="px-4 py-3 text-sm text-gray-900">
                      <input
                        type="checkbox"
                        checked={isPriority}
                        onChange={() => onTogglePriority(doc.id)}
                        className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
                      />
                    </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {doc.soyad_ad_ata || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{doc.unvan_sahibi || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{doc.protokol_no || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {formatDate(doc.protokol_tarixi)}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">{doc.il || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{doc.ay || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {doc.senedleri_qebul_eden || '-'}
                  </td>
                  <td className="px-4 py-3 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => onEdit(doc)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Redaktə et"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm('Bu sənədi silmək istədiyinizdən əminsiniz?')) {
                            onDelete(doc.id);
                          }
                        }}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {filteredDocuments.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Cəmi: <span className="font-semibold">{filteredDocuments.length}</span> sənəd
          </p>
        </div>
      )}
    </div>
  );
}
