import { useEffect, useRef, useState } from 'react';
import {
  Search, Send, Phone, Video, MoreHorizontal,
  MessageSquare, Smile, Paperclip, CheckCheck, Info,
  Hash, Calendar, Globe,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { conversationApi } from '../api/conversationApi';
import type { ConversationDto, MessageDto } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { useSignalR } from '../contexts/SignalRContext';
import { Avatar } from '../components/ui/Avatar';
import { LabelBadge } from '../components/ui/Badge';
import { Layout } from '../components/layout/Layout';
import toast from 'react-hot-toast';

function fmtTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function fmtDateDivider(iso: string) {
  const d = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return "Aujourd'hui";
  if (d.toDateString() === yesterday.toDateString()) return 'Hier';
  return d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
}

type Participant = {
  userId: string;
  username: string;
  profilePicture?: string;
  isOnline?: boolean;
  bio?: string;
  isListener?: boolean;
  joinedAt?: string;
};

function UserInfoPanel({ other }: { other: Participant }) {
  return (
    <div className="w-[300px] shrink-0 bg-slate-900 border-l border-slate-800 flex flex-col overflow-y-auto">
      <div className="h-20 bg-gradient-to-br from-violet-900 to-indigo-900 shrink-0" />
      <div className="px-5 pb-4 -mt-10 shrink-0">
        <div className="ring-4 ring-slate-900 rounded-full inline-block mb-3">
          <Avatar src={other.profilePicture} username={other.username} size="xl" isOnline={other.isOnline} ringColor="border-slate-900" />
        </div>
        <h2 className="text-slate-100 font-bold text-lg leading-tight">{other.username}</h2>
        <p className={`text-sm mt-0.5 font-medium ${other.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
          {other.isOnline ? '● En ligne' : '● Hors ligne'}
        </p>
      </div>

      <div className="px-4 space-y-3 pb-6">
        {other.bio && (
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">À propos</p>
            <p className="text-sm text-slate-300 leading-relaxed">{other.bio}</p>
          </div>
        )}
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-3">Rôles</p>
          <div className="flex flex-wrap gap-1.5">
            {other.isListener && <LabelBadge variant="violet">🎧 Écoutant</LabelBadge>}
            <LabelBadge variant="indigo">Membre</LabelBadge>
          </div>
        </div>
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 space-y-3">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Informations</p>
          <div className="flex items-center gap-2.5 text-sm text-slate-300">
            <Globe size={14} className="text-slate-500 shrink-0" />
            <span>Francophone</span>
          </div>
          {other.joinedAt && (
            <div className="flex items-center gap-2.5 text-sm text-slate-300">
              <Calendar size={14} className="text-slate-500 shrink-0" />
              <span>Membre depuis {new Date(other.joinedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatPage() {
  const { user } = useAuth();
  const { joinConversation, leaveConversation, sendPrivateMessage, sendTyping, onMessage, onTyping } = useSignalR();

  const [conversations, setConversations] = useState<ConversationDto[]>([]);
  const [selected, setSelected]           = useState<ConversationDto | null>(null);
  const [messages, setMessages]           = useState<MessageDto[]>([]);
  const [input, setInput]                 = useState('');
  const [search, setSearch]               = useState('');
  const [typingUser, setTypingUser]       = useState(false);
  const [showInfo, setShowInfo]           = useState(true);
  const [typingTimeout, setTypingTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    conversationApi.getAll().then(setConversations).catch(() => {});
  }, []);

  useEffect(() => {
    onMessage((msg) => {
      if (msg.conversationId === selected?.id) setMessages((prev) => [...prev, msg]);
      setConversations((prev) =>
        prev.map((c) => c.id === msg.conversationId ? { ...c, lastMessage: msg } : c)
      );
    });
  }, [selected]);

  useEffect(() => { onTyping(({ isTyping }) => setTypingUser(isTyping)); }, []);

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const selectConversation = async (conv: ConversationDto) => {
    if (selected) leaveConversation(selected.id);
    setSelected(conv);
    const msgs = await conversationApi.getMessages(conv.id).catch(() => []);
    setMessages(msgs);
    conversationApi.markRead(conv.id).catch(() => {});
    joinConversation(conv.id);
  };

  const handleSend = async () => {
    if (!input.trim() || !selected) return;
    const content = input.trim();
    setInput('');
    try { await sendPrivateMessage(selected.id, content); }
    catch { toast.error("Erreur lors de l'envoi."); }
  };

  const handleTyping = (val: string) => {
    setInput(val);
    if (!selected) return;
    sendTyping(selected.id, true);
    if (typingTimeout) clearTimeout(typingTimeout);
    setTypingTimeout(setTimeout(() => sendTyping(selected.id, false), 2000));
  };

  const getOther = (conv: ConversationDto) =>
    conv.participants.find((p) => p.userId !== user?.id);

  const filtered = conversations.filter((c) => {
    const o = getOther(c);
    return o?.username.toLowerCase().includes(search.toLowerCase());
  });

  return (
    <Layout>
      <div className="flex h-full">

        {/* Conversation list */}
        <div className="w-[280px] shrink-0 bg-slate-800/40 border-r border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-800 shrink-0">
            <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Messages directs</h2>
            <div>
              <input
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-300 placeholder-slate-600 focus:outline-none focus:border-violet-500/60 transition"
                placeholder="Chercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filtered.map((conv) => {
              const other = getOther(conv);
              if (!other) return null;
              const isActive = selected?.id === conv.id;
              return (
                <button
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl mb-0.5 text-left transition-all ${
                    isActive
                      ? 'bg-violet-600/20 text-slate-100'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <Avatar src={other.profilePicture} username={other.username} size="md" isOnline={other.isOnline} />
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm truncate ${isActive ? 'text-violet-200' : ''}`}>{other.username}</p>
                    {conv.lastMessage && (
                      <p className="text-xs text-slate-600 truncate">{conv.lastMessage.content}</p>
                    )}
                  </div>
                  {conv.unreadCount > 0 && (
                    <span className="bg-violet-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center shrink-0 leading-none">
                      {conv.unreadCount > 9 ? '9+' : conv.unreadCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Chat area */}
        {selected ? (() => {
          const other = getOther(selected);
          return (
            <div className="flex-1 flex flex-col min-w-0 bg-slate-900">
              {/* Header */}
              <div className="h-14 bg-slate-800/80 backdrop-blur border-b border-slate-800 flex items-center justify-between px-5 shrink-0">
                <div className="flex items-center gap-3">
                  <Avatar src={other?.profilePicture} username={other?.username ?? '?'} size="sm" isOnline={other?.isOnline} />
                  <div>
                    <p className="font-semibold text-slate-100 text-sm leading-tight">{other?.username}</p>
                    <p className={`text-[11px] leading-tight ${typingUser ? 'text-violet-400' : other?.isOnline ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {typingUser ? "en train d'écrire…" : other?.isOnline ? 'En ligne' : 'Hors ligne'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {[{ icon: <Phone size={17} />, title: 'Appel' }, { icon: <Video size={17} />, title: 'Vidéo' }, { icon: <MoreHorizontal size={17} />, title: 'Plus' }].map(({ icon, title }) => (
                    <button key={title} title={title}
                      className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700 transition">
                      {icon}
                    </button>
                  ))}
                  <button onClick={() => setShowInfo(v => !v)} title="Informations"
                    className={`w-9 h-9 rounded-lg flex items-center justify-center transition ${showInfo ? 'text-violet-400 bg-violet-500/15' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}>
                    <Info size={17} />
                  </button>
                </div>
              </div>

              {/* Messages — Messenger bubbles */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-0.5">
                {messages.map((msg, i) => {
                  const isMe = msg.senderId === user?.id;
                  const prev = messages[i - 1];
                  const next = messages[i + 1];
                  const showDateDiv = !prev || new Date(msg.sentAt).toDateString() !== new Date(prev.sentAt).toDateString();
                  const isGroupStart = !prev || prev.senderId !== msg.senderId
                    || (new Date(msg.sentAt).getTime() - new Date(prev.sentAt).getTime()) > 5 * 60_000
                    || showDateDiv;
                  const isGroupEnd = !next
                    || next.senderId !== msg.senderId
                    || (new Date(next.sentAt).getTime() - new Date(msg.sentAt).getTime()) > 5 * 60_000;

                  return (
                    <div key={msg.id}>
                      {showDateDiv && (
                        <div className="flex items-center gap-3 my-6">
                          <div className="flex-1 h-px bg-slate-800" />
                          <span className="text-xs text-slate-500 font-medium px-3 py-1 bg-slate-800 rounded-full select-none">
                            <Hash size={9} className="inline mr-1 opacity-60" />{fmtDateDivider(msg.sentAt)}
                          </span>
                          <div className="flex-1 h-px bg-slate-800" />
                        </div>
                      )}

                      <motion.div
                        className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'} ${isGroupStart ? 'mt-4' : 'mt-0.5'}`}
                        initial={{ opacity: 0, y: 5 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        {/* Avatar only at bottom of group */}
                        <div className="w-8 shrink-0 self-end">
                          {isGroupEnd && !isMe ? (
                            <Avatar src={msg.senderProfilePicture} username={msg.senderUsername} size="sm" />
                          ) : (
                            <span />
                          )}
                        </div>

                        <div className={`flex flex-col gap-0.5 ${isMe ? 'items-end' : 'items-start'} max-w-[65%]`}>
                          {isGroupStart && !isMe && (
                            <span className="text-xs font-semibold text-slate-400 ml-1 mb-0.5">{msg.senderUsername}</span>
                          )}
                          <div className={`px-4 py-2.5 text-sm leading-relaxed break-words ${
                            isMe
                              ? `bg-violet-600 text-white shadow-sm shadow-violet-900/30 ${isGroupStart ? 'rounded-2xl rounded-br-md' : isGroupEnd ? 'rounded-2xl rounded-br-md' : 'rounded-2xl rounded-r-md'}`
                              : `bg-slate-800 border border-slate-700 text-slate-200 shadow-sm ${isGroupStart ? 'rounded-2xl rounded-bl-md' : isGroupEnd ? 'rounded-2xl rounded-bl-md' : 'rounded-2xl rounded-l-md'}`
                          }`}>
                            {msg.content}
                          </div>
                          {isGroupEnd && (
                            <div className={`flex items-center gap-1.5 px-1 ${isMe ? 'flex-row-reverse' : ''}`}>
                              <span className="text-[10px] text-slate-600">{fmtTime(msg.sentAt)}</span>
                              {isMe && <CheckCheck size={12} className="text-violet-400" />}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    </div>
                  );
                })}

                {typingUser && (
                  <div className="flex items-end gap-2.5 mt-4">
                    <div className="w-8 shrink-0">
                      <Avatar src={other?.profilePicture} username={other?.username ?? '?'} size="sm" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-bl-md px-4 py-3 flex gap-1 items-center">
                      {[0, 160, 320].map((d) => (
                        <span key={d} className="w-1.5 h-1.5 rounded-full bg-slate-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                      ))}
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="px-5 pb-5 pt-2 shrink-0">
                <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 rounded-2xl px-4 py-2 focus-within:border-violet-500/50 transition-colors">
                  <button className="text-slate-500 hover:text-slate-300 transition shrink-0">
                    <Paperclip size={18} />
                  </button>
                  <input
                    className="flex-1 bg-transparent text-sm text-slate-200 placeholder-slate-600 focus:outline-none py-1"
                    placeholder={`Message @${other?.username ?? '…'}`}
                    value={input}
                    onChange={(e) => handleTyping(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  />
                  <div className="flex items-center gap-2 shrink-0">
                    <button className="text-slate-500 hover:text-slate-300 transition">
                      <Smile size={18} />
                    </button>
                    <button
                      onClick={handleSend}
                      disabled={!input.trim()}
                      className="w-8 h-8 rounded-xl bg-violet-600 hover:bg-violet-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all"
                    >
                      <Send size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })() : (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 bg-slate-900 select-none">
            <div className="w-20 h-20 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center">
              <MessageSquare size={32} className="text-slate-600" />
            </div>
            <div className="text-center">
              <p className="text-base font-semibold text-slate-300">Vos messages</p>
              <p className="text-sm text-slate-500 mt-1 max-w-xs">Sélectionnez une conversation pour commencer à discuter</p>
            </div>
          </div>
        )}

        {/* Right info panel */}
        <AnimatePresence>
          {selected && showInfo && (() => {
            const other = getOther(selected);
            if (!other) return null;
            return (
              <motion.div key="info"
                initial={{ width: 0, opacity: 0 }}
                animate={{ width: 300, opacity: 1 }}
                exit={{ width: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: 'easeInOut' }}
                className="shrink-0 overflow-hidden"
              >
                <UserInfoPanel other={other} />
              </motion.div>
            );
          })()}
        </AnimatePresence>
      </div>
    </Layout>
  );
}
