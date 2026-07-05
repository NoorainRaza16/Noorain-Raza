import { motion } from "framer-motion";
import { CheckCircle, AlertTriangle, X, Database, Shield, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SciFiLoadingProps {
  status: "initializing" | "authenticating" | "success" | "error";
  message?: string;
  errorMessage?: string;
}

export default function SciFiLoading({ status, message, errorMessage }: SciFiLoadingProps) {
  const [loadingPercent, setLoadingPercent] = useState(0);
  
  useEffect(() => {
    if (status === "authenticating") {
      const interval = setInterval(() => {
        setLoadingPercent(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return Math.min(prev + Math.random() * 10, 100);
        });
      }, 200);
      
      return () => clearInterval(interval);
    } else if (status === "error") {
      setLoadingPercent(0);
    } else if (status === "success") {
      setLoadingPercent(100);
    }
  }, [status]);
  
  return (
    <div className="min-h-screen bg-black flex items-center justify-center font-mono text-cyan-400">
      <div className="max-w-2xl w-full px-4">
        <div className="relative w-full">
          {/* Futuristic loading panel with glow effects */}
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-cyan-500/20 blur-lg"></div>
          
          <div className="relative border border-cyan-900/50 rounded-lg bg-gray-900/80 p-4 sm:p-6 backdrop-blur-sm overflow-hidden">
            {/* Top header */}
            <div className="mb-6 flex items-center justify-between border-b border-cyan-900/30 pb-3">
              <div className="flex items-center space-x-2">
                {status === "authenticating" && (
                  <Loader2 className="w-5 h-5 text-cyan-400 animate-spin" />
                )}
                {status === "success" && (
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                )}
                {status === "error" && (
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                )}
                
                <span className="font-medium tracking-wide">
                  {status === "authenticating" && "AUTHENTICATION IN PROGRESS"}
                  {status === "success" && "AUTHENTICATION SUCCESSFUL"}
                  {status === "error" && "AUTHENTICATION FAILURE"}
                </span>
              </div>
              
              <div className="text-xs opacity-70 flex items-center">
                <Shield className="w-3 h-3 mr-1 opacity-70" />
                <span>SECURITY PROTOCOL v3.8.2</span>
              </div>
            </div>
            
            {/* Status message */}
            <div className="mb-6 text-center">
              {status === "authenticating" && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm sm:text-base text-center font-medium"
                >
                  {message || "VERIFYING CREDENTIALS..."}
                </motion.div>
              )}
              
              {status === "success" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-emerald-400 text-sm sm:text-base text-center font-medium"
                >
                  {message || "IDENTITY CONFIRMED - ACCESS GRANTED"}
                </motion.div>
              )}
              
              {status === "error" && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-red-400 text-sm sm:text-base text-center font-medium"
                >
                  {errorMessage || "AUTHENTICATION FAILED - ACCESS DENIED"}
                </motion.div>
              )}
            </div>
            
            {/* Progress indicators */}
            <div className="mb-6 w-full">
              {/* Main progress bar */}
              <div className="h-1.5 bg-gray-800 rounded-full mb-3 overflow-hidden">
                <motion.div
                  className={`h-full rounded-full ${
                    status === "error" 
                      ? "bg-red-500" 
                      : "bg-gradient-to-r from-blue-500 to-cyan-400"
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${loadingPercent}%` }}
                  transition={{ 
                    type: "spring",
                    stiffness: 50,
                    duration: 0.5
                  }}
                />
              </div>
              
              {/* Secondary visualization */}
              <div className="flex justify-between items-center">
                {/* Left status */}
                <div className="text-xs opacity-70">
                  {status === "authenticating" && `${Math.floor(loadingPercent)}% COMPLETE`}
                  {status === "success" && "100% COMPLETE"}
                  {status === "error" && "PROCESS TERMINATED"}
                </div>
                
                {/* Right status */}
                {status === "authenticating" && (
                  <div className="flex items-center text-xs opacity-70">
                    <Database className="w-3 h-3 mr-1" />
                    <span className="animate-pulse">ACCESSING SECURE DATABASE</span>
                  </div>
                )}
                
                {status === "success" && (
                  <div className="flex items-center text-xs text-emerald-400">
                    <Shield className="w-3 h-3 mr-1" />
                    <span>SECURE CONNECTION ESTABLISHED</span>
                  </div>
                )}
                
                {status === "error" && (
                  <div className="flex items-center text-xs text-red-400">
                    <X className="w-3 h-3 mr-1" />
                    <span>CONNECTION FAILED</span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Authentication logs */}
            <div className="text-xs space-y-2 max-h-32 overflow-y-auto custom-scrollbar border border-gray-800 rounded p-2 bg-black/30">
              <div className="flex">
                <span className="text-gray-500 min-w-[120px]">{new Date().toISOString().slice(11, 19)}</span>
                <span>Initializing quantum authentication protocol</span>
              </div>
              
              {loadingPercent >= 20 && (
                <div className="flex">
                  <span className="text-gray-500 min-w-[120px]">{new Date().toISOString().slice(11, 19)}</span>
                  <span>Establishing secure channel</span>
                </div>
              )}
              
              {loadingPercent >= 40 && (
                <div className="flex">
                  <span className="text-gray-500 min-w-[120px]">{new Date().toISOString().slice(11, 19)}</span>
                  <span>Verifying identity parameters</span>
                </div>
              )}
              
              {loadingPercent >= 60 && (
                <div className="flex">
                  <span className="text-gray-500 min-w-[120px]">{new Date().toISOString().slice(11, 19)}</span>
                  <span>Neural signature analysis</span>
                </div>
              )}
              
              {loadingPercent >= 80 && (
                <div className="flex">
                  <span className="text-gray-500 min-w-[120px]">{new Date().toISOString().slice(11, 19)}</span>
                  <span>Retrieving security clearance level</span>
                </div>
              )}
              
              {loadingPercent >= 100 && status === "success" && (
                <div className="flex text-emerald-400">
                  <span className="text-emerald-700 min-w-[120px]">{new Date().toISOString().slice(11, 19)}</span>
                  <span>Authentication successful - Redirecting to admin interface</span>
                </div>
              )}
              
              {status === "error" && (
                <div className="flex text-red-400">
                  <span className="text-red-700 min-w-[120px]">{new Date().toISOString().slice(11, 19)}</span>
                  <span>Authentication failed - Invalid security parameters</span>
                </div>
              )}
            </div>
            
            {/* Security information */}
            <div className="mt-4 flex justify-between items-center text-[8px] text-gray-500">
              <div>Session ID: {Math.random().toString(36).substring(2, 15)}</div>
              <div>Encryption: AES-256-GCM</div>
              <div className="flex items-center">
                <span className="block h-1.5 w-1.5 rounded-full bg-cyan-500 animate-pulse mr-1"></span>
                <span>Active Security Protocol</span>
              </div>
            </div>
            
            {/* Animated scanner effect */}
            <div 
              className="absolute left-0 right-0 h-px bg-cyan-400/40 pointer-events-none" 
              style={{
                top: '50%',
                animation: 'scanLine 4s ease-in-out infinite',
                boxShadow: '0 0 4px rgba(6, 182, 212, 0.7)'
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}