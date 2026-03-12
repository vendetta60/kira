import { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import type { Document } from '../lib/database.types';
import type { Rank, Section, DocumentReceiver } from '../lib/documentsApi';
import { DateInput } from './DateInput';
import { ChildrenModal, type ChildRow } from './ChildrenModal';
import { ProtocolModal, type ProtocolData } from './ProtocolModal';

interface Lookups {
  ranks: Rank[];
  sections: Section[];
  receivers: DocumentReceiver[];
}

interface DocumentFormProps {
  document?: Document | null;
  isPriority?: boolean;
  onClose: () => void;
  onSave: (data: any) => Promise<void>;
  lookups: Lookups;
}

export function DocumentForm({
  document,
  isPriority = false,
  onClose,
  onSave,
  lookups,
}: DocumentFormProps) {
  const [formData, setFormData] = useState({
    rutbe: '',
    soyad_ad_ata: '',
    unvan_sahibi: '',
    harbi_rutbe: '',
    odelik: '',
    protokol_no: '',
    protokol_tarixi: '',
    // Müraciət / müşayiət
    report_senedlerin_ucot_no: '',
    report_senedlerin_ucot_tarixi: '',
    report_senedlerin_ucot_no2: '',
    report_senedlerin_tarixi: '',
    // Müqavilə tarixi və bitmə tarixi (kirayə müqaviləsi üçün)
    kiraya_muqavilesi_tarixi: '',
    kiraya_muqavilesi_bitme_tarixi: '',
    // Bələdiyyə və ipoteka üçün nömrələr
    belediyye_arayisi: '',
    ipoteka_kredit_zemaneti: '',
    // Protokol və kirayə əmri üçün əlavə sahələr
    protokol_nomresi: '',
    protokol_tarixi_2: '',
    kiraya_anirlarin_nomresi: '',
    kiraya_anirlarin_tarixi: '',
    il: '',
    ay: 'mart',
    calismayan_senedler: 'Seçilməyib',
    huquqi_raportlar: false,
    husayyet_mektublar: false,
    kiraya_muqavilesi: false,
    menzil_attestat: false,
    belediyye_arayislari: false,
    ipoteka_kredit: false,
    protokol: false,
    kiraya_aniri: false,
    senedleri_qebul_eden: '',
    senedleri_qebul_tarixi: '',
    eli_vaziyyet: 'Ev',
    qeyd: '',
    daginmaz_emlak_arayisi_check: false,
    daginmaz_emlak_arayisi_avadl_check: false,
    nigah_haqqinda_sehadename_check: false,
    qrafeden_18ci_cixarig_check: false,
    sexsiyyet_vezigesinin_surati_check: false,
    sexsiyyet_vezigesinin_surati_avadl_check: false,
    highlight: isPriority,
  });

  const [saving, setSaving] = useState(false);
  const [childrenOpen, setChildrenOpen] = useState(false);
  const [children, setChildren] = useState<ChildRow[]>([]);
  const [protocolOpen, setProtocolOpen] = useState(false);
  const [protocol, setProtocol] = useState<ProtocolData | null>(null);

  useEffect(() => {
    if (document) {
      setFormData({
        rutbe: document.rutbe,
        soyad_ad_ata: document.soyad_ad_ata,
        unvan_sahibi: document.unvan_sahibi,
        harbi_rutbe: document.harbi_rutbe,
        odelik: document.odelik,
        protokol_no: document.protokol_no,
        protokol_tarixi: document.protokol_tarixi || '',
        report_senedlerin_ucot_no: document.report_senedlerin_ucot_no || '',
        report_senedlerin_ucot_tarixi: document.report_senedlerin_ucot_tarixi || '',
        report_senedlerin_ucot_no2: document.report_senedlerin_ucot_no2 || '',
        report_senedlerin_tarixi: document.report_senedlerin_tarixi || '',
        kiraya_muqavilesi_tarixi: document.kiraya_muqavilesi_tarixi || '',
        kiraya_muqavilesi_bitme_tarixi: document.kiraya_muqavilesi_bitme_tarixi || '',
        belediyye_arayisi: document.belediyye_arayisi || '',
        ipoteka_kredit_zemaneti: document.ipoteka_kredit_zemaneti || '',
        protokol_nomresi: document.protokol_nomresi || '',
        protokol_tarixi_2: document.protokol_tarixi_2 || '',
        kiraya_anirlarin_nomresi: document.kiraya_anirlarin_nomresi || '',
        kiraya_anirlarin_tarixi: document.kiraya_anirlarin_tarixi || '',
        il: document.il || '',
        ay: document.ay,
        calismayan_senedler: document.calismayan_senedler,
        huquqi_raportlar: document.huquqi_raportlar,
        husayyet_mektublar: document.husayyet_mektublar,
        kiraya_muqavilesi: document.kiraya_muqavilesi,
        menzil_attestat: document.menzil_attestat,
        belediyye_arayislari: document.belediyye_arayislari,
        ipoteka_kredit: document.ipoteka_kredit,
        protokol: document.protokol,
        kiraya_aniri: document.kiraya_aniri,
        senedleri_qebul_eden: document.senedleri_qebul_eden,
        senedleri_qebul_tarixi: document.senedleri_qebul_tarixi || '',
        eli_vaziyyet: document.eli_vaziyyet,
        qeyd: document.qeyd,
        daginmaz_emlak_arayisi_check: document.daginmaz_emlak_arayisi_check,
        daginmaz_emlak_arayisi_avadl_check: document.daginmaz_emlak_arayisi_avadl_check,
        nigah_haqqinda_sehadename_check: document.nigah_haqqinda_sehadename_check,
        qrafeden_18ci_cixarig_check: document.qrafeden_18ci_cixarig_check,
        sexsiyyet_vezigesinin_surati_check: document.sexsiyyet_vezigesinin_surati_check,
        sexsiyyet_vezigesinin_surati_avadl_check: document.sexsiyyet_vezigesinin_surati_avadl_check,
        highlight: isPriority,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        highlight: isPriority,
      }));
    }
  }, [document, isPriority]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave({ ...formData, children, protocol });
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-3 py-2.5 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">
            {document ? 'Sənədi Redaktə Et' : 'Yeni Sənəd Əlavə Et'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Rütbəsi
              </label>
              <select
                value={formData.rutbe}
                onChange={(e) => setFormData({ ...formData, rutbe: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seçin</option>
                {lookups.ranks.map((r) => (
                  <option key={r.id} value={r.rank}>
                    {r.rank}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Soyad, ad və atasının adı
              </label>
              <input
                type="text"
                value={formData.soyad_ad_ata}
                onChange={(e) => setFormData({ ...formData, soyad_ad_ata: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Ünvan sahibi
              </label>
              <select
                value={formData.unvan_sahibi}
                onChange={(e) => setFormData({ ...formData, unvan_sahibi: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seçin</option>
                {lookups.sections.map((s) => (
                  <option key={s.id} value={s.section || ''}>
                    {s.section}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Ödəlik
              </label>
              <input
                type="text"
                value={formData.odelik}
                onChange={(e) => setFormData({ ...formData, odelik: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            {/* Müraciət uçot nömrəsi və tarixi */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.has_raport}
                  onChange={(e) =>
                    setFormData({ ...formData, has_raport: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[11px] font-medium text-gray-700">Müraciət uçot nömrəsi</span>
              </label>
              <input
                type="text"
                placeholder="Nömrəsi"
                value={formData.report_senedlerin_ucot_no}
                onChange={(e) =>
                  setFormData({ ...formData, report_senedlerin_ucot_no: e.target.value })
                }
                disabled={!formData.has_raport}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              />
              <DateInput
                value={formData.report_senedlerin_ucot_tarixi}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    report_senedlerin_ucot_tarixi: v,
                  })
                }
                disabled={!formData.has_raport}
              />
            </div>

            {/* Müşayiət məktubu nömrəsi və tarixi */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.has_cover_letter}
                  onChange={(e) =>
                    setFormData({ ...formData, has_cover_letter: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[11px] font-medium text-gray-700">Müşayiət məktubu</span>
              </label>
              <input
                type="text"
                placeholder="Nömrəsi"
                value={formData.report_senedlerin_ucot_no2}
                onChange={(e) =>
                  setFormData({ ...formData, report_senedlerin_ucot_no2: e.target.value })
                }
                disabled={!formData.has_cover_letter}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              />
              <DateInput
                value={formData.report_senedlerin_tarixi}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    report_senedlerin_tarixi: v,
                  })
                }
                disabled={!formData.has_cover_letter}
              />
            </div>

            {/* Kirayə müqaviləsi: tarix və bitmə tarixi */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.kiraya_muqavilesi}
                  onChange={(e) =>
                    setFormData({ ...formData, kiraya_muqavilesi: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[11px] font-medium text-gray-700">Kirayə müqaviləsi</span>
              </label>
              <DateInput
                value={formData.kiraya_muqavilesi_tarixi}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    kiraya_muqavilesi_tarixi: v,
                  })
                }
                disabled={!formData.kiraya_muqavilesi}
              />
              <DateInput
                value={formData.kiraya_muqavilesi_bitme_tarixi}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    kiraya_muqavilesi_bitme_tarixi: v,
                  })
                }
                disabled={!formData.kiraya_muqavilesi}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Protokol №
              </label>
              <input
                type="text"
                value={formData.protokol_no}
                onChange={(e) => setFormData({ ...formData, protokol_no: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Protokol tarixi
              </label>
              <DateInput
                value={formData.protokol_tarixi}
                onChange={(v) => setFormData({ ...formData, protokol_tarixi: v })}
              />
            </div>

            {/* Bələdiyyə arayışları nömrəsi */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.belediyye_arayislari}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      belediyye_arayislari: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[11px] font-medium text-gray-700">Bələdiyyə arayışları</span>
              </label>
              <input
                type="text"
                placeholder="Nömrəsi"
                value={formData.belediyye_arayisi}
                onChange={(e) =>
                  setFormData({ ...formData, belediyye_arayisi: e.target.value })
                }
                disabled={!formData.belediyye_arayislari}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            {/* İpoteka və Kredit Zəmanət Fondu nömrəsi */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-2 items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.ipoteka_kredit}
                  onChange={(e) =>
                    setFormData({ ...formData, ipoteka_kredit: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[11px] font-medium text-gray-700">
                  İpoteka və Kredit Zəmanət Fondu
                </span>
              </label>
              <input
                type="text"
                placeholder="Nömrəsi"
                value={formData.ipoteka_kredit_zemaneti}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    ipoteka_kredit_zemaneti: e.target.value,
                  })
                }
                disabled={!formData.ipoteka_kredit}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              />
            </div>

            {/* Protokol əlavə sahələri */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.protokol}
                  onChange={(e) =>
                    setFormData({ ...formData, protokol: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[11px] font-medium text-gray-700">PROTOKOL</span>
              </label>
              <input
                type="text"
                placeholder="Protokol nömrəsi"
                value={formData.protokol_nomresi}
                onChange={(e) =>
                  setFormData({ ...formData, protokol_nomresi: e.target.value })
                }
                disabled={!formData.protokol}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              />
              <DateInput
                value={formData.protokol_tarixi_2}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    protokol_tarixi_2: v,
                  })
                }
                disabled={!formData.protokol}
              />
            </div>

            {/* Kirayə əmri */}
            <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.kiraya_aniri}
                  onChange={(e) =>
                    setFormData({ ...formData, kiraya_aniri: e.target.checked })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-[11px] font-medium text-gray-700">Kirayə əmri</span>
              </label>
              <input
                type="text"
                placeholder="Əmr nömrəsi"
                value={formData.kiraya_anirlarin_nomresi}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    kiraya_anirlarin_nomresi: e.target.value,
                  })
                }
                disabled={!formData.kiraya_aniri}
                className="px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:text-gray-400"
              />
              <DateInput
                value={formData.kiraya_anirlarin_tarixi}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    kiraya_anirlarin_tarixi: v,
                  })
                }
                disabled={!formData.kiraya_aniri}
              />
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                İl
              </label>
              <select
                value={formData.il}
                onChange={(e) => setFormData({ ...formData, il: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Bütün illər</option>
                {Array.from({ length: 10 }, (_, i) => 2020 + i).map((year) => (
                  <option key={year}>{year}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Ay
              </label>
              <select
                value={formData.ay}
                onChange={(e) => setFormData({ ...formData, ay: e.target.value })}
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              >
                <option>yanvar</option>
                <option>fevral</option>
                <option>mart</option>
                <option>aprel</option>
                <option>may</option>
                <option>iyun</option>
                <option>iyul</option>
                <option>avqust</option>
                <option>sentyabr</option>
                <option>oktyabr</option>
                <option>noyabr</option>
                <option>dekabr</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Çalışmayan sənədlər
              </label>
              <select
                value={formData.calismayan_senedler}
                onChange={(e) => setFormData({ ...formData, calismayan_senedler: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                <option>Seçilməyib</option>
              </select>
            </div>
          </div>

          <div className="mt-3">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-1.5">Sənəd növləri</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.huquqi_raportlar}
                  onChange={(e) => setFormData({ ...formData, huquqi_raportlar: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Hüquqi raportlar</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.husayyet_mektublar}
                  onChange={(e) => setFormData({ ...formData, husayyet_mektublar: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Hüsayət məktublar</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.kiraya_muqavilesi}
                  onChange={(e) => setFormData({ ...formData, kiraya_muqavilesi: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Kiraya müqaviləsi</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.menzil_attestat}
                  onChange={(e) => setFormData({ ...formData, menzil_attestat: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Mənzil attestat</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.belediyye_arayislari}
                  onChange={(e) => setFormData({ ...formData, belediyye_arayislari: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Bələdiyyə arayışları</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.ipoteka_kredit}
                  onChange={(e) => setFormData({ ...formData, ipoteka_kredit: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">İpoteka və Kredit</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.protokol}
                  onChange={(e) => setFormData({ ...formData, protokol: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Protokol</span>
              </label>

              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.kiraya_aniri}
                  onChange={(e) => setFormData({ ...formData, kiraya_aniri: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Kiraya anırı</span>
              </label>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <h3 className="text-[13px] font-semibold text-gray-900 mb-1.5">Əmlak arayışları</h3>
            <button
              type="button"
              onClick={() => setChildrenOpen(true)}
              className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold bg-amber-500 text-white rounded-md shadow hover:bg-amber-600"
            >
              Övladlar
            </button>
          </div>
          <div className="border border-gray-300 rounded-md max-h-24 overflow-y-auto bg-white">
            <div className="divide-y divide-gray-200">
              {[
                {
                  key: 'daginmaz_emlak_arayisi_check',
                  label: 'Dağınmaz əmlak arayışı',
                },
                {
                  key: 'daginmaz_emlak_arayisi_avadl_check',
                  label: 'Dağınmaz əmlak arayışı (arvadı və ya əri)',
                },
                {
                  key: 'nigah_haqqinda_sehadename_check',
                  label: 'Nigah haqqında şəhadətnamə',
                },
                {
                  key: 'qrafeden_18ci_cixarig_check',
                  label: '18-ci qrafadan çıxarış',
                },
                {
                  key: 'sexsiyyet_vezigesinin_surati_check',
                  label: 'Şəxsiyyət vəsiqəsinin surəti',
                },
                {
                  key: 'sexsiyyet_vezigesinin_surati_avadl_check',
                  label: 'Şəxsiyyət vəsiqəsinin surəti (arvadı və ya əri)',
                },
              ].map((opt) => {
                const checked = (formData as any)[opt.key] as boolean;
                return (
                  <label
                    key={opt.key}
                    className="flex items-center gap-2 px-2 py-1 text-xs cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [opt.key]: e.target.checked,
                        } as any)
                      }
                      className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span
                      className={
                        checked
                          ? 'line-through text-gray-400'
                          : 'text-gray-700'
                      }
                    >
                      {opt.label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Sənədləri qəbul edən
              </label>
              <select
                value={formData.senedleri_qebul_eden}
                onChange={(e) =>
                  setFormData({ ...formData, senedleri_qebul_eden: e.target.value })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Seçin</option>
                {lookups.receivers.map((r) => (
                  <option key={r.id} value={r.full_name || ''}>
                    {r.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Tarix
              </label>
              <DateInput
                value={formData.senedleri_qebul_tarixi}
                onChange={(v) =>
                  setFormData({
                    ...formData,
                    senedleri_qebul_tarixi: v,
                  })
                }
              />
            </div>
          </div>

          <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Əli vəziyyət
            </label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="eli_vaziyyet"
                  value="Ev"
                  checked={formData.eli_vaziyyet === 'Ev'}
                  onChange={(e) => setFormData({ ...formData, eli_vaziyyet: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-[11px] text-gray-700">Ev</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="eli_vaziyyet"
                  value="Suby"
                  checked={formData.eli_vaziyyet === 'Suby'}
                  onChange={(e) => setFormData({ ...formData, eli_vaziyyet: e.target.value })}
                  className="w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                />
                <span className="text-[11px] text-gray-700">Suby</span>
              </label>
            </div>
            <label className="inline-flex items-center gap-2 text-[11px] text-amber-700">
              <input
                type="checkbox"
                checked={formData.highlight}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    highlight: e.target.checked,
                  })
                }
                className="w-4 h-4 text-amber-500 border-gray-300 rounded focus:ring-amber-500"
              />
              <span>Nəzarətdədir (cədvəldə sarı ilə)</span>
            </label>
          </div>

          <div className="mt-3">
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Qeyd
            </label>
            <textarea
              value={formData.qeyd}
              onChange={(e) => setFormData({ ...formData, qeyd: e.target.value })}
              rows={3}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div className="mt-4 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setProtocolOpen(true)}
              className="px-3 py-1 border border-gray-300 rounded-md text-[11px] text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Protokola əlavə et
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Ləğv et
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-1 px-3 py-1 bg-blue-600 text-xs text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {saving ? 'Saxlanılır...' : 'Yadda saxla'}
              </button>
            </div>
          </div>
        </form>
      </div>
      <ChildrenModal
        open={childrenOpen}
        onClose={() => setChildrenOpen(false)}
        value={children}
        onChange={setChildren}
      />
      <ProtocolModal
        open={protocolOpen}
        onClose={() => setProtocolOpen(false)}
        value={protocol}
        onChange={setProtocol}
      />
    </div>
  );
}
