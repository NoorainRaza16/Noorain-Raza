import { motion } from "framer-motion";
import { Shield, Lock, ShieldCheck, ShieldAlert } from "lucide-react";

interface CyberSecurityBadgeProps {
  variant?: "primary" | "secondary" | "success" | "danger";
  size?: "sm" | "md" | "lg";
}

export function CyberSecurityBadge({
  variant = "primary",
  size = "md"
}: CyberSecurityBadgeProps) {
  // Size configurations
  const sizeConfig = {
    sm: {
      wrapper: "w-16 h-16",
      outerRing: "w-16 h-16",
      innerRing: "w-12 h-12",
      icon: "w-6 h-6"
    },
    md: {
      wrapper: "w-24 h-24",
      outerRing: "w-24 h-24",
      innerRing: "w-16 h-16",
      icon: "w-8 h-8"
    },
    lg: {
      wrapper: "w-32 h-32",
      outerRing: "w-32 h-32",
      innerRing: "w-20 h-20",
      icon: "w-10 h-10"
    }
  };
  
  // Variant configurations
  const variantConfig = {
    primary: {
      bgGradient: "from-blue-600 to-indigo-800",
      ringColor: "border-blue-400",
      shadowColor: "shadow-blue-500/20",
      pulseColor: "rgba(59, 130, 246, 0.5)",
      icon: <Shield className={sizeConfig[size].icon} />
    },
    secondary: {
      bgGradient: "from-purple-600 to-violet-800",
      ringColor: "border-purple-400",
      shadowColor: "shadow-purple-500/20",
      pulseColor: "rgba(147, 51, 234, 0.5)",
      icon: <Lock className={sizeConfig[size].icon} />
    },
    success: {
      bgGradient: "from-emerald-600 to-green-800",
      ringColor: "border-emerald-400",
      shadowColor: "shadow-emerald-500/20",
      pulseColor: "rgba(16, 185, 129, 0.5)",
      icon: <ShieldCheck className={sizeConfig[size].icon} />
    },
    danger: {
      bgGradient: "from-red-600 to-rose-800",
      ringColor: "border-red-400",
      shadowColor: "shadow-red-500/20",
      pulseColor: "rgba(239, 68, 68, 0.5)",
      icon: <ShieldAlert className={sizeConfig[size].icon} />
    }
  };
  
  const selectedSize = sizeConfig[size];
  const selectedVariant = variantConfig[variant];
  
  return (
    <motion.div
      className={`relative ${selectedSize.wrapper} flex items-center justify-center`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ 
        type: "spring",
        stiffness: 200,
        damping: 10
      }}
    >
      {/* Outer rotating ring */}
      <motion.div
        className={`absolute inset-0 rounded-full border-2 border-dashed ${selectedVariant.ringColor} ${selectedVariant.shadowColor}`}
        animate={{ rotate: 360 }}
        transition={{ 
          duration: 20,
          ease: "linear",
          repeat: Infinity
        }}
      />
      
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ 
          boxShadow: [
            `0 0 0 0px ${selectedVariant.pulseColor}`,
            `0 0 0 10px ${selectedVariant.pulseColor}`,
            `0 0 0 20px ${selectedVariant.pulseColor}`,
            `0 0 0 0px ${selectedVariant.pulseColor}`
          ],
          scale: [0.8, 1.1, 0.8]
        }}
        transition={{ 
          duration: 3,
          repeat: Infinity,
          repeatType: "loop"
        }}
      />
      
      {/* Inner circle with gradient background */}
      <motion.div
        className={`
          ${selectedSize.innerRing} rounded-full 
          bg-gradient-to-br ${selectedVariant.bgGradient}
          flex items-center justify-center text-white
          shadow-lg
        `}
        animate={{ 
          boxShadow: [
            "0 0 10px rgba(0, 0, 0, 0.3)",
            "0 0 20px rgba(0, 0, 0, 0.5)",
            "0 0 10px rgba(0, 0, 0, 0.3)"
          ]
        }}
        transition={{ 
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse"
        }}
      >
        {/* Center icon with light effect */}
        <motion.div
          animate={{ 
            opacity: [0.8, 1, 0.8],
            scale: [0.95, 1.05, 0.95]
          }}
          transition={{ 
            duration: 3,
            repeat: Infinity,
            repeatType: "loop"
          }}
        >
          {selectedVariant.icon}
        </motion.div>
      </motion.div>
      
      {/* Tech circuit lines */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: `
            radial-gradient(circle at 20% 20%, transparent 60%, ${selectedVariant.pulseColor} 60.5%, transparent 61%),
            radial-gradient(circle at 80% 80%, transparent 60%, ${selectedVariant.pulseColor} 60.5%, transparent 61%),
            radial-gradient(circle at 20% 80%, transparent 70%, ${selectedVariant.pulseColor} 70.5%, transparent 71%),
            radial-gradient(circle at 80% 20%, transparent 70%, ${selectedVariant.pulseColor} 70.5%, transparent 71%)
          `
        }}
        animate={{ rotate: -360 }}
        transition={{
          duration: 25,
          ease: "linear",
          repeat: Infinity
        }}
      />
    </motion.div>
  );
}