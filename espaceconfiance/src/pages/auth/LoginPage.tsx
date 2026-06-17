import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Lock, Mail, Eye, EyeOff, ArrowRight, Shield, Star } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';

/* ── Inline SVG illustration ─────────────────────────────────────── */
function Illustration() {
  return (
    <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      {/* Glow blobs */}
      <ellipse cx="200" cy="160" rx="160" ry="120" fill="url(#g1)" opacity="0.4" />
      <ellipse cx="100" cy="220" rx="80" ry="60" fill="url(#g2)" opacity="0.25" />
      <ellipse cx="310" cy="100" rx="70" ry="50" fill="url(#g3)" opacity="0.25" />

      {/* Connecting arc */}
      <path d="M120 200 Q200 100 280 160" stroke="url(#g4)" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.5" />

      {/* Person left — circle avatar */}
      <circle cx="100" cy="210" r="32" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <circle cx="100" cy="200" r="10" fill="url(#g2)" />
      <path d="M78 218 Q100 225 122 218" stroke="url(#g2)" strokeWidth="2" strokeLinecap="round" />

      {/* Person right */}
      <circle cx="300" cy="170" r="32" fill="#1E293B" stroke="#334155" strokeWidth="1.5" />
      <circle cx="300" cy="160" r="10" fill="url(#g3)" />
      <path d="M278 178 Q300 185 322 178" stroke="url(#g3)" strokeWidth="2" strokeLinecap="round" />

      {/* Chat bubble left */}
      <rect x="50" y="120" width="110" height="46" rx="12" fill="#1E293B" stroke="#334155" strokeWidth="1" />
      <path d="M76 166 L68 176 L84 166" fill="#1E293B" stroke="#334155" strokeWidth="1" strokeLinejoin="round" />
      <rect x="62" y="133" width="60" height="6" rx="3" fill="#475569" />
      <rect x="62" y="145" width="40" height="6" rx="3" fill="#334155" />

      {/* Chat bubble right (violet) */}
      <rect x="235" y="88" width="120" height="50" rx="12" fill="url(#g1)" opacity="0.9" />
      <path d="M340 138 L350 150 L326 138" fill="url(#g1)" opacity="0.9" />
      <rect x="247" y="101" width="70" height="6" rx="3" fill="rgba(255,255,255,0.4)" />
      <rect x="247" y="113" width="45" height="6" rx="3" fill="rgba(255,255,255,0.25)" />

      {/* Floating hearts */}
      <path d="M195 80 C195 76 191 72 187 75 C183 72 179 76 179 80 C179 84 187 90 187 90 C187 90 195 84 195 80Z" fill="#7C3AED" opacity="0.7" />
      <path d="M222 50 C222 47.5 219.5 45 217 46.5 C214.5 45 212 47.5 212 50 C212 52.5 217 56 217 56 C217 56 222 52.5 222 50Z" fill="#6366F1" opacity="0.5" />
      <path d="M168 55 C168 53 166 51 164 52 C162 51 160 53 160 55 C160 57 164 59.5 164 59.5 C164 59.5 168 57 168 55Z" fill="#8B5CF6" opacity="0.5" />

      {/* Stars / sparkles */}
      <circle cx="155" cy="95" r="2" fill="#A78BFA" />
      <circle cx="255" cy="75" r="1.5" fill="#C4B5FD" />
      <circle cx="345" cy="190" r="2" fill="#7C3AED" />
      <circle cx="65" cy="155" r="1.5" fill="#6366F1" />

      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="g2" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#818CF8" />
        </linearGradient>
        <linearGradient id="g3" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#A78BFA" />
        </linearGradient>
        <linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366F1" stopOpacity="0" />
          <stop offset="50%" stopColor="#7C3AED" />
          <stop offset="100%" stopColor="#6366F1" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

/* ── OAuth icons ─────────────────────────────────────────────────── */
const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const AppleIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
  </svg>
);

const testimonial = {
  quote: "Ce lieu m'a aidée à trouver des personnes qui comprennent vraiment. Je me sens moins seule.",
  author: "Marie L.",
  role: "Utilisatrice depuis 2023",
};

const features = [
  { icon: Shield, text: 'Chiffré de bout en bout' },
  { icon: Star,   text: 'Communauté bienveillante' },
  { icon: Lock,   text: 'RGPD & Confidentialité' },
];

/* ── Page ─────────────────────────────────────────────────────────── */
export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.email) e.email = 'Email requis';
    if (!form.password) e.password = 'Mot de passe requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: { preventDefault(): void }) => {
    e.preventDefault();
    if (!validate()) return;
    setIsLoading(true);
    try {
      await login(form);
      navigate('/chat');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        ?? 'Identifiants incorrects';
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-slate-950">

      {/* ── LEFT — Branding ───────────────────────────────── */}
      <div
        className="hidden lg:flex w-[40%] flex-col justify-between p-12 relative overflow-hidden"
        style={{
          background: 'linear-gradient(145deg, #0f172a 0%, #1e1b4b 30%, #2e1065 55%, #1e1b4b 80%, #0f172a 100%)',
        }}
      >
        {/* Decorative radial glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-violet-600/20 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-indigo-600/15 rounded-full blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center font-black text-white text-sm shadow-lg shadow-violet-900/60">
            EC
          </div>
          <div>
            <p className="font-bold text-white text-base leading-tight">EspaceConfiance</p>
            <p className="text-slate-500 text-[11px]">Votre espace de soutien</p>
          </div>
        </div>

        {/* Center illustration + copy */}
        <div className="relative z-10 flex-1 flex flex-col justify-center">
          <div className="w-full max-w-[380px] mx-auto mb-6">
            <Illustration />
          </div>
          <h1 className="text-4xl font-black text-white leading-[1.1] mb-4 tracking-tight">
            Parlez librement.<br />
            <span className="bg-gradient-to-r from-violet-400 to-indigo-400 bg-clip-text text-transparent">
              Créez des liens.
            </span>
          </h1>
          <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
            Échangez, partagez et connectez-vous dans un environnement bienveillant, sécurisé et confidentiel.
          </p>
        </div>

        {/* Bottom: features + testimonial */}
        <div className="relative z-10">
          {/* Testimonial card */}
          <div className="bg-white/[0.06] backdrop-blur border border-white/[0.08] rounded-xl p-4 mb-6">
            <div className="flex gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
              ))}
            </div>
            <p className="text-slate-300 text-sm italic leading-relaxed mb-2">"{testimonial.quote}"</p>
            <div>
              <p className="text-white text-xs font-semibold">{testimonial.author}</p>
              <p className="text-slate-500 text-[11px]">{testimonial.role}</p>
            </div>
          </div>

          {/* Feature chips */}
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

      {/* ── RIGHT — Form ──────────────────────────────────── */}
      <div className="flex-1 bg-white flex flex-col items-center justify-center px-6 py-10">
        <motion.div
          className="w-full max-w-[440px]"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: 'easeOut' }}
        >
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center font-black text-white text-sm">
              EC
            </div>
            <p className="font-bold text-gray-900 text-base">EspaceConfiance</p>
          </div>

          {/* Card */}
          <div className="bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden">
            <div className="px-8 pt-8 pb-2">
              <h1 className="text-2xl font-bold text-gray-900">Connexion</h1>
              <p className="text-gray-500 text-sm mt-1">Heureux de vous revoir ! 💜</p>
            </div>

            <form onSubmit={handleSubmit} className="px-8 pt-6 pb-8 flex flex-col gap-5">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Adresse e-mail</label>
                <div className="relative">
                  <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="votre@email.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    autoComplete="email"
                    className={`w-full bg-gray-50 border ${errors.email ? 'border-red-400 focus:ring-red-400/20' : 'border-gray-300 focus:border-violet-500 focus:ring-violet-500/20'} rounded-lg pl-10 pr-3.5 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                  />
                </div>
                {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Mot de passe</label>
                  <button type="button" className="text-xs text-violet-600 hover:text-violet-500 transition-colors font-medium">
                    Mot de passe oublié ?
                  </button>
                </div>
                <div className="relative">
                  <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    autoComplete="current-password"
                    className={`w-full bg-gray-50 border ${errors.password ? 'border-red-400 focus:ring-red-400/20' : 'border-gray-300 focus:border-violet-500 focus:ring-violet-500/20'} rounded-lg pl-10 pr-10 py-2.5 text-gray-900 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:bg-white transition-all`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-violet-600 hover:bg-violet-500 active:bg-violet-700 disabled:opacity-60 text-white font-semibold py-3 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-violet-500/30 text-sm"
              >
                {isLoading ? (
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <><ArrowRight size={16} /> Se connecter</>
                )}
              </button>

              {/* Divider */}
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400 whitespace-nowrap">ou continuer avec</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* OAuth */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'Google', icon: <GoogleIcon /> },
                  { label: 'Apple',  icon: <AppleIcon /> },
                ].map(({ label, icon }) => (
                  <button
                    key={label}
                    type="button"
                    className="border border-gray-300 hover:border-gray-400 hover:bg-gray-50 rounded-xl py-2.5 flex items-center justify-center gap-2 text-sm font-medium text-gray-700 transition-all"
                  >
                    {icon}
                    {label}
                  </button>
                ))}
              </div>

              {/* Register link */}
              <p className="text-center text-sm text-gray-500">
                Pas encore de compte ?{' '}
                <Link to="/register" className="font-semibold text-violet-600 hover:text-violet-500 transition-colors">
                  S'inscrire gratuitement
                </Link>
              </p>
            </form>
          </div>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-5">
            En continuant, vous acceptez nos{' '}
            <span className="text-gray-500 hover:text-violet-600 cursor-pointer transition-colors">Conditions d'utilisation</span>
            {' '}et notre{' '}
            <span className="text-gray-500 hover:text-violet-600 cursor-pointer transition-colors">Politique de confidentialité</span>.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
