import { useState } from 'react';
import { X } from 'lucide-react';
import { DateInput } from './DateInput';

export interface ProtocolData {
  family_count: number;
  amount: number;
  note: string;
  from_date: string;
  protocol_number: string;
  protocol_date: string;
  decision: string;
}

interface ProtocolModalProps {
  open: boolean;
  onClose: () => void;
  value: ProtocolData | null;
  onChange: (value: ProtocolData) => void;
}

export function ProtocolModal({ open, onClose, value, onChange }: ProtocolModalProps) {
  const [form, setForm] = useState<ProtocolData>(
    value ?? {
      family_count: 0,
      amount: 0,
      note: '',
      from_date: '',
      protocol_number: '',
      protocol_date: '',
      decision: '',
    },
  );

  if (!open) return null;

  function handleSave() {
    onChange(form);
    onClose();
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto text-xs">
        <div className="px-3 py-2.5 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-gray-900">Protokola əlavə et</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-3 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Ailə üzvlərinin sayı
              </label>
              <input
                type="number"
                min={0}
                value={form.family_count}
                onChange={(e) =>
                  setForm({ ...form, family_count: Number(e.target.value) || 0 })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Məbləğ
              </label>
              <input
                type="number"
                step="0.01"
                min={0}
                value={form.amount}
                onChange={(e) =>
                  setForm({ ...form, amount: Number(e.target.value) || 0 })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Qeyd
            </label>
            <textarea
              rows={2}
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Tarixdən hesablanır
            </label>
            <DateInput
              value={form.from_date}
              onChange={(v) => setForm({ ...form, from_date: v })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Protokol nömrəsi
              </label>
              <input
                type="text"
                value={form.protocol_number}
                onChange={(e) =>
                  setForm({ ...form, protocol_number: e.target.value })
                }
                className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
                Protokol tarixi
              </label>
              <DateInput
                value={form.protocol_date}
                onChange={(v) => setForm({ ...form, protocol_date: v })}
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-0.5">
              Qərar
            </label>
            <input
              type="text"
              value={form.decision}
              onChange={(e) => setForm({ ...form, decision: e.target.value })}
              className="w-full px-2 py-1 border border-gray-300 rounded-md text-xs focus:ring-[0.5px] focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>

        <div className="px-3 py-2.5 border-t border-gray-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50"
          >
            Çıxış
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-3 py-1 bg-blue-600 text-white text-xs rounded-md hover:bg-blue-700"
          >
            Əlavə et
          </button>
        </div>
      </div>
    </div>
  );
}

