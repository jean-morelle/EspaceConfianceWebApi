interface BadgeCountProps {
  count: number;
  /** Position absolutely (for icon buttons) vs inline */
  absolute?: boolean;
}

/** Small number badge — wraps icon buttons or appears inline */
export function Badge({ count, absolute = true }: BadgeCountProps) {
  if (count <= 0) return null;
  const base = 'bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1 leading-none';
  if (absolute) return (
    <span className={`absolute -top-1 -right-1 ${base}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
  return (
    <span className={`ml-auto shrink-0 ${base}`}>
      {count > 99 ? '99+' : count}
    </span>
  );
}

interface StatusBadgeProps {
  status: 'online' | 'offline' | 'busy';
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const map = {
    online:  { color: 'bg-emerald-500', label: 'En ligne' },
    offline: { color: 'bg-slate-500',   label: 'Hors ligne' },
    busy:    { color: 'bg-amber-500',   label: 'Occupé' },
  };
  const { color, label } = map[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-xs ${className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${color}`} />
      {label}
    </span>
  );
}

interface LabelBadgeProps {
  children: React.ReactNode;
  variant?: 'violet' | 'indigo' | 'emerald' | 'amber' | 'red' | 'slate';
}

export function LabelBadge({ children, variant = 'slate' }: LabelBadgeProps) {
  const vars: Record<string, string> = {
    violet:  'bg-violet-500/15 text-violet-400 border-violet-500/25',
    indigo:  'bg-indigo-500/15 text-indigo-400 border-indigo-500/25',
    emerald: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
    amber:   'bg-amber-500/15 text-amber-400 border-amber-500/25',
    red:     'bg-red-500/15 text-red-400 border-red-500/25',
    slate:   'bg-slate-700/50 text-slate-400 border-slate-600/50',
  };
  return (
    <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold border ${vars[variant]} leading-none`}>
      {children}
    </span>
  );
}
