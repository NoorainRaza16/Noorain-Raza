import { Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface AccessDeniedProps {
  onAdminLogin?: () => void;
}

export function AccessDenied({ onAdminLogin }: AccessDeniedProps) {
  const [, setLocation] = useLocation();

  const handleAdminLogin = () => {
    if (onAdminLogin) {
      onAdminLogin();
    } else {
      setLocation("/admin/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center relative overflow-hidden">
      {/* Main content */}
      <div className="relative z-10 text-center max-w-lg mx-auto px-6">
        {/* Security Shield Icon */}
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full border-2 border-red-500 bg-transparent">
            <Shield className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-white mb-4 tracking-wide">
          Access Denied
        </h1>

        {/* Subtitle */}
        <p className="text-slate-300 mb-8 text-base">
          Admin authentication required to access this page.
        </p>

        {/* Admin Login Button */}
        <Button
          onClick={handleAdminLogin}
          className="bg-blue-500 hover:bg-blue-600 text-white px-8 py-3 rounded-full font-medium transition-colors duration-200 mb-12 text-base"
        >
          <svg
            className="w-4 h-4 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
            />
          </svg>
          Admin Login
        </Button>

        {/* Security Protocol Information */}
        <div className="bg-slate-800/30 border border-slate-700/30 rounded p-4 text-left max-w-sm mx-auto">
          <div className="space-y-1 font-mono text-xs text-slate-400">
            <div>SECURITY_PROTOCOL: ADMIN_AUTHENTICATION_REQUIRED</div>
            <div>PATH: /admin</div>
            <div>STATUS: AUTHORIZATION_FAILED</div>
            <div>LOGIN_PATH: /admin/login</div>
          </div>
        </div>
      </div>
    </div>
  );
}
