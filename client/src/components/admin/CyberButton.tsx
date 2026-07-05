import { ReactNode } from "react";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";

interface CyberButtonProps {
  variant?: "primary" | "secondary" | "danger" | "success" | "warning";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  iconLeft?: ReactNode;
  iconRight?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: () => void;
}

export function CyberButton({
  variant = "primary",
  size = "md",
  loading = false,
  iconLeft,
  iconRight,
  fullWidth = false,
  children,
  type = "button",
  disabled = false,
  onClick
}: CyberButtonProps) {
  // Size classes
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-7 py-3 text-base"
  };

  // Variant classes for enhanced cyber look
  const variantClasses = {
    primary: {
      bg: "bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800",
      border: "border border-sky-500",
      text: "text-white",
      glow: "shadow-sky-500/40",
      outline: "focus:ring-sky-500"
    },
    secondary: {
      bg: "bg-gradient-to-r from-violet-600 to-purple-700 hover:from-violet-700 hover:to-purple-800",
      border: "border border-violet-500",
      text: "text-white",
      glow: "shadow-violet-500/25",
      outline: "focus:ring-violet-500"
    },
    danger: {
      bg: "bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-700 hover:to-rose-800",
      border: "border border-red-500",
      text: "text-white",
      glow: "shadow-red-500/25",
      outline: "focus:ring-red-500"
    },
    success: {
      bg: "bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800",
      border: "border border-emerald-500",
      text: "text-white",
      glow: "shadow-emerald-500/25",
      outline: "focus:ring-emerald-500"
    },
    warning: {
      bg: "bg-gradient-to-r from-amber-600 to-orange-700 hover:from-amber-700 hover:to-orange-800",
      border: "border border-amber-500",
      text: "text-white",
      glow: "shadow-amber-500/25",
      outline: "focus:ring-amber-500"
    }
  };

  return (
    <div className={`relative ${fullWidth ? "w-full" : "inline-block"}`}>
      {/* Outer glow effect */}
      <div className={`absolute -inset-0.5 ${variantClasses[variant].glow} blur-sm rounded-md opacity-70`} />
      
      <motion.button
        type={type}
        disabled={loading || disabled}
        onClick={onClick}
        className={`
          relative overflow-hidden
          ${sizeClasses[size]}
          ${variantClasses[variant].bg}
          ${variantClasses[variant].border}
          ${variantClasses[variant].text}
          flex items-center justify-center gap-2 font-medium tracking-wide
          rounded shadow-lg
          focus:outline-none focus:ring-2 ${variantClasses[variant].outline} focus:ring-offset-2 focus:ring-offset-gray-900
          disabled:opacity-70 disabled:cursor-not-allowed
          transition-all duration-300 ease-out
          ${fullWidth ? "w-full" : ""}
        `}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background animation */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
          initial={{ x: "-100%" }}
          animate={{ x: "100%" }}
          transition={{
            repeat: Infinity,
            duration: 2,
            ease: "linear"
          }}
          style={{ zIndex: 0 }}
        />

        {/* Tech circuit pattern */}
        <div className="absolute inset-0 opacity-20 mix-blend-overlay">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" preserveAspectRatio="none">
            <path d="M0,0 L100,0 L100,100 L0,100Z" fill="none" stroke="currentColor" strokeWidth="0.5" strokeDasharray="1,1" />
            <path d="M0,50 L100,50 M50,0 L50,100" stroke="currentColor" strokeWidth="0.3" />
            <circle cx="50" cy="50" r="40" stroke="currentColor" strokeWidth="0.3" fill="none" />
            <circle cx="50" cy="50" r="20" stroke="currentColor" strokeWidth="0.3" fill="none" />
            <circle cx="50" cy="50" r="5" fill="currentColor" opacity="0.5" />
          </svg>
        </div>

        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span className="relative z-10">Loading...</span>
          </>
        ) : (
          <>
            {iconLeft && <span className="relative z-10">{iconLeft}</span>}
            <span className="relative z-10">{children}</span>
            {iconRight && <span className="relative z-10">{iconRight}</span>}
          </>
        )}
        
        {/* Bottom border pulse effect */}
        <motion.div
          className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/50"
          animate={{
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
      </motion.button>
    </div>
  );
}