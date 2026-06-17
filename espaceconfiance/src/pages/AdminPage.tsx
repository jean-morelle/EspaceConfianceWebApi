import { useEffect, useState } from 'react';
import { ShieldCheck, Users, FileText, Trash2, Ban, CheckCircle, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Avatar } from '../components/ui/Avatar';
import { LabelBadge } from '../components/ui/Badge';
import { Layout } from '../components/layout/Layout';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import type { UserDto } from '../types';
import api from '../api/axiosConfig';
import toast from 'react-hot-toast';

type Tab = 'users' | 'reports';

interface ReportDto {
  id: string;
  reporterId: string;
  reporterUsername: string;
  reportedUserId: string;
  reportedUsername: string;
  reason: string;
  status: string;
  createdAt: string;
}

export function AdminPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('users');
  const [users, setUsers] = useState<UserDto[]>([]);
  const [reports, setReports] = useState<ReportDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'Admin') { navigate('/chat', { replace: true }); return; }
    loadData();
  }, [user]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [u, r] = await Promise.all([
        api.get<UserDto[]>('/admin/users').then(res => res.data),
        api.get<ReportDto[]>('/admin/reports').then(res => res.data),
      ]);
      setUsers(u);
      setReports(r);
    } catch { toast.error('Erreur de chargement.'); }
    finally { setIsLoading(false); }
  };

  const handleSuspend = async (userId: string, suspend: boolean) => {
    try {
      await api.put(`/admin/users/${userId}/suspend?suspend=${suspend}`);
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, isBlocked: suspend } : u));
      toast.success(suspend ? 'Utilisateur suspendu.' : 'Suspension levée.');
    } catch { toast.error('Erreur.'); }
  };

  const handleDelete = async (userId: string) => {
    if (!confirm('Supprimer définitivement cet utilisateur ?')) return;
    try {
      await api.delete(`/admin/users/${userId}`);
      setUsers(prev => prev.filter(u => u.id !== userId));
      toast.success('Utilisateur supprimé.');
    } catch { toast.error('Erreur.'); }
  };

  const stats = {
    total: users.length,
    listeners: users.filter(u => u.isListener).length,
    admins: users.filter(u => u.role === 'Admin').length,
    suspended: users.filter(u => u.isBlocked).length,
    pendingReports: reports.filter(r => r.status === 'Pending').length,
  };

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-900">

        {/* Header */}
        <div className="h-14 bg-slate-800/80 backdrop-blur border-b border-slate-800 flex items-center gap-3 px-5 shrink-0">
          <ShieldCheck size={18} className="text-red-400 shrink-0" />
          <span className="font-bold text-slate-100 text-sm">Panneau d'administration</span>
          <LabelBadge variant="red">Admin</LabelBadge>
        </div>

        <div className="flex-1 overflow-y-auto p-6">

          {/* Stats */}
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-8">
            {[
              { label: 'Utilisateurs', value: stats.total,          color: 'text-slate-200',  bg: 'bg-slate-800 border-slate-700' },
              { label: 'Écoutants',    value: stats.listeners,       color: 'text-violet-300', bg: 'bg-violet-900/20 border-violet-700/30' },
              { label: 'Admins',       value: stats.admins,          color: 'text-red-300',    bg: 'bg-red-900/20 border-red-700/30' },
              { label: 'Suspendus',    value: stats.suspended,       color: 'text-amber-300',  bg: 'bg-amber-900/20 border-amber-700/30' },
              { label: 'Signalements', value: stats.pendingReports,  color: 'text-orange-300', bg: 'bg-orange-900/20 border-orange-700/30' },
            ].map(s => (
              <div key={s.label} className={`border rounded-2xl p-5 ${s.bg}`}>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mb-6 bg-slate-800 border border-slate-700 rounded-xl p-1 w-fit">
            {([['users', <Users size={14} />, 'Utilisateurs'], ['reports', <FileText size={14} />, 'Signalements']] as const).map(([id, icon, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === id ? 'bg-slate-700 text-slate-100 shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {icon}{label}
                {id === 'reports' && stats.pendingReports > 0 && (
                  <span className="bg-orange-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none">
                    {stats.pendingReports}
                  </span>
                )}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : tab === 'users' ? (

            /* ── Users table ── */
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-700">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{users.length} membres</p>
              </div>
              <div>
                {users.map((u, i) => (
                  <motion.div
                    key={u.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-center gap-4 px-5 py-3.5 border-b border-slate-700/60 hover:bg-slate-700/30 transition last:border-0"
                  >
                    <Avatar src={u.profilePicture} username={u.username} size="sm" isOnline={u.isOnline} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-slate-100">{u.username}</p>
                        {u.role === 'Admin' && <LabelBadge variant="red">👑 Admin</LabelBadge>}
                        {u.isListener && <LabelBadge variant="violet">🎧 Écoutant</LabelBadge>}
                        {u.isBlocked && <LabelBadge variant="amber">🚫 Suspendu</LabelBadge>}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">{u.email}</p>
                    </div>

                    <p className="text-xs text-slate-600 hidden xl:block shrink-0">
                      {formatDistanceToNow(new Date(u.createdAt), { addSuffix: true, locale: fr })}
                    </p>

                    {u.role !== 'Admin' && (
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleSuspend(u.id, !u.isBlocked)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                            u.isBlocked
                              ? 'bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30'
                              : 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/30'
                          }`}
                          title={u.isBlocked ? 'Lever la suspension' : 'Suspendre'}
                        >
                          {u.isBlocked ? <><CheckCircle size={13} /> Réactiver</> : <><Ban size={13} /> Suspendre</>}
                        </button>
                        <button
                          onClick={() => handleDelete(u.id)}
                          className="w-8 h-8 rounded-lg bg-red-600/10 text-red-400 hover:bg-red-600/20 transition flex items-center justify-center"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>

          ) : (

            /* ── Reports table ── */
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden">
              <div className="px-5 py-3 border-b border-slate-700">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{reports.length} signalements</p>
              </div>
              {reports.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <CheckCircle size={32} className="text-emerald-600" />
                  <p className="text-sm text-slate-500">Aucun signalement en attente</p>
                </div>
              ) : (
                reports.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                    className="flex items-start gap-4 px-5 py-4 border-b border-slate-700/60 hover:bg-slate-700/30 transition last:border-0"
                  >
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      r.status === 'Pending' ? 'bg-orange-500/15 text-orange-400' : 'bg-slate-700 text-slate-500'
                    }`}>
                      <AlertTriangle size={16} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-slate-100">{r.reporterUsername}</span>
                        <span className="text-xs text-slate-500">a signalé</span>
                        <span className="text-sm font-semibold text-red-300">{r.reportedUsername}</span>
                        {r.status === 'Pending'
                          ? <LabelBadge variant="amber">En attente</LabelBadge>
                          : <LabelBadge variant="slate">Traité</LabelBadge>
                        }
                      </div>
                      <p className="text-sm text-slate-400 leading-relaxed">{r.reason}</p>
                      <p className="text-xs text-slate-600 mt-1">
                        {formatDistanceToNow(new Date(r.createdAt), { addSuffix: true, locale: fr })}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
