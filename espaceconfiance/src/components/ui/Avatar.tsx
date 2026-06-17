const PALETTE = [
  'from-violet-500 to-violet-700',
  'from-indigo-500 to-indigo-700',
  'from-blue-500 to-blue-700',
  'from-rose-500 to-rose-700',
  'from-pink-500 to-pink-700',
  'from-emerald-500 to-emerald-700',
  'from-teal-500 to-teal-700',
  'from-orange-500 to-orange-700',
  'from-amber-500 to-amber-700',
  'from-cyan-500 to-cyan-700',
];

function pickGradient(username: string): string {
  let h = 0;
  for (let i = 0; i < username.length; i++) {
    h = (Math.imul(31, h) + username.charCodeAt(i)) | 0;
  }
  return PALETTE[Math.abs(h) % PALETTE.length];
}

type OnlineStatus = 'online' | 'offline' | 'busy';

interface AvatarProps {
  src?: string;
  username: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  status?: OnlineStatus;
  /** Border color that matches the surrounding bg */
  ringColor?: string;
}

const sizeMap = {
  xs: { outer: 'w-5 h-5',   text: 'text-[9px]',  dot: 'w-2 h-2',     border: 'border' },
  sm: { outer: 'w-8 h-8',   text: 'text-[10px]', dot: 'w-2.5 h-2.5', border: 'border-2' },
  md: { outer: 'w-10 h-10', text: 'text-xs',     dot: 'w-3 h-3',     border: 'border-2' },
  lg: { outer: 'w-12 h-12', text: 'text-sm',     dot: 'w-3.5 h-3.5', border: 'border-2' },
  xl: { outer: 'w-20 h-20', text: 'text-2xl',    dot: 'w-4 h-4',     border: 'border-[3px]' },
};

const statusColors: Record<OnlineStatus, string> = {
  online:  'bg-emerald-500',
  offline: 'bg-slate-600',
  busy:    'bg-amber-500',
};

export function Avatar({
  src,
  username,
  size = 'md',
  isOnline,
  status,
  ringColor = 'border-slate-900',
}: AvatarProps) {
  const { outer, text, dot, border } = sizeMap[size];
  const gradient = pickGradient(username);
  const initials = username.slice(0, 2).toUpperCase();

  const resolvedStatus: OnlineStatus | undefined =
    status ?? (isOnline === true ? 'online' : isOnline === false ? 'offline' : undefined);

  return (
    <div className="relative inline-block shrink-0">
      {src ? (
        <img src={src} alt={username} className={`${outer} rounded-full object-cover`} />
      ) : (
        <div
          className={`${outer} rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center font-bold ${text} text-white select-none`}
        >
          {initials}
        </div>
      )}
      {resolvedStatus && (
        <span
          className={`absolute bottom-0 right-0 block rounded-full ${border} ${ringColor} ${dot} ${statusColors[resolvedStatus]}`}
        />
      )}
    </div>
  );
}
