using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using ResQConnect.API.Data;
using ResQConnect.API.Interfaces;
using ResQConnect.API.Mappings;
using ResQConnect.API.Middleware;
using ResQConnect.API.Repositories;
using ResQConnect.API.Services;

var builder = WebApplication.CreateBuilder(args);

// Listen on the port provided by the hosting platform
var port = Environment.GetEnvironmentVariable("PORT") ?? "8080";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

builder.Logging.ClearProviders();
builder.Logging.AddConsole();
builder.Logging.AddDebug();

// Data Protection
builder.Services.AddDataProtection()
    .PersistKeysToFileSystem(
        new DirectoryInfo(Path.Combine(builder.Environment.ContentRootPath, "App_Data", "DataProtectionKeys"))
    );

// Database
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    var serverVersion = new MySqlServerVersion(new Version(8, 0, 30));

    options.UseMySql(connectionString, serverVersion, mysqlOptions =>
    {
        mysqlOptions.EnableRetryOnFailure(
            maxRetryCount: 5,
            maxRetryDelay: TimeSpan.FromSeconds(10),
            errorNumbersToAdd: null);
    });
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowClient", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// Controllers
builder.Services.AddControllers();

// AutoMapper
builder.Services.AddAutoMapper(typeof(MappingProfile).Assembly);

// JWT
var secretKey = builder.Configuration["JwtSettings:Secret"]
                ?? "SuperSecretKeyForResQConnectDevDeployment2026";

var key = Encoding.ASCII.GetBytes(secretKey);

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;

    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(key),

        ValidateIssuer = true,
        ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? "ResQConnect.API",

        ValidateAudience = true,
        ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? "ResQConnect.Client",

        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

// Generic Repository
builder.Services.AddScoped(typeof(IRepository<>), typeof(Repository<>));

// Repositories
builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<IDisasterRepository, DisasterRepository>();
builder.Services.AddScoped<ISOSRequestRepository, SOSRequestRepository>();
builder.Services.AddScoped<IReliefCampRepository, ReliefCampRepository>();
builder.Services.AddScoped<IVolunteerRepository, VolunteerRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<IMissingPersonRepository, MissingPersonRepository>();
builder.Services.AddScoped<IHazardReportRepository, HazardReportRepository>();

// Services
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IDisasterService, DisasterService>();
builder.Services.AddScoped<ISOSService, SOSService>();
builder.Services.AddScoped<ICampService, CampService>();
builder.Services.AddScoped<IVolunteerService, VolunteerService>();
builder.Services.AddScoped<INotificationService, NotificationService>();

// Swagger
builder.Services.AddEndpointsApiExplorer();

builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "ResQConnect API",
        Version = "v1"
    });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Enter JWT Token",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var app = builder.Build();

// Middleware
app.UseMiddleware<ExceptionMiddleware>();
app.UseMiddleware<LoggingMiddleware>();

// Swagger (Enabled in all environments)
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "ResQConnect API v1");
    c.RoutePrefix = "swagger";
});

app.UseStaticFiles();

app.UseCors("AllowClient");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

// Apply Migrations Automatically
using (var scope = app.Services.CreateScope())
{
    try
    {
        var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

        if (db.Database.CanConnect())
        {
            db.Database.Migrate();
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"Migration Error: {ex.Message}");
    }
}

app.Run();