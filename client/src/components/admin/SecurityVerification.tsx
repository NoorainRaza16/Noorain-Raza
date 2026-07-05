import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, ShieldAlert, Fingerprint, Lock, Shield, XCircle, AlertCircle } from "lucide-react";

interface SecurityVerificationProps {
  isVerifying: boolean;
  isSuccess?: boolean;
  isError?: boolean;
  errorMessage?: string;
}

export function SecurityVerification({ 
  isVerifying, 
  isSuccess = false,
  isError = false,
  errorMessage = "Authentication failed. Please verify your credentials."
}: SecurityVerificationProps) {
  const [authenticating, setAuthenticating] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [showError, setShowError] = useState(false);
  
  // Verification steps
  const verificationSteps = [
    { icon: <Fingerprint className="h-6 w-6" />, text: "Identity verification" },
    { icon: <Lock className="h-6 w-6" />, text: "Credentials validation" },
    { icon: <Shield className="h-6 w-6" />, text: "Security protocol check" }
  ];
  
  useEffect(() => {
    if (isVerifying) {
      setAuthenticating(true);
      setVerificationStep(0);
      setShowError(false);
      
      // Simulate step-by-step verification process
      const stepInterval = setInterval(() => {
        setVerificationStep(prev => {
          if (prev < verificationSteps.length - 1) {
            return prev + 1;
          } else {
            clearInterval(stepInterval);
            
            // Show error or continue to success
            if (isError) {
              setTimeout(() => setShowError(true), 500);
            }
            
            // Finish animation
            if (!isError) {
              setTimeout(() => setAuthenticating(false), 800);
            }
            
            return prev;
          }
        });
      }, 800);
      
      return () => clearInterval(stepInterval);
    } else {
      setAuthenticating(false);
      setShowError(false);
    }
  }, [isVerifying, isError, verificationSteps.length]);
  
  return (
    <AnimatePresence>
      {authenticating && (
        <motion.div
          className="fixed inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="bg-gray-900/90 border border-blue-500/30 rounded-lg shadow-2xl shadow-blue-500/20 p-8 max-w-md w-full mx-4"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
          >
            {/* Header with shield animation */}
            <div className="flex justify-center mb-6">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ 
                  scale: [0, 1.2, 1],
                  rotate: [0, 15, 0, -15, 0]
                }}
                transition={{ 
                  duration: 1.5,
                  times: [0, 0.4, 0.6, 0.8, 1]
                }}
              >
                {showError ? (
                  <div className="text-red-500">
                    <ShieldAlert className="h-16 w-16" />
                  </div>
                ) : isSuccess ? (
                  <div className="text-emerald-500">
                    <CheckCircle className="h-16 w-16" />
                  </div>
                ) : (
                  <div className="text-blue-500">
                    <motion.div
                      animate={{ 
                        rotate: 360,
                      }}
                      transition={{ 
                        duration: 4,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className="relative"
                    >
                      <div className="absolute inset-0 rounded-full border-4 border-t-transparent border-blue-500/30" />
                      <div className="absolute inset-0">
                        <motion.div 
                          className="absolute inset-0 rounded-full border-4 border-b-transparent border-blue-500"
                          animate={{ rotate: [0, 360] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                        />
                      </div>
                      <Shield className="h-16 w-16" />
                    </motion.div>
                  </div>
                )}
              </motion.div>
            </div>
            
            {/* Title */}
            <motion.h2
              className="text-center text-2xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-400"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              {showError ? "ACCESS DENIED" : (isSuccess ? "ACCESS GRANTED" : "AUTHENTICATING")}
            </motion.h2>
            
            {/* Status message */}
            <motion.p
              className={`text-center mb-8 ${showError ? "text-red-400" : (isSuccess ? "text-emerald-400" : "text-gray-400")}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {showError 
                ? errorMessage 
                : (isSuccess 
                  ? "Identity verified. System access granted." 
                  : "Validating security credentials...")}
            </motion.p>
            
            {/* Verification steps */}
            {!showError && !isSuccess && (
              <div className="space-y-4 mb-6">
                {verificationSteps.map((step, index) => (
                  <div key={index} className="flex items-center">
                    <motion.div
                      className={`mr-3 ${
                        verificationStep >= index ? "text-blue-500" : "text-gray-600"
                      }`}
                      initial={{ scale: 0 }}
                      animate={{ 
                        scale: verificationStep >= index ? 1 : 0,
                      }}
                      transition={{ 
                        type: "spring", 
                        damping: 12,
                        delay: index * 0.2
                      }}
                    >
                      {step.icon}
                    </motion.div>
                    
                    <div className="flex-1">
                      <motion.div
                        className="h-2 bg-gray-800 rounded-full overflow-hidden"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.2 + 0.1 }}
                      >
                        <motion.div 
                          className="h-full bg-blue-500 rounded-full"
                          initial={{ width: "0%" }}
                          animate={{ 
                            width: verificationStep > index 
                              ? "100%" 
                              : (verificationStep === index ? "100%" : "0%") 
                          }}
                          transition={{ 
                            duration: verificationStep === index ? 0.8 : 0.2,
                            ease: "easeInOut"
                          }}
                        />
                      </motion.div>
                      
                      <motion.div 
                        className="text-sm mt-1 flex justify-between"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.2 + 0.2 }}
                      >
                        <span className={verificationStep >= index ? "text-blue-400" : "text-gray-500"}>
                          {step.text}
                        </span>
                        
                        {verificationStep > index && (
                          <motion.span
                            className="text-emerald-500"
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </motion.span>
                        )}
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Error display */}
            {showError && (
              <motion.div
                className="bg-red-900/30 border border-red-500/50 rounded-md p-4 my-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", damping: 25 }}
              >
                <div className="flex">
                  <div className="flex-shrink-0 text-red-500">
                    <AlertCircle className="h-5 w-5" />
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-400">
                      Security Breach Detected
                    </h3>
                    <div className="mt-2 text-sm text-red-300 space-y-1">
                      <p>Incorrect credentials provided. Please verify:</p>
                      <ul className="list-disc pl-5 text-xs space-y-1">
                        <li>Username format</li>
                        <li>Email association</li>
                        <li>Password combination</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
            
            {/* Success animation */}
            {isSuccess && (
              <motion.div
                className="flex justify-center"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", damping: 20, delay: 0.5 }}
              >
                <div className="relative">
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full opacity-20"
                    animate={{ 
                      scale: [1, 1.5, 1],
                      opacity: [0.2, 0.4, 0.2]
                    }}
                    transition={{ 
                      duration: 2,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  />
                  <div className="bg-gray-800 p-4 rounded-full text-emerald-500">
                    <CheckCircle className="h-12 w-12" />
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}