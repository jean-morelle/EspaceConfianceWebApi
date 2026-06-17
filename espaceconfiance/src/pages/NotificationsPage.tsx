import { useEffect, useState } from 'react';
import { Bell, Check, MessageCircle, UserPlus, UserCheck, Headphones, AlertTriangle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { notificationApi } from '../api/notificationApi';
import type { NotificationDto } from '../types';
import { Layout } from '../components/layout/Layout';
import toast from 'react-hot-toast';

const TYPE_CONFIG: Record<string, { icon: React.ReactNode; color: string; bg: string }> = {
  NewMessage:            { icon: <MessageCircle size={15} />, color: 'text-indigo-400',  bg: 'bg-indigo-500/15 border-indigo-500/25' },
  FriendRequest:         { icon: <UserPlus size={15} />,      color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/25' },
  FriendRequestAccepted: { icon: <UserCheck size={15} />,     color: 'text-teal-400',    bg: 'bg-teal-500/15 border-teal-500/25' },
  ListenerRequest:       { icon: <Headphones size={15} />,    color: 'text-violet-400',  bg: 'bg-violet-500/15 border-violet-500/25' },
  SystemAlert:           { icon: <AlertTriangle size={15} />, color: 'text-amber-400',   bg: 'bg-amber-500/15 border-amber-500/25' },
};
const DEFAULT_CFG = { icon: <Bell size={15} />, color: 'text-slate-400', bg: 'bg-slate-700 border-slate-600' };

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationDto[]>([]);

  useEffect(() => {
    notificationApi.getAll().then(setNotifications).catch(() => {});
  }, []);

  const markAllRead = async () => {
    try {
      await notificationApi.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      toast.success('Toutes les notifications marquées comme lues.');
    } catch { toast.error('Erreur.'); }
  };

  const unread = notifications.filter((n) => !n.isRead).length;

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-900">

        {/* Header */}
        <div className="h-14 bg-slate-800/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-5 shrink-0">
          <div className="flex items-center gap-3">
            <Bell size={18} className="text-slate-400" />
            <span className="font-bold text-slate-100 text-sm">Notifications</span>
            {unread > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full font-bold tabular-nums leading-none">
                {unread}
              </span>
            )}
          </div>
          {unread > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 transition px-3 py-1.5 rounded-lg hover:bg-slate-700 font-medium"
            >
              <Check size={13} /> Tout marquer comme lu
            </button>
          )}
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-3 select-none">
              <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center">
                <Bell size={24} className="text-slate-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-400">Aucune notification</p>
                <p className="text-xs text-slate-600 mt-1">Vous êtes à jour !</p>
              </div>
            </div>
          ) : (
            notifications.map((n, i) => {
              const cfg = TYPE_CONFIG[n.type] ?? DEFAULT_CFG;
              return (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.03 }}
                  className={`flex items-start gap-4 px-5 py-4 border-b border-slate-800/60 hover:bg-slate-800/30 transition cursor-default ${
                    !n.isRead ? 'bg-violet-500/[0.04]' : ''
                  }`}
                >
                  {/* Icon */}
                  <div className={`w-10 h-10 rounded-xl border ${cfg.bg} ${cfg.color} flex items-center justify-center shrink-0 mt-0.5`}>
                    {cfg.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-slate-100">{n.title}</span>
                      <span className="text-xs text-slate-600 shrink-0">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true, locale: fr })}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400 mt-0.5 leading-relaxed">{n.content}</p>
                  </div>

                  {/* Unread dot */}
                  {!n.isRead && (
                    <div className="w-2 h-2 rounded-full bg-violet-500 shrink-0 mt-2.5" />
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </Layout>
  );
}
