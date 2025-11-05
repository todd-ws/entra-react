// src/auth/authConfig.ts
import Constants from "expo-constants";
import { LogLevel, type Configuration, type RedirectRequest } from "@azure/msal-browser";

const cfg = (Constants as any).expoConfig?.extra as Record<string, string>;

const tenant = cfg.TENANT_SUBDOMAIN;
const userFlow = cfg.USER_FLOW;
const clientId = cfg.CLIENT_ID;
const redirectUri = cfg.REDIRECT_URI;
const postLogoutRedirectUri = cfg.POST_LOGOUT_REDIRECT_URI;

// External ID / CIAM authority (user flow)
const authority = `https://${tenant}.ciamlogin.com/${tenant}.onmicrosoft.com/${userFlow}`;

export const msalConfig: Configuration = {
  auth: {
    clientId,
    authority,
    knownAuthorities: [`${tenant}.ciamlogin.com`],
    redirectUri,
    postLogoutRedirectUri
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false
  },
  system: {
    loggerOptions: { logLevel: LogLevel.Error }
  }
};

export const loginRequest: RedirectRequest = {
  scopes: ["openid", "offline_access"]
};

export const tokenRequest = {
  scopes: ["openid", "offline_access"]
};
