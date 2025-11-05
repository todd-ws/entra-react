# React Native Web + Microsoft Entra External ID (CIAM) — Authentication Tutorial

This repository contains a **React‑Native‑Web** app (Expo) that authenticates users with **Microsoft Entra External ID (Customers/CIAM)** using **MSAL for the web**.

- Web runtime: **Expo (React Native Web)**
- Auth library: **@azure/msal-browser** + **@azure/msal-react**
- Flow: **Sign up & Sign in** user flow (External ID)

---

## 1) Prerequisites

- Node.js 18+
- An **External** Microsoft Entra tenant (External ID / CIAM)
- Ability to create a **User flow** and an **App registration (SPA)** in that external tenant

---

## 2) Entra External ID setup (one-time)

1. **Create (or switch to) an External tenant**  
   In the Entra admin center, create a Microsoft Entra **External ID** tenant if you don’t already have one.

2. **Create a User flow** (e.g., `susi`)  
   Go to *External Identities → User flows* → **New user flow** → select Sign up & sign in → name it `susi`.  
   The full name becomes `B2C_1_susi`.

3. **Register a SPA app**  
   *External tenant → App registrations → New registration*  
   - Name: `rnw-web-spa`  
   - Supported accounts: **This organizational directory only**  
   - Platform: **Single-page application**  
   - Redirect URIs (add both for local dev):
     - `http://localhost:8081/`
     - `http://localhost:8081/redirect`
   - Permissions: `openid`, `offline_access` (and any API scopes you add later)

4. **Record these values**  
   - **TENANT_SUBDOMAIN**: your external tenant subdomain (e.g., `contoso`)  
   - **CLIENT_ID**: the Application (client) ID of your SPA app  
   - **USER_FLOW**: e.g., `B2C_1_susi`

> **Authority (External ID / CIAM):**  
> `https://<TENANT_SUBDOMAIN>.ciamlogin.com/<TENANT_SUBDOMAIN>.onmicrosoft.com/<USER_FLOW>`

---

## 3) Project structure

```
rnw-entra/
  README.md
  .env.example
  .gitignore
  app.config.ts
  package.json
  src/
    App.tsx
    index.web.tsx
    auth/
      authConfig.ts
      MsalProviderGate.tsx
      useAuth.ts
      withAuthGuard.tsx
    components/
      LoginButton.tsx
      LogoutButton.tsx
      Profile.tsx
    screens/
      Home.screen.tsx
      Protected.screen.tsx
```

---

## 4) Configure environment variables

Duplicate `.env.example` → create `.env` and fill your values:

```bash
TENANT_SUBDOMAIN=yourtenant      # e.g., 'contoso'
CLIENT_ID=00000000-0000-0000-0000-000000000000
USER_FLOW=B2C_1_susi
REDIRECT_URI=http://localhost:8081/
POST_LOGOUT_REDIRECT_URI=http://localhost:8081/
```

> **Note:** `ciamlogin.com` is used automatically via the authority in `authConfig.ts` based on your tenant subdomain and user flow.

---

## 5) Install & run

```bash
# 1) Install deps
npm install

# 2) Start the web dev server
npm run start

# 3) Open the browser at the URL Expo prints (usually http://localhost:8081/)
```

- Click **Protected** in the app’s mini-nav.  
- The auth guard calls `loginRedirect()` and sends you to your hosted External ID page on `*.ciamlogin.com`.  
- After you sign in, MSAL caches the token and the protected page renders.

---

## 6) Requesting API tokens later (optional)

When you build a backend API:
1. Register the API as **Web/API** in your External tenant, exposing a scope, e.g., `api://<api-client-id>/access_as_user`.
2. Add that scope to `tokenRequest.scopes` in `authConfig.ts`.
3. Acquire the token with `instance.acquireTokenSilent(...)` (fallback to `acquireTokenRedirect` if needed) and send it as `Authorization: Bearer <token>` to your API.

---

## 7) Troubleshooting

- **Wrong tenant/domain**: Ensure `knownAuthorities` in `authConfig.ts` matches `<TENANT_SUBDOMAIN>.ciamlogin.com` exactly.  
- **Redirect mismatch**: Ensure the redirect/POST-logout URIs in the app registration **exactly** match your `.env`.  
- **Popup blockers**: This sample uses `loginRedirect()`. You can switch to `loginPopup()` if preferred.  
- **Using a workforce tenant**: External ID user flows are only available in an *external* tenant.

---

## 8) License

MIT
