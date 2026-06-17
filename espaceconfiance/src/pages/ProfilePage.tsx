import { useEffect, useState } from 'react';
import { Camera, Save, Headphones, User, Mail, Shield, Lock } from 'lucide-react';
import { userApi } from '../api/userApi';
import type { UserDto } from '../types';
import { useAuth } from '../contexts/AuthContext';
import { Avatar } from '../components/ui/Avatar';
import { Input } from '../components/ui/Input';
import { LabelBadge } from '../components/ui/Badge';
import { Layout } from '../components/layout/Layout';
import toast from 'react-hot-toast';

type Section = 'profile' | 'listener' | 'privacy';

const SECTIONS: { id: Section; label: string; icon: React.ReactNode; group: string }[] = [
  { id: 'profile',  label: 'Mon profil',     icon: <User size={15} />,      group: 'Mon compte' },
  { id: 'privacy',  label: 'Confidentialité', icon: <Shield size={15} />,    group: 'Mon compte' },
  { id: 'listener', label: 'Mode écoutant',   icon: <Headphones size={15} />, group: 'Application' },
];

export function ProfilePage() {
  useAuth();
  const [activeSection, setActiveSection]         = useState<Section>('profile');
  const [profile, setProfile]                     = useState<UserDto | null>(null);
  const [form, setForm]                           = useState({ username: '', bio: '' });
  const [isSaving, setIsSaving]                   = useState(false);
  const [isTogglingListener, setIsTogglingListener] = useState(false);

  useEffect(() => {
    userApi.getMe().then((data) => {
      setProfile(data);
      setForm({ username: data.username, bio: data.bio ?? '' });
    }).catch(() => {});
  }, []);

  const handleSave = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userApi.updateProfile({ username: form.username, bio: form.bio });
      setProfile(updated);
      toast.success('Profil mis à jour !');
    } catch { toast.error('Erreur lors de la mise à jour.'); }
    finally { setIsSaving(false); }
  };

  const handleToggleListener = async () => {
    setIsTogglingListener(true);
    try {
      await userApi.toggleListener();
      setProfile((prev) => prev ? { ...prev, isListener: !prev.isListener } : prev);
      toast.success(profile?.isListener ? 'Mode écoutant désactivé.' : 'Mode écoutant activé !');
    } catch { toast.error('Erreur.'); }
    finally { setIsTogglingListener(false); }
  };

  if (!profile) return (
    <Layout>
      <div className="flex items-center justify-center h-full bg-slate-900">
        <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
      </div>
    </Layout>
  );

  const groups = [...new Set(SECTIONS.map((s) => s.group))];

  return (
    <Layout>
      <div className="flex h-full bg-slate-900">

        {/* Settings nav */}
        <div className="w-[240px] shrink-0 bg-slate-800/40 border-r border-slate-800 p-4 overflow-y-auto">
          {groups.map((group) => (
            <div key={group} className="mb-4">
              <p className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider px-3 mb-1.5">{group}</p>
              {SECTIONS.filter((s) => s.group === group).map((s) => (
                <button
                  key={s.id}
                  onClick={() => setActiveSection(s.id)}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-all mb-0.5 ${
                    activeSection === s.id
                      ? 'bg-violet-600/20 text-violet-300'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <span className={`shrink-0 ${activeSection === s.id ? 'text-violet-400' : 'text-slate-600'}`}>{s.icon}</span>
                  {s.label}
                </button>
              ))}
            </div>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* Profile section */}
          {activeSection === 'profile' && (
            <div className="flex h-full min-h-full">
              {/* Edit form */}
              <div className="flex-1 px-10 py-10 overflow-y-auto max-w-2xl">
                <h1 className="text-xl font-bold text-slate-100 mb-1">Mon profil</h1>
                <p className="text-sm text-slate-400 mb-8">Gérez vos informations personnelles.</p>

                <form onSubmit={handleSave}>
                  {/* Avatar */}
                  <section className="mb-8 pb-8 border-b border-slate-800">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Photo de profil</h2>
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <Avatar src={profile.profilePicture} username={profile.username} size="xl" />
                        <button type="button"
                          className="absolute inset-0 rounded-full bg-black/60 flex items-center justify-center opacity-0 hover:opacity-100 transition">
                          <Camera size={18} className="text-white" />
                        </button>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-100">{profile.username}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{profile.email}</p>
                        <div className="flex gap-1.5 mt-2">
                          {profile.isListener && <LabelBadge variant="violet">🎧 Écoutant</LabelBadge>}
                          {profile.role === 'Admin'
                            ? <LabelBadge variant="red">👑 Admin</LabelBadge>
                            : <LabelBadge variant="indigo">Membre</LabelBadge>}
                        </div>
                      </div>
                    </div>
                  </section>

                  {/* Info */}
                  <section className="mb-8 pb-8 border-b border-slate-800">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Informations du compte</h2>
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        label="Nom d'utilisateur"
                        leftIcon={<User size={14} />}
                        value={form.username}
                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                      />
                      <Input
                        label="Adresse email"
                        leftIcon={<Mail size={14} />}
                        value={profile.email}
                        disabled
                      />
                    </div>
                  </section>

                  {/* Bio */}
                  <section className="mb-8 pb-8 border-b border-slate-800">
                    <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">À propos de moi</h2>
                    <textarea
                      className="w-full bg-slate-900 border border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-4 py-3 text-slate-100 placeholder-slate-600 focus:outline-none transition resize-none text-sm leading-relaxed"
                      rows={4}
                      placeholder="Décrivez-vous en quelques mots…"
                      value={form.bio}
                      onChange={(e) => setForm({ ...form, bio: e.target.value })}
                      maxLength={500}
                    />
                    <p className="text-xs text-slate-600 text-right mt-1.5">{form.bio.length}/500</p>
                  </section>

                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-60 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-violet-900/30"
                    >
                      {isSaving
                        ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        : <Save size={14} />
                      }
                      Enregistrer les modifications
                    </button>
                    <button type="button"
                      onClick={() => setForm({ username: profile.username, bio: profile.bio ?? '' })}
                      className="text-sm text-slate-400 hover:text-slate-200 transition px-3 py-2.5 rounded-xl hover:bg-slate-800"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              </div>

              {/* Preview */}
              <div className="w-72 shrink-0 px-6 py-10 border-l border-slate-800">
                <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Aperçu du profil</h2>
                <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-xl">
                  <div className="h-16 bg-gradient-to-br from-violet-900 to-indigo-900" />
                  <div className="px-4 pb-4 -mt-8">
                    <div className="ring-4 ring-slate-800 rounded-full inline-block mb-2">
                      <Avatar src={profile.profilePicture} username={form.username || profile.username} size="lg" isOnline={true} ringColor="border-slate-800" />
                    </div>
                    <p className="font-bold text-slate-100 text-sm">{form.username || profile.username}</p>
                    {form.bio && (
                      <p className="text-xs text-slate-400 mt-2 leading-relaxed line-clamp-3">{form.bio}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {profile.isListener && <LabelBadge variant="violet">🎧 Écoutant</LabelBadge>}
                      <LabelBadge variant="indigo">{'Membre'}</LabelBadge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Listener mode */}
          {activeSection === 'listener' && (
            <div className="px-10 py-10 max-w-2xl">
              <h1 className="text-xl font-bold text-slate-100 mb-1">Mode écoutant</h1>
              <p className="text-sm text-slate-400 mb-8">
                En activant ce mode, vous apparaissez dans la liste des personnes disponibles pour aider.
              </p>

              <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden mb-4">
                <div className="p-5 flex items-center justify-between gap-6">
                  <div>
                    <p className="font-semibold text-slate-100 text-sm">Activer le mode écoutant</p>
                    <p className="text-sm text-slate-400 mt-1">
                      {profile.isListener
                        ? 'Vous êtes visible dans la liste des écoutants.'
                        : "Activez pour être visible auprès des utilisateurs en recherche d'écoute."}
                    </p>
                  </div>
                  <button
                    onClick={handleToggleListener}
                    disabled={isTogglingListener}
                    className={`relative w-12 h-6 rounded-full transition-colors duration-300 shrink-0 focus:outline-none disabled:opacity-50 ${
                      profile.isListener ? 'bg-violet-600' : 'bg-slate-700'
                    }`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-300 ${
                      profile.isListener ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>
                {profile.isListener && (
                  <div className="border-t border-slate-700 px-5 py-3">
                    <div className="flex items-center gap-2 text-emerald-400 text-sm">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                      Vous êtes visible comme écoutant disponible
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4">
                <p className="text-xs text-violet-300 leading-relaxed">
                  <span className="font-semibold">Rappel :</span> En activant ce mode, vous vous engagez à être disponible et bienveillant. Le respect et la confidentialité sont essentiels.
                </p>
              </div>
            </div>
          )}

          {/* Privacy */}
          {activeSection === 'privacy' && (
            <div className="px-10 py-10 max-w-2xl">
              <h1 className="text-xl font-bold text-slate-100 mb-1">Confidentialité</h1>
              <p className="text-sm text-slate-400 mb-8">Gérez vos paramètres de confidentialité.</p>
              <div className="space-y-3">
                {[
                  { label: 'Profil visible par les non-amis', desc: 'Votre profil peut être vu par tous les membres', on: true },
                  { label: 'Recevoir des demandes d\'amis', desc: 'Autoriser d\'autres membres à vous envoyer des demandes', on: true },
                  { label: 'Afficher le statut en ligne', desc: 'Les autres peuvent voir si vous êtes connecté', on: false },
                ].map((item) => (
                  <div key={item.label} className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between gap-4">
                    <div>
                      <p className="text-sm font-semibold text-slate-100">{item.label}</p>
                      <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                    </div>
                    <div className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${item.on ? 'bg-violet-600' : 'bg-slate-700'}`}>
                      <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${item.on ? 'translate-x-6' : 'translate-x-0'}`} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center gap-3">
                <Lock size={16} className="text-slate-500 shrink-0" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  Toutes vos données sont chiffrées de bout en bout et ne sont jamais partagées avec des tiers. Conforme RGPD.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
}
