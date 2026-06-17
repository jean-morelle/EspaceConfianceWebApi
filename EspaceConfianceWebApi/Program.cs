using EspaceConfiance.Application;
using EspaceConfiance.Domain.Entities;
using EspaceConfiance.Infractructure;
using EspaceConfiance.Infractructure.Data;
using EspaceConfianceWebApi.Hubs;
using EspaceConfianceWebApi.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi.Models;

var builder = WebApplication.CreateBuilder(args);

// Layers
builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

// Controllers + Swagger
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "EspaceConfiance API",
        Version = "v1",
        Description = "API de la plateforme de discussion EspaceConfiance"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Entrez: Bearer {token}"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            []
        }
    });
});

// SignalR
builder.Services.AddSignalR();

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins(builder.Configuration["AllowedOrigins"] ?? "http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

var app = builder.Build();

// Middleware
app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "EspaceConfiance API v1"));
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// SignalR Hubs
app.MapHub<ChatHub>("/hubs/chat");
app.MapHub<NotificationHub>("/hubs/notification");

// ── Admin seeder ────────────────────────────────────────────────
using (var scope = app.Services.CreateScope())
{
    var db  = scope.ServiceProvider.GetRequiredService<AppDbContext>();
    var cfg = app.Configuration.GetSection("AdminSeed");

    var email    = cfg["Email"]    ?? "admin@espaceconfiance.com";
    var username = cfg["Username"] ?? "admin";
    var password = cfg["Password"] ?? "Admin@123456";

    if (!await db.Users.AnyAsync(u => u.Role == "Admin"))
    {
        db.Users.Add(new User
        {
            Username     = username,
            Email        = email.ToLower(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(password, 12),
            Role         = "Admin",
            IsOnline     = false
        });
        await db.SaveChangesAsync();
        Console.WriteLine($"[Seed] Admin créé → {email}");
    }
}

app.Run();
