import { useEffect, useState } from 'react';
import { UserPlus, Check, X, UserMinus, MessageSquare, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { friendApi } from '../api/friendApi';
import { userApi } from '../api/userApi';
import { conversationApi } from '../api/conversationApi';
import type { FriendRequestDto, UserDto } from '../types';
import { Avatar } from '../components/ui/Avatar';
import { LabelBadge } from '../components/ui/Badge';
import { Layout } from '../components/layout/Layout';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

type Tab = 'all' | 'online' | 'pending' | 'search';

const TABS: { id: Tab; label: string }[] = [
  { id: 'all',     label: 'Tous' },
  { id: 'online',  label: 'En ligne' },
  { id: 'pending', label: 'En attente' },
  { id: 'search',  label: '+ Ajouter un ami' },
];

export function FriendsPage() {
  const navigate = useNavigate();
  const [tab, setTab]                     = useState<Tab>('all');
  const [friends, setFriends]             = useState<UserDto[]>([]);
  const [requests, setRequests]           = useState<FriendRequestDto[]>([]);
  const [searchQuery, setSearchQuery]     = useState('');
  const [searchResults, setSearchResults] = useState<UserDto[]>([]);
  const [isSearching, setIsSearching]     = useState(false);
  const [friendSearch, setFriendSearch]   = useState('');

  useEffect(() => {
    friendApi.getFriends().then(setFriends).catch(() => {});
    friendApi.getPendingRequests().then(setRequests).catch(() => {});
  }, []);

  const handleSearch = async () => {
    if (searchQuery.length < 2) return;
    setIsSearching(true);
    try { setSearchResults(await userApi.search(searchQuery)); }
    catch { toast.error('Erreur de recherche.'); }
    finally { setIsSearching(false); }
  };

  const handleSendRequest = async (userId: string) => {
    try { await friendApi.sendRequest(userId); toast.success("Demande d'ami envoyée !"); }
    catch (err: unknown) {
      toast.error((err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Erreur');
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await friendApi.accept(requestId);
      const [r, f] = await Promise.all([friendApi.getPendingRequests(), friendApi.getFriends()]);
      setRequests(r); setFriends(f);
      toast.success('Demande acceptée !');
    } catch { toast.error('Erreur.'); }
  };

  const handleDecline = async (requestId: string) => {
    try { await friendApi.decline(requestId); setRequests((p) => p.filter((r) => r.id !== requestId)); }
    catch { toast.error('Erreur.'); }
  };

  const handleRemove = async (friendId: string) => {
    try {
      await friendApi.remove(friendId);
      setFriends((p) => p.filter((f) => f.id !== friendId));
      toast.success('Ami supprimé.');
    } catch { toast.error('Erreur.'); }
  };

  const openChat = async (userId: string) => {
    try {
      const conv = await conversationApi.getOrCreate(userId);
      navigate('/chat', { state: { conversationId: conv.id } });
    } catch { toast.error('Erreur.'); }
  };

  const visibleFriends = friends.filter((f) => {
    const match = f.username.toLowerCase().includes(friendSearch.toLowerCase());
    if (tab === 'online') return match && f.isOnline;
    return match;
  });

  return (
    <Layout>
      <div className="flex flex-col h-full bg-slate-900">

        {/* Topbar */}
        <div className="h-14 bg-slate-800/80 backdrop-blur border-b border-slate-800 flex items-center gap-1 px-5 shrink-0">
          <Users size={18} className="text-slate-400 mr-2 shrink-0" />
          <span className="font-bold text-slate-100 text-sm mr-4">Amis</span>
          <span className="w-px h-5 bg-slate-700 mr-4" />

          {TABS.map((t) => {
            const count = t.id === 'all' ? friends.length : t.id === 'online' ? friends.filter(f => f.isOnline).length : t.id === 'pending' ? requests.length : undefined;
            return (
              <button key={t.id} onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  tab === t.id
                    ? 'bg-violet-600/20 text-violet-300'
                    : t.id === 'search'
                      ? 'text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300'
                      : 'text-slate-400 hover:bg-slate-700 hover:text-slate-200'
                }`}
              >
                {t.label}
                {count !== undefined && count > 0 && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold leading-none ${tab === t.id ? 'bg-violet-500/30 text-violet-300' : 'bg-slate-700 text-slate-400'}`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}

          {(tab === 'all' || tab === 'online') && (
            <div className="ml-auto">
              <input
                className="bg-slate-900 border border-slate-700 text-sm text-slate-300 px-3 py-1.5 rounded-lg w-48 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition"
                placeholder="Filtrer les amis…"
                value={friendSearch}
                onChange={(e) => setFriendSearch(e.target.value)}
              />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {(tab === 'all' || tab === 'online') && (
            <>
              <div className="px-5 py-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  {tab === 'online' ? 'En ligne' : 'Tous les amis'} — {visibleFriends.length}
                </span>
              </div>
              {visibleFriends.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <Users size={32} className="text-slate-700" />
                  <p className="text-sm text-slate-500">
                    {friendSearch ? 'Aucun résultat' : tab === 'online' ? 'Aucun ami en ligne' : "Vous n'avez pas encore d'amis"}
                  </p>
                </div>
              ) : (
                visibleFriends.map((f, i) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center gap-4 px-5 py-3 border-b border-slate-800/60 hover:bg-slate-800/40 transition group cursor-default"
                  >
                    <Avatar src={f.profilePicture} username={f.username} size="md" isOnline={f.isOnline} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-100 text-sm">{f.username}</p>
                        {f.isListener && <LabelBadge variant="violet">Écoutant</LabelBadge>}
                      </div>
                      <p className={`text-xs mt-0.5 ${f.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                        {f.isOnline ? '● En ligne' : '● Hors ligne'}
                      </p>
                    </div>
                    <div className="hidden group-hover:flex items-center gap-1.5">
                      <button onClick={() => openChat(f.id)}
                        className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-violet-600 text-slate-300 hover:text-white transition flex items-center justify-center"
                        title="Envoyer un message">
                        <MessageSquare size={15} />
                      </button>
                      <button onClick={() => handleRemove(f.id)}
                        className="w-9 h-9 rounded-xl bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white transition flex items-center justify-center"
                        title="Supprimer cet ami">
                        <UserMinus size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </>
          )}

          {tab === 'pending' && (
            <>
              <div className="px-5 py-3 border-b border-slate-800">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Demandes entrantes — {requests.length}
                </span>
              </div>
              {requests.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 gap-3">
                  <Check size={32} className="text-slate-700" />
                  <p className="text-sm text-slate-500">Aucune demande en attente</p>
                </div>
              ) : (
                requests.map((r) => (
                  <div key={r.id} className="flex items-center gap-4 px-5 py-3 border-b border-slate-800/60 hover:bg-slate-800/40 transition">
                    <Avatar src={r.senderProfilePicture} username={r.senderUsername} size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-100 text-sm">{r.senderUsername}</p>
                      <p className="text-xs text-slate-500">Demande d'ami entrante</p>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={() => handleAccept(r.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg transition">
                        <Check size={13} /> Accepter
                      </button>
                      <button onClick={() => handleDecline(r.id)}
                        className="w-8 h-8 rounded-lg bg-slate-700 hover:bg-red-600 text-slate-300 hover:text-white transition flex items-center justify-center"
                        title="Refuser">
                        <X size={14} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </>
          )}

          {tab === 'search' && (
            <div className="p-6 max-w-2xl">
              <div className="bg-slate-800 border border-slate-700 rounded-2xl p-6 mb-6">
                <h2 className="text-base font-bold text-slate-100 mb-1">Ajouter un ami</h2>
                <p className="text-sm text-slate-400 mb-4">Recherchez par nom d'utilisateur exact.</p>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <input
                      className="w-full bg-slate-900 border border-slate-700 focus:border-violet-500 text-slate-100 px-3.5 py-2.5 rounded-xl text-sm placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition"
                      placeholder="Entrez un nom d'utilisateur…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    />
                  </div>
                  <button
                    onClick={handleSearch}
                    disabled={isSearching || searchQuery.length < 2}
                    className="bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition shadow-lg shadow-violet-900/30 whitespace-nowrap"
                  >
                    {isSearching ? '…' : 'Chercher'}
                  </button>
                </div>
              </div>

              {searchResults.length > 0 && (
                <>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                    Résultats — {searchResults.length}
                  </p>
                  <div className="space-y-2">
                    {searchResults.map((u) => (
                      <div key={u.id} className="flex items-center gap-4 p-4 bg-slate-800 border border-slate-700 rounded-xl hover:border-slate-600 transition">
                        <Avatar src={u.profilePicture} username={u.username} size="md" isOnline={u.isOnline} />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-100 text-sm">{u.username}</p>
                          <p className="text-xs text-slate-500 mt-0.5">
                            {u.isListener ? '🎧 Écoutant' : u.isOnline ? '● En ligne' : '● Hors ligne'}
                          </p>
                        </div>
                        <button onClick={() => handleSendRequest(u.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold rounded-lg transition shrink-0">
                          <UserPlus size={13} /> Ajouter
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
