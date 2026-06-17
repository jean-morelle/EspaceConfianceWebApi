import { useEffect, useRef, useState } from 'react';
import { Hash, Send, Users, LogIn, LogOut as LeaveIcon, Smile, Paperclip } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { roomApi } from '../api/roomApi';
import type { RoomDto, RoomMessageDto } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSignalR } from '../contexts/SignalRContext';
import { Avatar } from '../components/ui/Avatar';
import { Layout } from '../components/layout/Layout';
import toast from 'react-hot-toast';

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

export function RoomsPage() {
  const { user } = useAuth();
  const { joinRoom, leaveRoom, sendRoomMessage, onRoomMessage } = useSignalR();

  const [rooms, setRooms]       = useState<RoomDto[]>([]);
  const [selected, setSelected] = useState<RoomDto | null>(null);
  const [messages, setMessages] = useState<RoomMessageDto[]>([]);
  const [input, setInput]       = useState('');
  const [search, setSearch]     = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => { roomApi.getPublic().then(setRooms).catch(() => {}); }, []);

  useEffect(() => {
    onRoomMessage((msg) => {
      if (msg.roomId === selected?.id) setMessages((prev) => [...prev, msg]);
    });
  }, [selected]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const selectRoom = async (room: RoomDto) => {
    if (selected) leaveRoom(selected.id);
    setSelected(room);
    const msgs = await roomApi.getMessages(room.id).catch(() => []);
    setMessages(msgs);
    joinRoom(room.id);
  };

  const handleJoin = async (room: RoomDto) => {
    try {
      await roomApi.join(room.id);
      setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, isJoined: true, memberCount: r.memberCount + 1 } : r));
      toast.success(`Vous avez rejoint #${room.name}`);
    } catch { toast.error('Impossible de rejoindre ce salon.'); }
  };

  const handleLeave = async (room: RoomDto) => {
    try {
      await roomApi.leave(room.id);
      setRooms((prev) => prev.map((r) => r.id === room.id ? { ...r, isJoined: false, memberCount: r.memberCount - 1 } : r));
      if (selected?.id === room.id) { setSelected(null); setMessages([]); }
      toast.success(`Vous avez quitté #${room.name}`);
    } catch { toast.error('Erreur en quittant le salon.'); }
  };

  const handleSend = async () => {
    if (!input.trim() || !selected) return;
    const content = input.trim();
    setInput('');
    try { await sendRoomMessage(selected.id, content); }
    catch { toast.error("Erreur lors de l'envoi."); }
  };

  const filtered = rooms.filter((r) => r.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <Layout>
      <div className="flex h-full">

        {/* Room list */}
        <div className="w-[240px] shrink-0 bg-slate-800/40 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 shrink-0">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Salons publics</h2>
            <div>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition"
                placeholder="Chercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filtered.map((room) => (
              <div key={room.id} className="group relative mb-0.5">
                <button
                  onClick={() => selectRoom(room)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-left transition-all ${
                    selected?.id === room.id
                      ? 'bg-violet-600/20 text-violet-200'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Hash size={14} className={`shrink-0 ${selected?.id === room.id ? 'text-violet-400' : 'text-slate-600'}`} />
                  <span className="text-sm font-medium truncate flex-1">{room.name}</span>
                  {room.isJoined && (
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                  )}
                </button>
                {/* hover actions */}
                <div className="absolute right-1 top-1/2 -translate-y-1/2 hidden group-hover:flex gap-0.5 bg-slate-800 rounded-lg border border-slate-700 p-0.5">
                  <span className="text-[10px] text-slate-600 flex items-center gap-0.5 px-1.5">
                    <Users size={9} /> {room.memberCount}
                  </span>
                  {room.isJoined ? (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleLeave(room); }}
                      className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition"
                      title="Quitter"
                    >
                      <LeaveIcon size={11} />
                    </button>
                  ) : (
                    <button
                      onClick={(e) => { e.stopPropagation(); handleJoin(room); }}
                      className="p-1 rounded text-slate-500 hover:text-emerald-400 hover:bg-emerald-400/10 transition"
                      title="Rejoindre"
                    >
                      <LogIn size={11} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat */}
        {selected ? (
          <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
            {/* Header */}
            <div className="h-14 bg-slate-800/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-5 shrink-0">
              <div className="flex items-center gap-2">
                <Hash size={18} className="text-violet-400 shrink-0" />
                <span className="font-bold text-slate-100 text-sm">{selected.name}</span>
                {selected.description && (
                  <span className="text-sm text-slate-500 border-l border-slate-700 pl-3 truncate hidden xl:block">
                    {selected.description}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1.5">
                <Users size={13} />
                <span>{selected.memberCount} membres</span>
              </div>
            </div>

            {/* Messages — flat Discord style for rooms */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {messages.map((msg, i) => {
                const isMe = msg.senderId === user?.id;
                const prev = messages[i - 1];
                const showHeader = !prev
                  || prev.senderId !== msg.senderId
                  || (new Date(msg.sentAt).getTime() - new Date(prev.sentAt).getTime()) > 5 * 60_000;

                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.15 }}
                    className={`flex items-start gap-3 group hover:bg-slate-800/30 rounded-lg px-2 -mx-2 py-0.5 ${showHeader ? 'mt-4' : 'mt-0.5'}`}
                  >
                    <div className="w-9 shrink-0 mt-0.5">
                      {showHeader ? (
                        <Avatar src={msg.senderProfilePicture} username={msg.senderUsername} size="sm" />
                      ) : (
                        <span className="text-[10px] text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity block text-center leading-8 select-none">
                          {fmtTime(msg.sentAt)}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      {showHeader && (
                        <div className="flex items-baseline gap-2 mb-0.5">
                          <span className={`text-sm font-semibold ${isMe ? 'text-violet-400' : 'text-slate-200'}`}>
                            {msg.senderUsername}
                          </span>
                          <span className="text-[11px] text-slate-600">
                            {formatDistanceToNow(new Date(msg.sentAt), { addSuffix: true, locale: fr })}
                          </span>
                        </div>
                      )}
                      <p className="text-sm text-slate-300 break-words leading-relaxed">{msg.content}</p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            {selected.isJoined ? (
              <div className="px-5 pb-5 pt-2 shrink-0">
                <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 focus-within:border-violet-500/50 transition-colors">
                  <button className="text-slate-500 hover:text-slate-300 transition shrink-0">
                    <Paperclip size={18} />
                  </button>
                  <input
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none py-1"
                    placeholder={`Message dans #${selected.name}`}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="text-slate-500 hover:text-slate-300 transition">
                      <Smile size={18} />
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 text-white flex items-center justify-center transition-all"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 flex items-center justify-center gap-4 bg-slate-800/50 border-t border-slate-800 shrink-0">
                <p className="text-sm text-slate-400">Rejoignez ce salon pour participer à la discussion.</p>
                <button
                  onClick={() => handleJoin(selected)}
                  className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 text-white px-4 py-2 rounded-lg text-sm font-semibold transition shadow-lg shadow-violet-900/30"
                >
                  <LogIn size={15} /> Rejoindre
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-900 select-none">
            <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <Hash size={32} className="text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-300">Aucun salon sélectionné</p>
              <p className="text-sm text-slate-500 mt-1">Rejoignez un salon pour commencer à discuter</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
