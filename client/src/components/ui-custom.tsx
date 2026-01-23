import { ReactNode, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// --- Beautiful Card ---
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  headerAction?: ReactNode;
}

export function GlassCard({ children, className, title, description, headerAction }: GlassCardProps) {
  return (
    <div className={cn("glass-panel rounded-2xl overflow-hidden flex flex-col h-full", className)}>
      {(title || description) && (
        <div className="p-6 border-b border-white/5 flex items-start justify-between bg-white/[0.02]">
          <div>
            {title && <h3 className="text-xl font-bold text-white/90">{title}</h3>}
            {description && <p className="mt-1 text-sm text-white/50">{description}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="p-6 flex-1">{children}</div>
    </div>
  );
}

// --- Styled Input ---
interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function InputField({ label, error, className, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-white/70 ml-1">{label}</label>}
      <input
        className={cn(
          "w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white placeholder:text-white/20",
          "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
          "transition-all duration-200",
          error && "border-red-500/50 focus:border-red-500/50 focus:ring-red-500/20",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-400 ml-1">{error}</p>}
    </div>
  );
}

// --- Gradient Button ---
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  className, 
  disabled,
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white shadow-lg shadow-primary/20 border border-white/10",
    secondary: "bg-white/10 hover:bg-white/15 text-white border border-white/5",
    outline: "bg-transparent border border-white/20 text-white/80 hover:bg-white/5 hover:text-white hover:border-white/40",
    ghost: "bg-transparent text-white/60 hover:text-white hover:bg-white/5"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded-lg",
    md: "px-5 py-2.5 text-sm rounded-xl",
    lg: "px-8 py-4 text-base rounded-xl font-semibold"
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "relative overflow-hidden transition-all duration-300 active:scale-[0.98]",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      <span className={cn("flex items-center justify-center gap-2", isLoading && "opacity-0")}>
        {children}
      </span>
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        </div>
      )}
    </button>
  );
}

// --- Switch Toggle ---
interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label?: string;
}

export function Switch({ checked, onCheckedChange, label }: SwitchProps) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "w-12 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-primary/20",
          checked ? "bg-gradient-to-r from-violet-600 to-fuchsia-600" : "bg-white/10"
        )}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      {label && <span className="text-sm font-medium text-white/80 cursor-pointer" onClick={() => onCheckedChange(!checked)}>{label}</span>}
    </div>
  );
}

// --- Select Component (Simple implementation for design) ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-white/70 ml-1">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-black/20 border border-white/10 text-white appearance-none cursor-pointer",
            "focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20",
            "transition-all duration-200",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-zinc-900 text-white">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
