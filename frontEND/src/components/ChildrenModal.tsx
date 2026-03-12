import { useState } from 'react';
import { X, Plus, Edit2, Trash2 } from 'lucide-react';
import { DateInput } from './DateInput';

export interface ChildRow {
  id: number;
  full_name: string;
  birth_date: string;
  edu_status: boolean;
  edu_document: string;
}

interface ChildrenModalProps {
  open: boolean;
  onClose: () => void;
  value: ChildRow[];
  onChange: (rows: ChildRow[]) => void;
}

export function ChildrenModal({ open, onClose, value, onChange }: ChildrenModalProps) {
  const [editing, setEditing] = useState<ChildRow | null>(null);

  if (!open) return null;

  function resetForm() {
    setEditing({
      id: 0,
      full_name: '',
      birth_date: '',
      edu_status: false,
      edu_document: '',
    });
  }

  function handleSave() {
    if (!editing) return;
    if (!editing.full_name) return;

    if (editing.id === 0) {
      const maxId = value.reduce((m, r) => Math.max(m, r.id), 0);
      onChange([...value, { ...editing, id: maxId + 1 }]);
    } else {
      onChange(value.map((r) => (r.id === editing.id ? editing : r)));
    }
    setEditing(null);
  }

  function handleEdit(row: ChildRow) {
    setEditing({ ...row });
  }

  function handleDelete(row: ChildRow) {
    if (!confirm('Övladı silmək istəyirsiniz?')) return;
    onChange(value.filter((r) => r.id !== row.id));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full max-h-[90vh] flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Övladları</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex-1 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">Əlavə edilmiş övladlar</p>
            <button
              onClick={resetForm}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-4 h-4" />
              Yeni
            </button>
          </div>

          <div className="border border-gray-200 rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Soyad, ad və atasının adı
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Doğum tarixi
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Ali təhsil alır
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Təhsil arayışı
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-semibold text-gray-600">
                    Əməliyyatlar
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {value.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-3 py-6 text-center text-xs text-gray-500">
                      {'<Daxil edilməyib>'}
                    </td>
                  </tr>
                ) : (
                  value.map((row) => (
                    <tr key={row.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2">{row.full_name}</td>
                      <td className="px-3 py-2">
                        {row.birth_date ? new Date(row.birth_date).toLocaleDateString('az-AZ') : ''}
                      </td>
                      <td className="px-3 py-2">
                        {row.edu_status ? 'Bəli' : 'Xeyr'}
                      </td>
                      <td className="px-3 py-2">{row.edu_document}</td>
                      <td className="px-3 py-2">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(row)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(row)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {editing && (
            <div className="border border-gray-200 rounded-lg p-3 space-y-3">
              <p className="text-sm font-medium text-gray-700 mb-1">
                {editing.id === 0 ? 'Yeni övlad əlavə et' : 'Övladı redaktə et'}
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Soyad, ad və atasının adı
                  </label>
                  <input
                    type="text"
                    value={editing.full_name}
                    onChange={(e) =>
                      setEditing({
                        ...editing,
                        full_name: e.target.value,
                      })
                    }
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">
                    Doğum tarixi
                  </label>
                  <DateInput
                    value={editing.birth_date}
                    onChange={(v) =>
                      setEditing({
                        ...editing,
                        birth_date: v,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  id="edu_status"
                  type="checkbox"
                  checked={editing.edu_status}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      edu_status: e.target.checked,
                    })
                  }
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="edu_status" className="text-xs text-gray-700">
                  Ali təhsil alır
                </label>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Təhsil arayışı məlumatı
                </label>
                <input
                  type="text"
                  value={editing.edu_document}
                  onChange={(e) =>
                    setEditing({
                      ...editing,
                      edu_document: e.target.value,
                    })
                  }
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setEditing(null)}
                  className="px-3 py-1.5 text-xs border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Ləğv et
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Yadda saxla
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="px-4 py-3 border-t border-gray-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            Çıxış
          </button>
        </div>
      </div>
    </div>
  );
}

