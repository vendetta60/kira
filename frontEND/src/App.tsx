import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip as ChartTooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { Navbar } from './components/Navbar';
import { DocumentForm } from './components/DocumentForm';
import { DocumentTable } from './components/DocumentTable';
import { Sidebar } from './components/Sidebar';
import { UserTable } from './components/UserTable';
import { ProtocolsTable } from './components/ProtocolsTable';
import type { Document } from './lib/database.types';
import { fetchMe, login, type User } from './lib/api';
import {
  createDocumentApi,
  deleteDocumentApi,
  fetchDocuments,
  fetchRanks,
  fetchReceivers,
  fetchSections,
  updateDocumentApi,
} from './lib/documentsApi';

type ViewKey = 'dashboard' | 'documents' | 'users';
type TimeRange = 'all' | 'day' | 'week' | 'month' | 'year';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, ChartTooltip, Legend);

function App() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);

  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(!!token);
  const [authError, setAuthError] = useState<string | null>(null);

  const [documentsTab, setDocumentsTab] = useState<'documents' | 'protocols'>('documents');
  const [priorityIds, setPriorityIds] = useState<number[]>(() => {
    try {
      const raw = localStorage.getItem('priorityIds');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed
        .map((x) => Number(x))
        .filter((x) => Number.isFinite(x));
    } catch {
      return [];
    }
  });
  const [loginForm, setLoginForm] = useState(() => {
    const savedUsername = localStorage.getItem('rememberUsername') || '';
    return { username: savedUsername, password: '' };
  });
  const [loggingIn, setLoggingIn] = useState(false);
  const [rememberMe, setRememberMe] = useState<boolean>(
    () => localStorage.getItem('rememberMe') === 'true',
  );
  const [dashboardRange, setDashboardRange] = useState<TimeRange>('month');

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return;
    async function loadMe() {
      try {
        const me = await fetchMe(token);
        setCurrentUser(me);
      } catch {
        setToken(null);
        localStorage.removeItem('token');
      } finally {
        setAuthLoading(false);
      }
    }
    void loadMe();
  }, [token]);

  const [ranks, setRanks] = useState<any[]>([]);
  const [sections, setSections] = useState<any[]>([]);
  const [receivers, setReceivers] = useState<any[]>([]);
  const [protocols, setProtocols] = useState<
    {
      id: number;
      full_name: string;
      rank?: string;
      family_count: number;
      amount: number;
      protocol_number: string;
      protocol_date: string;
      note: string;
    }[]
  >(() => {
    try {
      const raw = localStorage.getItem('protocols');
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed;
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!token) return;
    async function loadData() {
      try {
        setLoadingDocs(true);
        const [docs, rankList, sectionList, receiverList] = await Promise.all([
          fetchDocuments(token),
          fetchRanks(token),
          fetchSections(token),
          fetchReceivers(token),
        ]);
        setDocuments(docs);
        // Mövcud priorityIds-i yalnız mövcud sənədlərlə məhdudlaşdır
        setPriorityIds((prev) => {
          const idSet = new Set(docs.map((d) => d.id));
          return prev.filter((id) => idSet.has(id));
        });
        setRanks(rankList);
        setSections(sectionList);
        setReceivers(receiverList);
      } finally {
        setLoadingDocs(false);
      }
    }
    void loadData();
  }, [token]);

  // Protokolları localStorage-də saxla ki, səhifə yenilənəndə itməsin
  useEffect(() => {
    try {
      localStorage.setItem('protocols', JSON.stringify(protocols));
    } catch {
      // ignore
    }
  }, [protocols]);

  // Vacib sənədlərin id-lərini localStorage-də saxla ki, refreshdən sonra itməsin
  useEffect(() => {
    try {
      localStorage.setItem('priorityIds', JSON.stringify(priorityIds));
    } catch {
      // ignore
    }
  }, [priorityIds]);

  const now = new Date();

  const inRange = (dateStr: string | null | undefined, range: TimeRange): boolean => {
    if (range === 'all') return true;
    if (!dateStr) return false;
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return false;

    const oneDay = 24 * 60 * 60 * 1000;
    const diffDays = (now.getTime() - d.getTime()) / oneDay;

    switch (range) {
      case 'day':
        return diffDays < 1;
      case 'week':
        return diffDays < 7;
      case 'month':
        return diffDays < 31;
      case 'year':
        return diffDays < 365;
      default:
        return true;
    }
  };

  const docsInRange = documents.filter((d) => inRange(d.created_at, dashboardRange));
  const protocolsInRange = protocols.filter((p) =>
    inRange(p.protocol_date || null, dashboardRange),
  );
  const priorityInRange = docsInRange.filter((d) => priorityIds.includes(d.id));

  const totalContracts = docsInRange.length;
  const totalProtocols = protocolsInRange.length;
  const totalPriority = priorityInRange.length;
  const totalNonPriority = Math.max(totalContracts - totalPriority, 0);

  const chartsData = useMemo(() => {
    const base = new Map<
      string,
      {
        key: string;
        label: string;
        contracts: number;
        protocols: number;
      }
    >();
    const nowLocal = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(nowLocal.getFullYear(), nowLocal.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const label = d.toLocaleString('az-AZ', { month: 'short' });
      base.set(key, { key, label, contracts: 0, protocols: 0 });
    }

    docsInRange.forEach((doc) => {
      if (!doc.created_at) return;
      const d = new Date(doc.created_at as any);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const row = base.get(key);
      if (row) row.contracts += 1;
    });

    protocolsInRange.forEach((p) => {
      if (!p.protocol_date) return;
      const d = new Date(p.protocol_date as any);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      const row = base.get(key);
      if (row) row.protocols += 1;
    });

    return Array.from(base.values());
  }, [docsInRange, protocolsInRange]);

  const rankStats = useMemo(() => {
    const map = new Map<string, number>();
    docsInRange.forEach((d) => {
      const key = d.rutbe || 'Digər';
      map.set(key, (map.get(key) || 0) + 1);
    });
    const entries = Array.from(map.entries()).sort((a, b) => b[1] - a[1]);
    const top = entries.slice(0, 5);
    const rest = entries.slice(5).reduce((sum, [, v]) => sum + v, 0);
    if (rest > 0) top.push(['Digər', rest]);
    return top;
  }, [docsInRange]);

  const missingStats = useMemo(() => {
    let withMissing = 0;
    let withoutMissing = 0;
    docsInRange.forEach((d) => {
      const flags = [
        d.daginmaz_emlak_arayisi_check,
        d.daginmaz_emlak_arayisi_avadl_check,
        d.nigah_haqqinda_sehadename_check,
        d.qrafeden_18ci_cixarig_check,
        d.sexsiyyet_vezigesinin_surati_check,
        d.sexsiyyet_vezigesinin_surati_avadl_check,
      ];
      const anyFlag = flags.some(Boolean);
      if (anyFlag) withMissing += 1;
      else withoutMissing += 1;
    });
    return { withMissing, withoutMissing };
  }, [docsInRange]);

  const handleNewDocument = () => {
    setEditingDocument(null);
    setShowForm(true);
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingDocument(null);
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoggingIn(true);
    setAuthError(null);
    try {
      const res = await login(loginForm.username, loginForm.password);
      localStorage.setItem('token', res.access_token);
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('rememberUsername', loginForm.username);
      } else {
        localStorage.removeItem('rememberMe');
        localStorage.removeItem('rememberUsername');
      }
      setToken(res.access_token);
      const me = await fetchMe(res.access_token);
      setCurrentUser(me);
    } catch (err: any) {
      setAuthError(err.message || 'Daxil olmaq alınmadı');
    } finally {
      setLoggingIn(false);
    }
  }

  // URL-i view ilə sinxron saxla
  useEffect(() => {
    if (location.pathname === '/') {
      navigate('/dashboard', { replace: true });
    }
  }, [location.pathname, navigate]);

  const view: ViewKey =
    location.pathname.startsWith('/documents')
      ? 'documents'
      : location.pathname.startsWith('/users')
        ? 'users'
        : 'dashboard';

  const handleChangeView = (key: ViewKey) => {
    if (key === 'documents') {
      navigate('/documents');
    } else if (key === 'users') {
      navigate('/users');
    } else {
      navigate('/dashboard');
    }
  };

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('priorityIds');
    localStorage.removeItem('protocols');
    setToken(null);
    setCurrentUser(null);
    setDocuments([]);
    setPriorityIds([]);
    setProtocols([]);
  }

