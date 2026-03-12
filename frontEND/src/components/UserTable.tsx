import { useEffect, useState } from 'react';
import { Plus, Trash2, Edit2 } from 'lucide-react';
import type { User } from '../lib/api';
import { createUser, deleteUserApi, fetchUsers, updateUserApi } from '../lib/api';

interface UserTableProps {
  token: string;
}

export function UserTable({ token }: UserTableProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [form, setForm] = useState({
    username: '',
    full_name: '',
    password: '',
    role: 'user',
    is_active: true,
  });

  async function load() {
    try {
      setLoading(true);
      const data = await fetchUsers(token);
      setUsers(data);
    } catch (err: any) {
      setError(err.message || 'Xəta baş verdi');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  function openNew() {
    setEditing(null);
    setForm({
      username: '',
      full_name: '',
      password: '',
      role: 'user',
      is_active: true,
    });
    setShowForm(true);
  }

  function openEdit(user: User) {
    setEditing(user);
    setForm({
      username: user.username,
      full_name: user.full_name || '',
      password: '',
      role: user.role,
      is_active: user.is_active,
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      if (editing) {
        await updateUserApi(token, editing.id, {
          full_name: form.full_name || undefined,
          role: form.role,
          is_active: form.is_active,
          password: form.password || undefined,
        });
      } else {
        if (!form.password) {
          alert('Yeni istifadəçi üçün şifrə tələb olunur');
          return;
        }
        await createUser(token, {
          username: form.username,
          full_name: form.full_name || undefined,
          password: form.password,
        });
      }
      setShowForm(false);
      setEditing(null);
      await load();
    } catch (err: any) {
      alert(err.message || 'Əməliyyat alınmadı');
    }
  }

  async function handleDelete(user: User) {
    if (!confirm(`"${user.username}" istifadəçisini silmək istəyirsiniz?`)) return;
    try {
      await deleteUserApi(token, user.id);
      await load();
    } catch (err: any) {
      alert(err.message || 'Silinmə zamanı xəta baş verdi');
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">İstifadəçilər</h2>
          <p className="text-sm text-gray-500">Admin panel üçün istifadəçilər və rollar</p>
        </div>
        <button
          onClick={openNew}
          className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Yeni istifadəçi
        </button>
      </div>

      {loading ? (
        <div className="px-4 py-6 text-sm text-gray-500">Yüklənir...</div>
      ) : error ? (
        <div className="px-4 py-6 text-sm text-red-600">{error}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  ID
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Ad Soyad
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Rol
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Əməliyyatlar
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-900">{user.id}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">{user.username}</td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {user.full_name || <span className="text-gray-400">-</span>}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-900">
                    {user.role === 'admin' ? 'Admin' : 'İstifadəçi'}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {user.is_active ? 'Aktiv' : 'Deaktiv'}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="Redaktə et"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded"
                        title="Sil"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-40 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {editing ? 'İstifadəçini redaktə et' : 'Yeni istifadəçi'}
              </h3>

              {!editing && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Username
                  </label>
                  <input
                    type="text"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Ad Soyad
                </label>
                <input
                  type="text"
                  value={form.full_name}
                  onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Şifrə {editing && <span className="text-gray-400">(ixtiyari)</span>}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Rol
                  </label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="user">İstifadəçi</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={form.is_active ? '1' : '0'}
                    onChange={(e) =>
                      setForm({ ...form, is_active: e.target.value === '1' })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="1">Aktiv</option>
                    <option value="0">Deaktiv</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditing(null);
                  }}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Ləğv et
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Yadda saxla
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

