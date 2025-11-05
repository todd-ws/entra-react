# Create Api App #

**Tenant & App Registrations (External ID)**

1. **External tenant**: Use an *External ID (customers)* tenant (not a workforce tenant). This enables customer user flows and social identity providers.
2. **Register the API app**
   - App type: **Web API** (Microsoft identity platform).
   - **Expose an API** → set **Application ID URI** (e.g., `api://<api-client-id>`) and define at least one **scope**, e.g., `api.read`. - Define **app roles** for daemon/service callers (e.g., `Api.Admin`).
3. **Register the client app(s)** (web/native/mobile) in the same External tenant.
   - Add the API’s scope under **API permissions**.
   - Associate the client with **External ID user flow(s)** for sign‑up/sign‑in (the API does *not* attach user flows—only the client does).

4. **Authentication blade**
    Add platform (need client endpoints first). Select Multitenant\

5. **Certificates & secrets**
    Create a client secret key and save the value somewhere. i.e. keyvault\

6. **Token Configuration**
    Add an optional claim and/or group claim.

7. **Expose an API**
    Add 2 scopes - Select Admins and Users
    - Api.Modify
    - Api.Read

*Map enforcement to `scp` (scopes) or `roles` claims in authorization policies.service integrations.*

*After the client has been created, come back here and add the client application*

*Scope vs. Role Design*
- **Scopes (delegated)**
    User‑delegated calls from SPA/native apps (e.g., `api.read`, `api.write`). Surface only what’s essential.
- **App roles (application)**
    Daemon‑to‑API/server‑to‑server calls (e.g., `Api.Admin`, `Ops.ReadOnly`). Use for background jobs and service integrations.

## Environment Checklist

- [.NET 8 SDK] installed
- External ID (customers) tenant available
- API **App Registration** with exposed scopes/roles
- Client **App Registration** wired to appropriate user flows
- Known client origins configured under CORS
- Swagger enabled for quick verification
