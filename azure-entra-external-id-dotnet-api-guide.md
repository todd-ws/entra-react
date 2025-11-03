# ASP.NET Core Web API with Microsoft Entra External ID (Customers)

This is a pragmatic, end‑to‑end enablement plan to stand up a production‑ready ASP.NET Core Web API secured by **Microsoft Entra External ID (customers)**. No fluff—just the critical path.

---

## 1) North‑Star Architecture

- **Client** (web/mobile/native) authenticates users with **Entra External ID** user flows and obtains an **access token** (OAuth 2.0 / OIDC).
- **API** (your C# Web API) **does not run user flows**; it **validates the JWT** (issuer/audience) and enforces **scopes** (delegated) and/or **app roles** (application).

---

## 2) Tenant & App Registrations (External ID)

1. **External tenant**: Use an *External ID (customers)* tenant (not a workforce tenant). This enables customer user flows and social identity providers.
2. **Register the API app**
   - App type: **Web API** (Microsoft identity platform).
   - **Expose an API** → set **Application ID URI** (e.g., `api://<api-client-id>`) and define at least one **scope**, e.g., `api.read`. Optionally define **app roles** for daemon/service callers (e.g., `Api.Admin`).
3. **Register the client app(s)** (web/native/mobile) in the same External tenant.
   - Add the API’s scope under **API permissions**.
   - Associate the client with **External ID user flow(s)** for sign‑up/sign‑in (the API does *not* attach user flows—only the client does).

> **Tip:** Keep the API and client registrations separate; version scopes and roles deliberately to prevent breaking changes.

---

## 3) Scaffold the API (.NET 8 LTS)

```bash
mkdir App.Api && cd $_
dotnet new webapi -n App.Api
cd App.Api
dotnet add package Microsoft.Identity.Web
dotnet add package Microsoft.AspNetCore.Authentication.JwtBearer
```

Rationale: **Microsoft.Identity.Web** streamlines JWT validation, claims mapping, downstream calls, and policy wiring.

---

## 4) Wire Up Authentication & Authorization

**appsettings.json**

```json
{
  "AzureAd": {
    "Instance": "https://login.microsoftonline.com/",
    "TenantId": "<ExternalTenantIdGuid>",
    "ClientId": "<ApiAppRegistration_ClientId>",
    "Audience": "api://<ApiAppRegistration_ClientId>",
    "Domain": "<your-tenant-name>.onmicrosoft.com"
  },
  "AllowedHosts": "*"
}
```

**Program.cs** (minimal API)

```csharp
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

// AuthN
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"),
        jwtOptions => {
            // Optional: audience/issuer hardening
            jwtOptions.TokenValidationParameters.ValidAudience =
                builder.Configuration["AzureAd:Audience"];
        });

// AuthZ: require scope (delegated) and/or app role (application)
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireApiReadScope", policy =>
        policy.RequireClaim("scp", "api.read")); // or policy.RequireScope("api.read") with Microsoft.Identity.Web

    options.AddPolicy("RequireApiAdminRole", policy =>
        policy.RequireClaim("roles", "Api.Admin"));
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Public health check
app.MapGet("/health", () => "OK").AllowAnonymous();

// Protected endpoints
app.MapGet("/orders", () => new [] { new { id = 1, total = 99.95 } })
    .RequireAuthorization("RequireApiReadScope");

app.MapPost("/admin/rebuild", () => Results.Accepted())
    .RequireAuthorization("RequireApiAdminRole");

app.Run();
```

> **Why this works:** ASP.NET Core validates JWTs issued by your External tenant (issuer) for your API audience. Authorization policies block requests missing required **scope(s)** or **role(s)**.

---

## 5) Scope vs. Role Design

- **Scopes (delegated)**: User‑delegated calls from SPA/native apps (e.g., `api.read`, `api.write`). Surface only what’s essential.
- **App roles (application)**: Daemon‑to‑API/server‑to‑server calls (e.g., `Api.Admin`, `Ops.ReadOnly`). Use for background jobs and service integrations.

Map enforcement to `scp` (scopes) or `roles` claims in authorization policies.

---

## 6) CORS & Token Hardening

**CORS** — allow only known client origins:

```csharp
builder.Services.AddCors(o =>
{
    o.AddPolicy("locked", p => p
        .WithOrigins("https://app.example.com")
        .AllowAnyHeader()
        .AllowAnyMethod());
});
...
app.UseCors("locked");
```

**Hardening**
- Pin **audience** to `api://<client-id>` (or custom App ID URI).
- Pin **issuer** to the External tenant’s authority.
- Deny tokens from unknown tenants/tokens without required claims.

---

## 7) Test the API End‑to‑End

**Option A — Real client flow (recommended)**
1. Sign in through the External ID user flow.
2. Obtain an **access token** for your API scope.
3. Call `/orders` with `Authorization: Bearer <token>` and expect **200 OK**.

**Option B — Daemon (client credentials)**
1. Create a confidential client and assign **app role** (e.g., `Api.Admin`).
2. Request a token for your API using the `.default` scope: `api://<api-client-id>/.default`.
3. Call `POST /admin/rebuild` and expect **202 Accepted**.

---

## 8) Operational Guardrails

- **Key rotation**: Trust the tenant JWKS; avoid long‑term key caching.
- **Least privilege**: Granular scopes/roles; default‑deny with `[Authorize]` everywhere.
- **Error hygiene**: `401` for missing/invalid tokens; `403` for insufficient scopes/roles.
- **Telemetry**: Log `sub`, `tid`, `scp`/`roles` (hash or pseudonymize where appropriate).
- **Versioning**: Version scopes (`api.read.v2`) to ship non‑breaking changes.

---

## 9) Postman Sanity Check

1. **Confidential client** in External tenant with **app role** granted.
2. Request token (Client Credentials) with **Scope** = `api://<api-client-id>/.default`.
3. Invoke secured endpoint with `Authorization: Bearer <token>`.

---

## Appendix A — Controller‑Based Variant

**Program.cs**

```csharp
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));
builder.Services.AddAuthorization();
builder.Services.AddControllers();

app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
```

**OrdersController.cs**

```csharp
[ApiController]
[Route("[controller]")]
public class OrdersController : ControllerBase
{
    [HttpGet]
    [Authorize(Policy = "RequireApiReadScope")]
    public IActionResult Get() => Ok(new [] { new { id = 1, total = 99.95 } });
}
```

---

## Appendix B — On‑Behalf‑Of (OBO) Pattern

If your API must call **another** API with the **user’s delegation**, implement the **OBO** flow using `ITokenAcquisition` from **Microsoft.Identity.Web** to obtain downstream access tokens. Apply the same authorization rigor downstream.

---

## Environment Checklist

- [.NET 8 SDK] installed
- External ID (customers) tenant available
- API **App Registration** with exposed scopes/roles
- Client **App Registration** wired to appropriate user flows
- Known client origins configured under CORS
- Swagger enabled for quick verification
- Postman/HTTPie for token and call validation

---

## Next Step (Optional)

Package this into a turnkey starter repo (dotnet 8 + Microsoft.Identity.Web + policies + Swagger + env templates) and a Postman Collection to accelerate project initiation.