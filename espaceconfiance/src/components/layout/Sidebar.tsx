import { Bell, Headphones, MessageSquare, Settings, Users, Hash, LogOut, Home, ShieldCheck } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Avatar } from '../ui/Avatar';
import { Badge } from '../ui/Badge';
import { useState, useEffect } from 'react';
import { notificationApi } from '../../api/notificationApi';

interface NavItem {
  to: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

export function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [unreadCount, setUnreadCount] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    notificationApi.getUnreadCount().then(setUnreadCount).catch(() => {});
    const interval = setInterval(
      () => notificationApi.getUnreadCount().then(setUnreadCount).catch(() => {}),
      30_000,
    );
    return () => clearInterval(interval);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navItems: NavItem[] = [
    { to: '/home',         icon: <Home size={18} />,        label: 'Accueil' },
    { to: '/chat',         icon: <MessageSquare size={18} />, label: 'Messages' },
    { to: '/friends',      icon: <Users size={18} />,       label: 'Amis' },
    { to: '/listeners',    icon: <Headphones size={18} />,  label: 'Écoutants' },
    { to: '/rooms',        icon: <Hash size={18} />,        label: 'Salons' },
    { to: '/notifications',icon: <Bell size={18} />,        label: 'Notifications', badge: unreadCount },
  ];

  return (
    <aside className="w-[280px] bg-[#080d1a] flex flex-col h-screen shrink-0 border-r border-slate-800/60">

      {/* ── Logo / Brand ── */}
      <div className="h-16 flex items-center px-5 border-b border-slate-800/60 shrink-0">
        <NavLink to="/chat" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-xl bg-violet-600 hover:bg-violet-500 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-violet-900/50 transition-colors">
            EC
          </div>
          <div>
            <p className="font-bold text-slate-100 text-[15px] leading-tight group-hover:text-white transition-colors">
              EspaceConfiance
            </p>
            <p className="text-[10px] text-slate-600 leading-none">Plateforme de soutien</p>
          </div>
        </NavLink>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pt-5 pb-3 shrink-0">
        <div>
          <input
            className="w-full bg-slate-800/60 border border-slate-700/50 rounded-lg px-3 py-2.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 focus:bg-slate-800 transition-all"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-3 mt-1 select-none">
          Navigation
        </p>

        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`
                relative flex items-center gap-3 px-3 py-3.5 rounded-xl mb-2 text-sm font-medium transition-all duration-150 group
                ${isActive
                  ? 'bg-violet-600/20 text-violet-300 shadow-sm'
                  : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'}
              `}
            >
              {isActive && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-violet-500 rounded-r-full" />
              )}
              <span className={`shrink-0 ${isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-300'} transition-colors`}>
                {item.icon}
              </span>
              <span className="flex-1 truncate">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <Badge count={item.badge} absolute={false} />
              )}
            </NavLink>
          );
        })}

        {/* ── Admin section (visible only for Admin role) ── */}
        {user?.role === 'Admin' && (
          <>
            <p className="text-[10px] font-semibold text-red-700/80 uppercase tracking-wider px-3 mb-3 mt-5 select-none">
              Administration
            </p>
            <NavLink
              to="/admin"
              className={`
                relative flex items-center gap-3 px-3 py-3.5 rounded-xl mb-2 text-sm font-medium transition-all duration-150 group
                ${location.pathname === '/admin'
                  ? 'bg-red-600/20 text-red-300 shadow-sm'
                  : 'text-slate-400 hover:bg-red-900/20 hover:text-red-300'}
              `}
            >
              {location.pathname === '/admin' && (
                <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-red-500 rounded-r-full" />
              )}
              <span className={`shrink-0 ${location.pathname === '/admin' ? 'text-red-400' : 'text-slate-500 group-hover:text-red-400'} transition-colors`}>
                <ShieldCheck size={18} />
              </span>
              <span className="flex-1 truncate">Panneau Admin</span>
            </NavLink>
          </>
        )}
      </nav>

      {/* ── User section ── */}
      <div className="p-4 border-t border-slate-800/60 shrink-0">
        <div className="flex items-center gap-3 px-2 py-3 rounded-xl hover:bg-slate-800/60 transition group cursor-pointer">
          <Avatar
            src={user?.profilePicture}
            username={user?.username ?? '?'}
            size="sm"
            isOnline={true}
            ringColor="border-[#080d1a]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 truncate leading-tight">{user?.username ?? '...'}</p>
            <p className="text-[11px] leading-tight">
              {user?.role === 'Admin'
                ? <span className="text-red-400">👑 Admin</span>
                : <span className="text-emerald-500">● En ligne</span>
              }
            </p>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <NavLink
              to="/profile"
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-slate-200 hover:bg-slate-700 transition"
              title="Paramètres"
            >
              <Settings size={14} />
            </NavLink>
            <button
              onClick={handleLogout}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-500 hover:text-red-400 hover:bg-red-500/10 transition"
              title="Déconnexion"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
