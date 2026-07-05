import { useState, InputHTMLAttributes, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff } from "lucide-react";

interface CyberInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ReactNode;
  variant?: "default" | "error" | "success";
  errorMessage?: string;
  successMessage?: string;
}

export function CyberInput({
  label,
  icon,
  variant = "default",
  errorMessage,
  successMessage,
  className,
  type = "text",
  ...props
}: CyberInputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  // Determine input type for password fields
  const inputType = type === "password" && showPassword ? "text" : type;
  
  // Variant-based styling
  const variantStyles = {
    default: {
      border: "border-blue-500/30",
      bg: "bg-gray-900/30",
      focusBorder: "border-blue-500/70",
      focusBg: "bg-gray-900/50",
      text: "text-gray-300",
      glow: "shadow-blue-500/10",
      label: "text-gray-400"
    },
    error: {
      border: "border-red-500/50",
      bg: "bg-red-900/10",
      focusBorder: "border-red-500/80",
      focusBg: "bg-red-900/20",
      text: "text-red-100",
      glow: "shadow-red-500/20",
      label: "text-red-400"
    },
    success: {
      border: "border-emerald-500/50",
      bg: "bg-emerald-900/10",
      focusBorder: "border-emerald-500/80",
      focusBg: "bg-emerald-900/20",
      text: "text-emerald-100",
      glow: "shadow-emerald-500/20",
      label: "text-emerald-400"
    }
  };
  
  const styles = variantStyles[variant];

  return (
    <div className="relative">
      {/* Input label */}
      {label && (
        <motion.label
          className={`block font-medium text-sm mb-1.5 ${styles.label} transition-colors duration-200`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.label>
      )}
      
      {/* Input container */}
      <div className="relative">
        <motion.div
          className={`
            relative border ${styles.border} ${styles.bg} rounded-md
            overflow-hidden transition-colors duration-300
            shadow-lg ${styles.glow}
            ${isFocused ? `${styles.focusBorder} ${styles.focusBg}` : ""}
          `}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {/* Animated scan line effect when focused */}
          {isFocused && (
            <motion.div
              className="absolute inset-0 pointer-events-none z-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="absolute left-0 top-0 bottom-0 w-full h-full bg-gradient-to-r from-transparent via-blue-500/10 to-transparent"
                animate={{ 
                  x: ["-100%", "200%"] 
                }}
                transition={{ 
                  repeat: Infinity,
                  duration: 2,
                  ease: "linear"
                }}
              />
            </motion.div>
          )}
          
          {/* Glowing energy along border when focused */}
          {isFocused && (
            <>
              <motion.div
                className="absolute bottom-0 left-0 right-0 h-[1px] bg-blue-400"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3 }}
                style={{ transformOrigin: "left" }}
              />
              <motion.div
                className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-blue-400/30 blur-[2px]"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                style={{ transformOrigin: "left" }}
              />
            </>
          )}
          
          {/* Input with icon */}
          <div className="relative flex items-center">
            {icon && (
              <div className={`pl-3 text-${variant === "default" ? "gray-400" : `${variant}-400`}`}>
                {icon}
              </div>
            )}
            
            <input
              type={inputType}
              className={`
                w-full py-2.5 px-3 ${icon ? "pl-1" : ""}
                bg-transparent outline-none
                ${styles.text} placeholder:text-gray-500
                text-sm focus:ring-0 focus:outline-none
              `}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              {...props}
            />
            
            {/* Password toggle button */}
            {type === "password" && (
              <button
                type="button"
                className="pr-3 text-gray-400 hover:text-gray-300 transition-colors focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </motion.div>
        
        {/* Error message */}
        {variant === "error" && errorMessage && (
          <motion.div
            className="flex items-center gap-1.5 mt-1.5 text-red-400 text-xs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
          >
            <AlertCircle className="h-3 w-3" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
        
        {/* Success message */}
        {variant === "success" && successMessage && (
          <motion.div
            className="mt-1.5 text-emerald-400 text-xs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.2 }}
          >
            {successMessage}
          </motion.div>
        )}
      </div>
    </div>
  );
}