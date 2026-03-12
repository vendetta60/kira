interface SidebarProps {
  active: string;
  onChange: (key: string) => void;
  isAdmin: boolean;
  currentUser?: {
    full_name?: string | null;
    username: string;
    role: string;
  } | null;
  onLogout?: () => void;
}

export function Sidebar({ active, onChange, isAdmin, currentUser, onLogout }: SidebarProps) {
  const items = [
    { key: 'dashboard', label: 'Dashboard' },
    { key: 'documents', label: 'Müqavilələr' },
    ...(isAdmin ? [{ key: 'users', label: 'İstifadəçilər' }] : []),
  ];

  return (
    <aside className="w-60 bg-white border-r border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b border-gray-200">
        <p className="text-sm font-semibold text-gray-800">Admin Panel</p>
        <p className="text-xs text-gray-500">Kirayə müqavilələrinin idarə edilməsi</p>
      </div>
      <nav className="flex-1 py-3">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onChange(item.key)}
            className={`w-full text-left px-4 py-2 text-sm rounded-r-full mb-1 transition-colors ${
              active === item.key
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:bg-blue-50'
            }`}
          >
            {item.label}
          </button>
        ))}
      </nav>
      {currentUser && (
        <div className="px-4 py-3 border-t border-gray-200 text-xs text-gray-600 space-y-1">
          <div>
            <p className="font-semibold text-gray-800 truncate">
              {currentUser.full_name || currentUser.username}
            </p>
            <p className="text-gray-500">
              Rol: {currentUser.role === 'admin' ? 'Admin' : 'İstifadəçi'}
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-1 inline-flex items-center justify-center px-3 py-1.5 rounded-full border border-gray-300 text-[11px] text-gray-700 hover:bg-gray-50 transition-colors w-full"
            >
              Çıxış
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

