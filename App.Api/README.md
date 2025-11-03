# App.Api — ASP.NET Core Web API secured by Microsoft Entra External ID (customers)

Production-grade starter kit for a .NET 9 Web API that validates JWT access tokens from an **External ID (customers)** tenant, enforces **scopes** and **app roles**, and ships with Swagger and CORS hardening.

## Getting Started

### 1) Prereqs
- .NET 9 SDK
- External ID (customers) tenant
- Two app registrations in that tenant:
  - **API** (Expose an API → scopes, app roles)
  - **Client** (assign user flows and add API permissions)

### 2) Configure
Set these values in `appsettings.Development.json` (or environment variables):
- `AzureAd:TenantId`
- `AzureAd:ClientId` (the API app registration client ID)
- `AzureAd:Audience` (`api://<ApiAppRegistration_ClientId>` or custom App ID URI)
- `AzureAd:Domain` (`<tenant>.onmicrosoft.com`)

### 3) Run
```bash
dotnet restore
dotnet run
```
Swagger UI: https://localhost:5001/swagger

### 4) Call the API
- `/health` is anonymous.
- `/orders` requires **scope** `api.read`.
- `/admin/rebuild` requires **app role** `Api.Admin`.

Attach `Authorization: Bearer <access_token>` to protected endpoints.

## Policies
- `RequireApiReadScope` → requires `scp` contains `api.read`
- `RequireApiAdminRole` → requires `roles` contains `Api.Admin`

## CORS
Update the `Cors:AllowedOrigins` list in `appsettings.Development.json` and `appsettings.json` as needed.

## Postman
Import `postman/App.Api.postman_collection.json`.
Set the `baseUrl` variable to your local URL and use a valid token from your External ID tenant.