if (!token || !currentUser) {
    if (authLoading) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Yüklənir...</p>
          </div>
        </div>
      );
    }

    const loginBg = new URL('../Gemini_Generated_Image_kcoxkrkcoxkrkcox.png', import.meta.url)
      .href;

    return (
      <div
        className="min-h-screen flex items-center justify-end px-6"
        style={{
          backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.75), rgba(15,23,42,0.3)), url(${loginBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="max-w-md w-full bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-slate-200">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Kirayə Müqavilələri Sistemi
          </h1>
          <p className="text-sm text-gray-500 mb-6">
            Admin panelə daxil olmaq üçün istifadəçi adı və şifrəni yazın
          </p>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                İstifadəçi adı
              </label>
              <input
                type="text"
                value={loginForm.username}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, username: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Şifrə
              </label>
              <input
                type="password"
                value={loginForm.password}
                onChange={(e) =>
                  setLoginForm((f) => ({ ...f, password: e.target.value }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span>Yadda saxla</span>
              </label>
              {authError && (
                <p className="text-xs text-red-600 max-w-[60%] text-right">
                  {authError}
                </p>
              )}
            </div>
            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-60 text-sm"
            >
              {loggingIn ? 'Daxil olunur...' : 'Daxil ol'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        active={view}
        onChange={(key) => handleChangeView(key as ViewKey)}
        isAdmin={currentUser.role === 'admin'}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      <div className="flex-1 flex flex-col">
        <Navbar onNewDocument={handleNewDocument} />

        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-900">
              {view === 'dashboard'
                ? 'Dashboard'
                : view === 'documents'
                  ? 'Müqavilələr'
                  : 'İstifadəçilər'}
            </p>
            <p className="text-xs text-gray-500">
              {view === 'dashboard'
                ? 'Sistemin ümumi icmalı'
                : view === 'documents'
                  ? 'Kirayə müqavilələri və sənədlər'
                  : 'Admin panel üçün istifadəçilər'}
            </p>
          </div>
          <div className="flex items-center gap-3" />
        </header>

        <main className="flex-1 p-6 space-y-4 overflow-y-auto">
          {view === 'dashboard' && (
            <>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Dashboard
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Müqavilə və protokollar üzrə ümumi statistika
                  </p>
                </div>
                <div className="inline-flex items-center bg-gray-100 rounded-full p-1 text-xs border border-gray-200">
                  {(
                    [
                      ['day', 'Gün'] as const,
                      ['week', 'Həftə'] as const,
                      ['month', 'Ay'] as const,
                      ['year', 'İl'] as const,
                      ['all', 'Hamısı'] as const,
                    ] satisfies [TimeRange, string][]
                  ).map(([key, label]) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => setDashboardRange(key)}
                      className={`px-3 py-1 rounded-full transition-colors ${
                        dashboardRange === key
                          ? 'bg-white shadow text-blue-700'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                    Cari istifadəçi
                  </p>
                  <p className="text-lg font-semibold text-gray-900">
                    {currentUser.full_name || currentUser.username}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Rol: {currentUser.role === 'admin' ? 'Admin' : 'İstifadəçi'}
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                    Müqavilələrin sayı
                  </p>
                  <p className="text-2xl font-bold text-blue-700">{docsInRange.length}</p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Seçilmiş period üzrə qeydiyyata alınan müqavilələr
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                    Protokolların sayı
                  </p>
                  <p className="text-2xl font-bold text-emerald-700">
                    {protocolsInRange.length}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Seçilmiş period üzrə əlavə protokollar
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <p className="text-[11px] font-semibold text-gray-500 uppercase mb-1">
                    Nəzarətdə olan / vacib
                  </p>
                  <p className="text-2xl font-bold text-amber-600">
                    {priorityInRange.length}
                  </p>
                  <p className="text-[11px] text-gray-500 mt-1">
                    Vacib kimi işarələnmiş müqavilələr
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Müqavilələr diaqramı
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Son 6 ay: {docsInRange.length.toLocaleString('az-AZ')}
                    </p>
                  </div>
                  <div className="h-44">
                    <Doughnut
                      data={{
                        labels: chartsData.map((d) => d.label),
                        datasets: [
                          {
                            label: 'Müqavilələr',
                            data: chartsData.map((d) => d.contracts),
                            backgroundColor: ['#2563EB', '#3B82F6', '#60A5FA', '#93C5FD', '#BFDBFE', '#DBEAFE'],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, font: { size: 9 } },
                          },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => `${ctx.label}: ${ctx.parsed} ədəd`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Son 6 ay üzrə ay-ay müqavilələrin dinamikası
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Protokollar diaqramı
                    </p>
                    <p className="text-[11px] text-gray-500">
                      Son 6 ay: {protocolsInRange.length.toLocaleString('az-AZ')}
                    </p>
                  </div>
                  <div className="h-44">
                    <Doughnut
                      data={{
                        labels: chartsData.map((d) => d.label),
                        datasets: [
                          {
                            label: 'Protokollar',
                            data: chartsData.map((d) => d.protocols),
                            backgroundColor: ['#059669', '#10B981', '#34D399', '#6EE7B7', '#A7F3D0', '#D1FAE5'],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, font: { size: 9 } },
                          },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => `${ctx.label}: ${ctx.parsed} ədəd`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Son 6 ay üzrə ay-ay protokolların dinamikası
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Müqavilələr / Protokollar
                    </p>
                    <p className="text-[11px] text-gray-500">Ümumi paylanma</p>
                  </div>
                  <div className="h-44">
                    <Doughnut
                      data={{
                        labels: ['Müqavilələr', 'Protokollar'],
                        datasets: [
                          {
                            data: [totalContracts, totalProtocols],
                            backgroundColor: ['#2563EB', '#059669'],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '60%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, font: { size: 9 } },
                          },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => `${ctx.label}: ${ctx.parsed} ədəd`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Seçilmiş period üzrə sənəd növlərinin nisbi payı
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Nəzarətdə olanlar
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {totalPriority}/{totalContracts}
                    </p>
                  </div>
                  <div className="h-40">
                    <Doughnut
                      data={{
                        labels: ['Nəzarətdədir', 'Digər'],
                        datasets: [
                          {
                            data: [totalPriority, totalNonPriority],
                            backgroundColor: ['#FACC15', '#E5E7EB'],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, font: { size: 9 } },
                          },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => `${ctx.label}: ${ctx.parsed} ədəd`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Nəzarətdə olan müraciətlərin ümumi fondakı payı
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Rütbələr üzrə paylanma
                    </p>
                    <p className="text-[11px] text-gray-500">Ən çox 5 rütbə</p>
                  </div>
                  <div className="h-40">
                    <Doughnut
                      data={{
                        labels: rankStats.map(([name]) => name),
                        datasets: [
                          {
                            data: rankStats.map(([, v]) => v),
                            backgroundColor: ['#2563EB', '#7C3AED', '#EC4899', '#F97316', '#0EA5E9', '#22C55E'],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '55%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, font: { size: 9 } },
                          },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => `${ctx.label}: ${ctx.parsed} ədəd`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Seçilmiş period üzrə müraciətlərin rütbə üzrə bölgüsü
                  </p>
                </div>

                <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                      Çatışmayan sənədlər
                    </p>
                    <p className="text-[11px] text-gray-500">
                      {missingStats.withMissing}/{totalContracts}
                    </p>
                  </div>
                  <div className="h-40">
                    <Doughnut
                      data={{
                        labels: ['Çatışmayan var', 'Tamdır'],
                        datasets: [
                          {
                            data: [missingStats.withMissing, missingStats.withoutMissing],
                            backgroundColor: ['#EF4444', '#22C55E'],
                          },
                        ],
                      }}
                      options={{
                        responsive: true,
                        maintainAspectRatio: false,
                        cutout: '65%',
                        plugins: {
                          legend: {
                            position: 'bottom',
                            labels: { boxWidth: 10, font: { size: 9 } },
                          },
                          tooltip: {
                            callbacks: {
                              label: (ctx) => `${ctx.label}: ${ctx.parsed} ədəd`,
                            },
                          },
                        },
                      }}
                    />
                  </div>
                  <p className="mt-2 text-[11px] text-gray-500">
                    Əmlak və şəxsiyyət sənədlərinin tamlıq səviyyəsi
                  </p>
                </div>
              </div>
            </>
          )}

          {view === 'documents' && (
            <>
              <div className="mb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                    Müqavilə müraciətləri
                  </h2>
                  <p className="text-sm text-gray-600 mt-0.5">
                    Kirayə müqavilələri və onlara aid protokollar
                  </p>
                </div>
                <div className="inline-flex items-center bg-blue-50 rounded-full p-1 text-xs border border-blue-200">
                  <button
                    type="button"
                    onClick={() => setDocumentsTab('documents')}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      documentsTab === 'documents'
                        ? 'bg-white shadow text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Müraciətlər
                  </button>
                  <button
                    type="button"
                    onClick={() => setDocumentsTab('protocols')}
                    className={`px-3 py-1 rounded-full transition-colors ${
                      documentsTab === 'protocols'
                        ? 'bg-white shadow text-blue-700'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Protokollar
                  </button>
                </div>
              </div>
              {documentsTab === 'documents' ? (
                <DocumentTable
                  documents={documents}
                  onEdit={handleEditDocument}
                  onDelete={async (id) => {
                    if (!token) return;
                    await deleteDocumentApi(token, id);
                    const docs = await fetchDocuments(token);
                    setDocuments(docs);
                    setPriorityIds((prev) => prev.filter((x) => x !== id));
                  }}
                  priorityIds={priorityIds}
                  onTogglePriority={(id) =>
                    setPriorityIds((prev) =>
                      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
                    )
                  }
                />
              ) : (
                <ProtocolsTable protocols={protocols} />
              )}
            </>
          )}

          {view === 'users' && currentUser.role === 'admin' && token && (
            <UserTable token={token} />
          )}
        </main>

        {showForm && view === 'documents' && token && (
          <DocumentForm
            document={editingDocument}
            isPriority={
              editingDocument ? priorityIds.includes(editingDocument.id) : false
            }
            onClose={handleCloseForm}
            onSave={async (data) => {
              if (!token) return;
              const {
                protocol,
                children: _children,
                highlight,
                ...documentPayload
              } = data as any;
              const normalizedPayload: any = {};
              for (const [key, value] of Object.entries(documentPayload)) {
                if (value === '') {
                  normalizedPayload[key] = null;
                } else {
                  normalizedPayload[key] = value;
                }
              }
              let saved: Document;
              if (editingDocument) {
                saved = await updateDocumentApi(token, editingDocument.id, normalizedPayload);
              } else {
                saved = await createDocumentApi(token, normalizedPayload);
              }
              const docs = await fetchDocuments(token);
              setDocuments(docs);
              // Formdakı "Vacib qeyd" checkbox-u əsasında priorityIds-i yenilə
              setPriorityIds((prev) => {
                const without = prev.filter((id) => id !== saved.id);
                return highlight ? [...without, saved.id] : without;
              });
              if (protocol) {
                setProtocols((prev) => [
                  ...prev,
                  {
                    id: prev.length ? prev[prev.length - 1].id + 1 : 1,
                    full_name: saved.soyad_ad_ata,
                    rank: saved.rutbe,
                    family_count: protocol.family_count ?? 0,
                    amount: protocol.amount ?? 0,
                    protocol_number: protocol.protocol_number ?? '',
                    protocol_date: protocol.protocol_date ?? '',
                    note: protocol.note ?? '',
                  },
                ]);
              }
            }}
            lookups={{ ranks, sections, receivers }}
          />
        )}
      </div>
    </div>
  );
}

export default App;
