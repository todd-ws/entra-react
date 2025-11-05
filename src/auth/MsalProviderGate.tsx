// src/auth/MsalProviderGate.tsx
import React from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { msalConfig } from "./authConfig";

const pca = new PublicClientApplication(msalConfig);

type Props = { children: React.ReactNode };

export default function MsalProviderGate({ children }: Props) {
  return <MsalProvider instance={pca}>{children}</MsalProvider>;
}
