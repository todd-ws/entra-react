// src/auth/useAuth.ts
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { loginRequest } from "./authConfig";

export function useAuth() {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const account = accounts[0];

  const signIn = async () => {
    await instance.loginRedirect(loginRequest);
  };

  const signOut = async () => {
    await instance.logoutRedirect();
  };

  return { isAuthenticated, account, signIn, signOut };
}
