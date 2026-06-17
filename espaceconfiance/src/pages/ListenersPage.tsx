import { useEffect, useState } from 'react';
import { Headphones, MessageSquare, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { conversationApi } from '../api/conversationApi';
import type { UserDto } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { LabelBadge } from '../components/ui/Badge';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axiosConfig';

export function ListenersPage() {
  const navigate = useNavigate();
  const [listeners, setListeners] = useState<UserDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch]       = useState('');

  useEffect(() => {
    api.get<UserDto[]>('/listeners')
      .then((r) => setListeners(r.data))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const requestListener = async (listenerId: string) => {
    try { await api.post(`/listeners/${listenerId}/request`); toast.success("Demande envoyée à l'écoutant !"); }
    catch { toast.error("Impossible d'envoyer la demande."); }
  };

  const openChat = async (listenerId: string) => {
    try {
      const conv = await conversationApi.getOrCreate(listenerId);
      navigate('/chat', { state: { conversationId: conv.id } });
    } catch { toast.error('Erreur.'); }
  };

  const filtered = listeners.filter((l) =>
    l.username.toLowerCase().includes(search.toLowerCase()) ||
    (l.bio ?? '').toLowerCase().includes(search.toLowerCase())
  );
  const available = filtered.filter((l) => l.isOnline);
  const featured  = available[0] ?? null;
  const rest      = filtered.filter((l) => l !== featured);

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-900">

        {/* Header */}
        <div className="h-14 bg-slate-800/80 backdrop-blur border-b border-slate-800 flex items-center gap-3 px-5 shrink-0">
          <Headphones size={18} className="text-violet-400 shrink-0" />
          <span className="font-bold text-slate-100 text-sm">Écoutants disponibles</span>
          {!isLoading && <span className="text-xs text-slate-500">— {filtered.length}</span>}
          <div className="ml-auto">
            <input
              className="bg-slate-900 border border-slate-700 text-sm text-slate-300 px-3 py-1.5 rounded-lg w-56 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition"
              placeholder="Chercher un écoutant…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3">
              <Headphones size={32} className="text-slate-700" />
              <p className="text-sm text-slate-500">
                {search ? 'Aucun résultat' : 'Aucun écoutant disponible pour le moment'}
              </p>
            </div>
          ) : (
            <>
              {/* Featured */}
              {featured && (
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-gradient-to-r from-violet-900/50 to-indigo-900/30 border border-violet-700/40 rounded-2xl p-6 mb-6 flex items-center gap-6"
                >
                  <Avatar src={featured.profilePicture} username={featured.username} size="xl" isOnline={featured.isOnline} ringColor="border-slate-900" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="font-bold text-slate-100 text-lg">{featured.username}</h2>
                      <LabelBadge variant="emerald">● Disponible</LabelBadge>
                      <LabelBadge variant="violet">Mis en avant</LabelBadge>
                    </div>
                    <div className="flex items-center gap-1 mb-2">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                      ))}
                      <span className="text-xs text-slate-400 ml-1">4.9 · Écoutant certifié</span>
                    </div>
                    {featured.bio && (
                      <p className="text-sm text-slate-300 leading-relaxed line-clamp-2">{featured.bio}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 shrink-0">
                    <button onClick={() => openChat(featured.id)}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold rounded-xl transition shadow-lg shadow-violet-900/30">
                      <MessageSquare size={15} /> Contacter
                    </button>
                    <button onClick={() => requestListener(featured.id)}
                      className="flex items-center gap-2 px-4 py-2 border border-violet-500/40 text-violet-300 hover:bg-violet-500/10 text-sm font-medium rounded-xl transition">
                      <Headphones size={15} /> Demander
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Grid */}
              {rest.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Tous les écoutants</p>
                  <div className="grid grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4">
                    {rest.map((l, i) => (
                      <motion.div
                        key={l.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.06 }}
                        className="bg-slate-800 border border-slate-700 hover:border-slate-600 rounded-2xl p-5 flex flex-col gap-4 transition group"
                      >
                        <div className="flex items-start gap-3">
                          <Avatar src={l.profilePicture} username={l.username} size="md" isOnline={l.isOnline} />
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-slate-100 text-sm leading-tight truncate">{l.username}</p>
                            <div className="mt-1">
                              {l.isOnline
                                ? <LabelBadge variant="emerald">● Disponible</LabelBadge>
                                : <LabelBadge variant="slate">🌙 Occupé</LabelBadge>
                              }
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, idx) => (
                            <Star key={idx} size={10} className="text-amber-400 fill-amber-400" />
                          ))}
                          <span className="text-[11px] text-slate-500 ml-1">4.8</span>
                        </div>

                        {l.bio ? (
                          <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{l.bio}</p>
                        ) : (
                          <p className="text-xs text-slate-600 italic">Aucune description</p>
                        )}

                        <div className="flex gap-2 mt-auto">
                          <button
                            onClick={() => openChat(l.id)}
                            disabled={!l.isOnline}
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold rounded-lg transition"
                          >
                            <MessageSquare size={12} /> Contacter
                          </button>
                          <button
                            onClick={() => requestListener(l.id)}
                            className="w-8 h-8 rounded-lg border border-slate-600 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition flex items-center justify-center"
                            title="Envoyer une demande"
                          >
                            <Headphones size={13} />
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
