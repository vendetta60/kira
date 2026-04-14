import { roleLabel } from '../lib/roles';

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
    <aside className="w-60 bg-slate-800 flex flex-col shadow-xl">
      <div className="px-4 py-4 border-b border-slate-700">
        <p className="text-sm font-bold text-white">Admin Panel</p>
        <p className="text-xs text-slate-400 mt-0.5">Kirayə müqavilələrinin idarə edilməsi</p>
      </div>
      <nav className="flex-1 py-3 px-2">
        {items.map((item) => {
          const isSelected = active === item.key;
          return (
            <button
              key={item.key}
              onClick={() => onChange(item.key)}
              aria-selected={isSelected}
              className={`w-full text-left pl-4 pr-3 py-2.5 text-sm rounded-lg mb-1 transition-all duration-200 border-l-4 ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-sm'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-700/80'
              }`}
            >
              <span className={isSelected ? 'font-semibold' : ''}>{item.label}</span>
            </button>
          );
        })}
      </nav>
      {currentUser && (
        <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-400 space-y-1">
          <div>
            <p className="font-semibold text-white truncate">
              {currentUser.full_name || currentUser.username}
            </p>
            <p className="text-slate-500">
              Rol: {roleLabel(currentUser.role)}
            </p>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="mt-2 inline-flex items-center justify-center px-3 py-1.5 rounded-lg border border-slate-600 text-[11px] text-slate-300 hover:bg-slate-700 hover:text-white transition-colors w-full"
            >
              Çıxış
            </button>
          )}
        </div>
      )}
    </aside>
  );
}

