import { type InputHTMLAttributes, type ReactNode, forwardRef } from 'react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  onRightIconClick?: () => void;
  /** Legacy compat: same as leftIcon */
  icon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, helper, leftIcon, rightIcon, onRightIconClick, icon, className = '', id, ...props },
  ref,
) {
  const resolvedLeft = leftIcon ?? icon;
  const inputId = id ?? (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label htmlFor={inputId} className="text-xs font-semibold text-slate-400 uppercase tracking-wide select-none">
          {label}
        </label>
      )}

      <div className="relative">
        {resolvedLeft && (
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">
            {resolvedLeft}
          </span>
        )}

        <input
          ref={ref}
          id={inputId}
          className={`
            w-full bg-slate-900 border
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
              : 'border-slate-700 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20'}
            rounded-lg py-2.5 text-slate-100 text-sm placeholder-slate-600
            focus:outline-none transition-all duration-150
            disabled:opacity-50 disabled:cursor-not-allowed
            ${resolvedLeft ? 'pl-10' : 'pl-3.5'}
            ${rightIcon ? 'pr-10' : 'pr-3.5'}
            ${className}
          `}
          {...props}
        />

        {rightIcon && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>

      {error   && <p className="text-xs text-red-400">{error}</p>}
      {!error && helper && <p className="text-xs text-slate-500">{helper}</p>}
    </div>
  );
});
