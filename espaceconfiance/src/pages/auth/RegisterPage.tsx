import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail, User, Eye, EyeOff, UserPlus, Shield, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

function Illustration() {
  return (
    <svg viewBox="0 0 400 280" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <ellipse cx="200" cy="140" rx="160" ry="110" fill="url(#rg1)" opacity="0.35" />
      <path d="M80 200 Q200 80 320 180" stroke="url(#rg4)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />

      {/* Three people */}
      <circle cx="80" cy="190" r="28" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <circle cx="80" cy="182" r="9" fill="url(#rg2)" />
      <circle cx="200" cy="155" r="32" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <circle cx="200" cy="146" r="10" fill="url(#rg1)" />
      <circle cx="320" cy="180" r="28" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <circle cx="320" cy="172" r="9" fill="url(#rg3)" />

      {/* Plus / join icon */}
      <rect x="186" cy="95" x1="186" y1="95" x="186" y="95" width="28" height="28" rx="8" fill="#7C3AED" opacity="0.9" />
      <path d="M200 101 L200 117 M193 109 L207 109" stroke="white" strokeWidth="2" strokeLinecap="round" />

      {/* Hearts */}
      <path d="M145 80 C145 76.5 142 74 139 75.5 C136 74 133 76.5 133 80 C133 83.5 139 88 139 88 C139 88 145 83.5 145 80Z" fill="#7C3AED" opacity="0.65" />
      <path d="M275 65 C275 62.5 272.5 60.5 270 62 C267.5 60.5 265 62.5 265 65 C265 67.5 270 71 270 71 C270 71 275 67.5 275 65Z" fill="#6366F1" opacity="0.55" />

      <circle cx="110" cy="120" r="2" fill="#A78BFA" />
      <circle cx="295" cy="110" r="1.5" fill="#C4B5FD" />
      <circle cx="355" cy="200" r="2" fill="#7C3AED" />
      <circle cx="50" cy="145" r="1.5" fill="#6366F1" />

      <defs>
        <linearGradient id="rg1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="rg2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="rg3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="rg4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

const features = [
  { icon: Shield, text: 'Chiffré de bout en bout' },
  { icon: Star,   text: 'Communauté bienveillante' },
  { icon: Lock,   text: 'Données protégées RGPD' },
];

export function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.username || form.username.length < 3) e.username = 'Minimum 3 caractères';
    if (!form.email) e.email = 'Email requis';
    if (!form.password || form.password.length < 6) e.password = 'Minimum 6 caractères';
    if (form.password !== form.confirm) e.confirm = 'Les mots de passe ne correspondent pas';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await register({ username: form.username, email: form.email, password: form.password });
      toast.success('Compte créé avec succès !');
      navigate('/chat');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? "Erreur lors de l'inscription";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const field = (hasError: boolean) =>
    `w-full bg-slate-900 border ${hasError
      ? 'border-red-500 focus:ring-red-500/20'
      : 'border-slate-700 focus:border-violet-500 focus:ring-violet-500/20'
    } rounded-lg py-2.5 text-slate-100 text-sm placeholder-slate-600 focus:outline-none focus:ring-2 transition-all`;

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── LEFT ── */}
      <div
        className="hidden lg:flex w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 30%, #2e1065 55%, #1e1b4b 80%, #0f172a 100%)',
        }}
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-violet-900/60">
            EC
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">EspaceConfiance</p>
            <p className="text-slate-500 text-[11px]">Votre espace de soutien</p>
          </div>
        </div>

        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="w-full max-w-[380px] mx-auto mb-6">
            <Illustration />
          </div>
          <h1 className="text-4xl font-black text-white leading-[1.1] mb-4 tracking-tight">
            Rejoignez<br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              la communauté.
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Des milliers de personnes s'entraident chaque jour. Rejoignez cet espace bienveillant et commencez votre voyage.
          </p>
        </div>

        <div className="relative z-10">
          <div className="bg-white/[0.06] backdrop-blur border border-white/[0.08] rounded-xl p-4 mb-6">
            <p className="text-slate-300 text-sm font-medium mb-1">500+ membres actifs</p>
            <div className="flex -space-x-2">
              {['#7C3AED','#6366F1','#8B5CF6','#4F46E5','#A78BFA'].map((c, i) => (
                <div key={i} className="w-7 h-7 rounded-full border-2 border-slate-800 flex items-center justify-center text-white text-[9px] font-bold" style={{ backgroundColor: c }}>
                  {String.fromCharCode(65 + i)}
                </div>
              ))}
              <div className="w-7 h-7 rounded-full border-2 border-slate-800 bg-slate-700 flex items-center justify-center text-slate-400 text-[9px] font-bold">
                +
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            {features.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-center gap-2.5 text-slate-400 text-xs">
                <div className="w-5 h-5 rounded-md bg-violet-500/20 flex items-center justify-center shrink-0">
                  <Icon size={11} className="text-violet-400" />
                </div>
                {text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── RIGHT ── */}
      <div className="flex-1 bg-slate-900 flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          className="w-full max-w-[520px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center font-black text-white text-sm">EC</div>
            <p className="font-bold text-white text-base">EspaceConfiance</p>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-8 pt-8 pb-2">
              <h1 className="text-2xl font-bold text-slate-100">Créer un compte</h1>
              <p className="text-slate-400 text-sm mt-1">Rejoignez EspaceConfiance — c'est gratuit. 💜</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 flex flex-col gap-5">
              {/* Row 1 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Nom d'utilisateur</label>
                  <div className="relative">
                    <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type="text" placeholder="votre_pseudo" value={form.username}
                      onChange={(e) => setForm({ ...form, username: e.target.value })}
                      autoComplete="username"
                      className={`${field(!!errors.username)} pl-10 pr-3.5`} />
                  </div>
                  {errors.username && <p className="text-xs text-red-400">{errors.username}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Adresse e-mail</label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type="email" placeholder="vous@exemple.com" value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      autoComplete="email"
                      className={`${field(!!errors.email)} pl-10 pr-3.5`} />
                  </div>
                  {errors.email && <p className="text-xs text-red-400">{errors.email}</p>}
                </div>
              </div>

              {/* Row 2 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Mot de passe</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type={showPassword ? 'text' : 'password'} placeholder="••••••••" value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      autoComplete="new-password"
                      className={`${field(!!errors.password)} pl-10 pr-10`} />
                    <button type="button" onClick={() => setShowPassword(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.password && <p className="text-xs text-red-400">{errors.password}</p>}
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Confirmer</label>
                  <div className="relative">
                    <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
                    <input type={showConfirm ? 'text' : 'password'} placeholder="••••••••" value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      autoComplete="new-password"
                      className={`${field(!!errors.confirm)} pl-10 pr-10`} />
                    <button type="button" onClick={() => setShowConfirm(v => !v)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                      {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  {errors.confirm && <p className="text-xs text-red-400">{errors.confirm}</p>}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-900/40 text-sm mt-1"
              >
                {isLoading
                  ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  : <><UserPlus size={16} /> Créer mon compte</>
                }
              </button>

              <p className="text-center text-sm text-slate-500">
                Déjà un compte ?{' '}
                <Link to="/login" className="font-semibold text-violet-400 hover:text-violet-300 transition-colors">
                  Se connecter
                </Link>
              </p>
            </form>
          </div>

          <p className="text-center text-xs text-slate-600 mt-5">
            En créant un compte, vous acceptez nos{' '}
            <span className="text-slate-500 hover:text-violet-400 cursor-pointer transition-colors">Conditions d'utilisation</span>
            {' '}et notre{' '}
            <span className="text-slate-500 hover:text-violet-400 cursor-pointer transition-colors">Politique de confidentialité</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
