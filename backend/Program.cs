using StudyAI.Api.Endpoints;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173", "http://localhost:5063")
              .AllowAnyHeader()
              .AllowAnyMethod());
});

builder.Services.AddAntiforgery();

var app = builder.Build();

app.UseCors("AllowFrontend");

app.MapGet("/", () => "StudyAI API is running");

app.MapAnalyzeEndpoint();
app.MapEvaluateEndpoints(); // Add this line

app.Run();