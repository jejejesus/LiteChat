// ┌────────────────────────────────────────────────────────────────────┐
// │ LiteChat - Realtime Service                                       │
// │ Microservicio SignalR: mensajería en tiempo real, typing, notif.  │
// │                                                                   │
// │ Hubs:      ChatHub     → /hubs/chat                               │
// │ Internal:  /api/internal/notify/* (llamado por Messages)          │
// │ Puertos:   5008 (HTTP), 5009 (HTTPS)                              │
// └────────────────────────────────────────────────────────────────────┘

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Realtime.Endpoints;
using Realtime.Hubs;
using Shared.Data;
using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ── SignalR ────────────────────────────────────────────────────────────
builder.Services.AddSignalR();

// ── CORS ────────────────────────────────────────────────────────────────
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

var app = builder.Build();

// ── Pipeline HTTP ─────────────────────────────────────────────────────────
app.UseCors();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapHub<ChatHub>("/hubs/chat");
app.MapNotificationEndpoints();

app.Run();
