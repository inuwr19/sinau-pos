// src/pages/admin/AdminLayout.tsx
import {
  Building2,
  Coffee,
  LayoutDashboard,
  LogOut,
  Tags,
  UserCog,
  UtensilsCrossed,
} from 'lucide-react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export default function AdminLayout() {
  const { user, branch, signOut } = useAuth();
  const navigate = useNavigate();

  const isAdmin = user?.role === 'admin';
  const branchLabel = isAdmin ? 'Semua Cabang' : branch?.name ?? 'Tanpa Cabang';

  const menuItems = [
    {
      to: '/admin',
      label: 'Dashboard',
      icon: LayoutDashboard,
    },
    {
      to: '/admin/branches',
      label: 'Branches',
      icon: Building2,
    },
    {
      to: '/admin/categories',
      label: 'Categories',
      icon: Tags,
    },
    {
      to: '/admin/menu-items',
      label: 'Menu Items',
      icon: UtensilsCrossed,
    },
    {
      to: '/admin/users',
      label: 'Users',
      icon: UserCog,
    },
  ];

  const handleLogout = async () => {
    await signOut();
    navigate('/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Sidebar */}
      <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/90 backdrop-blur flex flex-col px-4 py-4 md:py-6">
        {/* Logo + info */}
        <div className="flex items-center gap-3 mb-6">
          <div className="bg-gradient-to-br from-amber-500 to-orange-600 p-2 rounded-xl shadow-md">
            <Coffee className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="font-semibold text-sm tracking-wide uppercase text-slate-200">
              Sinau Cafe
            </div>
            <div className="text-xs text-slate-400">Admin Panel</div>
          </div>
        </div>

        {/* Info user + cabang */}
        <div className="mb-6 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-3 text-xs">
          <div className="font-semibold text-slate-100 truncate">
            {user?.name ?? user?.email ?? 'Admin'}
          </div>
          <div className="text-slate-400 flex justify-between mt-1">
            <span className="uppercase tracking-wide">Role</span>
            <span className="font-semibold text-amber-400">{user?.role}</span>
          </div>
          <div className="text-slate-400 flex justify-between mt-1">
            <span>Cabang</span>
            <span className="font-medium truncate">{branchLabel}</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  [
                    'flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-all',
                    'border border-transparent',
                    isActive
                      ? 'bg-amber-500/15 text-amber-300 border-amber-500/40 shadow-sm'
                      : 'text-slate-300 hover:bg-slate-900/80 hover:text-amber-100 hover:border-slate-700',
                  ].join(' ')
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="mt-4 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Keluar</span>
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Top header (optional, bisa dipakai untuk breadcrumb / info singkat) */}
        <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur px-4 sm:px-6 py-3 flex items-center justify-between">
          <div>
            <h1 className="text-sm sm:text-base font-semibold text-slate-100">
              Halaman Admin Sinau Cafe
            </h1>
            <p className="text-xs text-slate-400">
              Kelola cabang, menu, kategori, member, dan pengguna.
            </p>
          </div>
          <div className="hidden sm:flex flex-col items-end text-xs text-slate-400">
            <span>{new Date().toLocaleDateString('id-ID')}</span>
          </div>
        </header>

        {/* Outlet untuk setiap halaman admin */}
        <main className="flex-1 px-4 sm:px-6 py-6 bg-slate-950">
          <div className="mx-auto max-w-6xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
