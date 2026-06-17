// ┌────────────────────────────────────────────────────────────────────┐
// │ LiteChat - Auth Service                                           │
// │ Microservicio de autenticación: registro, login, JWT, gestión de  │
// │ usuarios.                                                         │
// │                                                                   │
// │ Endpoints:  /api/auth/*                                           │
// │ Middleware:  ErrorHandlingMiddleware                               │
// │ Puertos:     5004 (HTTP), 5005 (HTTPS)                            │
// └────────────────────────────────────────────────────────────────────┘

using Auth.Endpoints;
using Auth.Middleware;
using Auth.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Shared.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── Configurar CORS ──────────────────────────────────────────────────────
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:3000", "https://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// ── Base de datos ────────────────────────────────────────────────────────
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// ── Servicios ────────────────────────────────────────────────────────────
builder.Services.AddScoped<IAuthService, AuthService>();

// ── JWT ──────────────────────────────────────────────────────────────────
var jwtKey = builder.Configuration["Jwt:Key"] ?? throw new Exception("Invalid Jwt:Key");
var jwtIssuer = builder.Configuration["Jwt:Issuer"] ?? throw new Exception("Invalid Jwt:Issuer");
var jwtAudience = builder.Configuration["Jwt:Audience"] ?? throw new Exception("Invalid Jwt:Audience");

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = jwtIssuer,
            ValidAudience = jwtAudience,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey))
        };

        // Permite que SignalR reciba el token vía query string
        options.Events = new JwtBearerEvents
        {
            OnMessageReceived = context =>
            {
                var accessToken = context.Request.Query["access_token"];
                var path = context.HttpContext.Request.Path;

                if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hubs"))
                {
                    context.Token = accessToken;
                }

                return Task.CompletedTask;
            }
        };
    });

builder.Services.AddAuthorization();

// ── Swagger / OpenAPI ────────────────────────────────────────────────────
builder.Services.AddOpenApi();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "LiteChat Auth API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header usando Bearer scheme. Ejemplo: \"Bearer {token}\"",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// ── Pipeline HTTP ─────────────────────────────────────────────────────────
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "LiteChat Auth API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseMiddleware<ErrorHandlingMiddleware>();

app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapAuthEndpoints();
// app.MapUserEndpoints(); // Descomentar cuando los tengas

app.Run();
