// src/auth/withAuthGuard.tsx
import React from "react";
import { useAuth } from "./useAuth";

export function withAuthGuard<T>(Component: React.ComponentType<T>) {
  return function Guarded(props: T) {
    const { isAuthenticated, signIn } = useAuth();
    if (!isAuthenticated) {
      signIn();
      return null;
    }
    return <Component {...props} />;
  };
}
