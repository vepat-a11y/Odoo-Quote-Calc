import { ReactNode, InputHTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// --- Card Component ---
interface GlassCardProps {
  children: ReactNode;
  className?: string;
  title?: string;
  description?: string;
  headerAction?: ReactNode;
  "data-testid"?: string;
}

export function GlassCard({ children, className, title, description, headerAction, "data-testid": dataTestId }: GlassCardProps) {
  return (
    <div 
      className={cn("bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full", className)}
      data-testid={dataTestId}
    >
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-100 flex items-start justify-between">
          <div>
            {title && (
              <h3 className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#714B67', letterSpacing: '0.08em' }}>
                {title}
              </h3>
            )}
            {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
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
      {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
      <input
        className={cn(
          "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 placeholder:text-gray-400",
          "focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20",
          "transition-all duration-200",
          error && "border-red-300 focus:border-red-400 focus:ring-red-100",
          className
        )}
        {...props}
      />
      {error && <p className="text-xs text-red-500 ml-1">{error}</p>}
    </div>
  );
}

// --- Button ---
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
    primary: "bg-[#714B67] hover:bg-[#5d3d55] text-white shadow-sm",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200",
    outline: "bg-transparent border border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400",
    ghost: "bg-transparent text-gray-600 hover:text-gray-800 hover:bg-gray-100"
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs rounded",
    md: "px-5 py-2.5 text-sm rounded",
    lg: "px-8 py-4 text-base rounded font-semibold"
  };

  return (
    <button
      disabled={isLoading || disabled}
      className={cn(
        "relative overflow-hidden transition-all duration-200 active:scale-[0.98]",
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
          <div className="w-5 h-5 border-2 border-gray-300 border-t-[#714B67] rounded-full animate-spin" />
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
          "w-12 h-7 rounded-full p-1 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-[#714B67]/20",
          checked ? "bg-[#714B67]" : "bg-gray-200"
        )}
      >
        <motion.div
          className="w-5 h-5 rounded-full bg-white shadow-sm"
          animate={{ x: checked ? 20 : 0 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </button>
      {label && <span className="text-sm font-medium text-gray-700 cursor-pointer" onClick={() => onCheckedChange(!checked)}>{label}</span>}
    </div>
  );
}

// --- Select Component ---
interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: { value: string; label: string }[];
}

export function Select({ label, options, className, ...props }: SelectProps) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700 ml-1">{label}</label>}
      <div className="relative">
        <select
          className={cn(
            "w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 text-gray-800 appearance-none cursor-pointer",
            "focus:outline-none focus:border-[#714B67] focus:ring-2 focus:ring-[#714B67]/20",
            "transition-all duration-200",
            className
          )}
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value} className="bg-white text-gray-800">
              {opt.label}
            </option>
          ))}
        </select>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  );
}
