using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace StudyAI.Api.Endpoints;

public static class AnalyzeEndpoint
{
    private static readonly HttpClient Http = new();

    public static void MapAnalyzeEndpoint(this WebApplication app)
    {
        app.MapPost("/api/analyze", async (
            [FromForm] IFormFile file,
            IConfiguration config) =>
        {
            var apiKey = config["Claude:ApiKey"]
                ?? throw new InvalidOperationException("Claude API key not configured");

            var (contentType, content) = await ExtractContent(file);
            var rawJson = await CallClaudeAsync(apiKey, contentType, content);

            return Results.Text(rawJson, "application/json");
        })
        .DisableAntiforgery();
    }

    private static async Task<string> CallClaudeAsync(
        string apiKey, string contentType, string content)
    {
        const string systemPrompt = """
            You are a pedagogical assistant specialized in analyzing study material.
            Analyze the content and return ONLY a valid JSON with this exact structure:
            - 1 root node (level 1) — main concept
            - 2 nodes level 2 — main phases or categories
            - 4 nodes level 3 — details and products
            - 3 questions per level 1 and level 2 node (different angles)
            - peek_answers: clear answers in 2-3 sentences
            - boss: creative name, hp_max = number of nodes x 10,
              final synthetic question, required_concepts = list of all key concepts
            Label max 4 words. Sublabel max 4 words.
            Return ONLY the JSON, no explanation, no markdown fences.
            """;

        // Build content array depending on file type
        object[] messageContent = contentType == "text"
            ? [new { type = "text", text = systemPrompt + "\n\nCONTENT:\n" + content }]
            : [
                new { type = "text", text = systemPrompt + "\n\nAnalyze the study material in this image:" },
                new
                {
                    type = "image",
                    source = new
                    {
                        type = "base64",
                        media_type = "image/jpeg",
                        data = content
                    }
                }
              ];

        var requestBody = new
        {
            model = "claude-sonnet-4-6",
            max_tokens = 4096,
            messages = new[]
            {
                new { role = "user", content = messageContent }
            }
        };

        var json = JsonSerializer.Serialize(requestBody);
        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
        request.Headers.Add("x-api-key", apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        var response = await Http.SendAsync(request);
        var responseBody = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Claude API error: {responseBody}");

        // Extract text from Claude response envelope
        using var doc = JsonDocument.Parse(responseBody);
        var text = doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString() ?? throw new Exception("Empty Claude response");

        return text;
    }

    private static async Task<(string type, string content)> ExtractContent(IFormFile file)
    {
        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();

        if (extension == ".pdf")
        {
            using var stream = file.OpenReadStream();
            using var pdf = UglyToad.PdfPig.PdfDocument.Open(stream);
            var text = string.Join("\n", pdf.GetPages().Select(p => p.Text));
            return ("text", text);
        }

        // Image — send as base64 vision
        using var ms = new MemoryStream();
        await file.CopyToAsync(ms);
        return ("image", Convert.ToBase64String(ms.ToArray()));
    }
}