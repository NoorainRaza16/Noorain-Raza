import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { Route } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { AccessDenied } from "@/components/access-denied";

// This is our enhanced security protected route component
// It performs both client-side and server-side authentication verification
export function ProtectedRoute({
  path,
  component: Component,
}: {
  path: string;
  component: React.ComponentType;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Route path={path}>
      {() => {
        // Show loading state when authenticating
        if (isLoading) {
          return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900">
              <Loader2 className="h-12 w-12 animate-spin text-blue-500 mb-4" />
              <p className="text-gray-400">Authenticating...</p>
            </div>
          );
        }

        // Not authenticated - show access denied
        if (!isAuthenticated) {
          return <AccessDenied />;
        }

        // Authentication successful - render the protected component
        return <Component />;
      }}
    </Route>
  );
}