// Entry point for StudyAI backend
// Minimal API — keeps everything simple for MVP

using StudyAI.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5063")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

// Required to handle multipart/form-data file uploads
builder.Services.AddAntiforgery();

var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapGet("/", () => "StudyAI API is running");

// Register all endpoints
app.MapAnalyzeEndpoint();

app.Run();