using Microsoft.Identity.Web;

var builder = WebApplication.CreateBuilder(args);

// Bind configuration
var azureAdSection = builder.Configuration.GetSection("AzureAd");
var allowedOrigins = builder.Configuration.GetSection("Cors:AllowedOrigins").Get<string[]>() ?? Array.Empty<string>();

// AuthN
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(azureAdSection, jwtOptions =>
    {
        // Optional hardening: pin audience explicitly if provided
        var aud = builder.Configuration["AzureAd:Audience"];
        if (!string.IsNullOrWhiteSpace(aud))
        {
            jwtOptions.TokenValidationParameters.ValidAudience = aud;
        }
    });

// AuthZ
builder.Services.AddAuthorization(options =>
{
    options.AddPolicy("RequireApiReadScope", policy =>
        policy.RequireAssertion(ctx =>
            ctx.User.HasClaim("scp", c => c.Split(' ').Contains("api.read"))));

    options.AddPolicy("RequireApiAdminRole", policy =>
        policy.RequireClaim("roles", "Api.Admin"));
});

// CORS
builder.Services.AddCors(o =>
{
    o.AddPolicy("locked", p =>
    {
        if (allowedOrigins.Length > 0)
        {
            p.WithOrigins(allowedOrigins).AllowAnyHeader().AllowAnyMethod();
        }
        else
        {
            // Default: allow none unless configured
            p.WithOrigins(Array.Empty<string>());
        }
    });
});

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "App.Api", Version = "v1" });
    // Bearer configuration for Swagger
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "JWT Authorization header using the Bearer scheme."
    };
    c.AddSecurityDefinition("Bearer", securityScheme);
    var securityRequirement = new OpenApiSecurityRequirement
    {
        { securityScheme, new[] { "Bearer" } }
    };
    c.AddSecurityRequirement(securityRequirement);
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseCors("locked");
app.UseAuthentication();
app.UseAuthorization();

// Public health endpoint
app.MapGet("/health", () => Results.Ok(new { status = "OK" }))
    .AllowAnonymous();

// Protected scope endpoint
app.MapGet("/orders", () => new[] { new { id = 1, total = 99.95 } })
    .RequireAuthorization("RequireApiReadScope");

// Protected app role endpoint
app.MapPost("/admin/rebuild", () => Results.Accepted())
    .RequireAuthorization("RequireApiAdminRole");

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.Run();
