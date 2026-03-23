using System.Text;
using System.Text.Json;
using Microsoft.AspNetCore.Mvc;

namespace StudyAI.Api.Endpoints;

public static class EvaluateEndpoint
{
    // Toggle to false when Claude API credits are available
    private const bool UseMock = true;

    public static void MapEvaluateEndpoints(this WebApplication app)
    {
        // Evaluates a single node answer
        app.MapPost("/api/evaluate", async (
            [FromBody] EvaluateNodeRequest request,
            IConfiguration config) =>
        {
            if (UseMock)
            {
                await Task.Delay(800);
                return Results.Ok(MockNodeEvaluation(request.StudentAnswer));
            }

            var result = await CallClaudeNodeEvaluation(request, config["Claude:ApiKey"]!);
            return Results.Ok(result);
        });

        // Evaluates the final boss battle answer
        app.MapPost("/api/evaluate-final", async (
            [FromBody] EvaluateFinalRequest request,
            IConfiguration config) =>
        {
            if (UseMock)
            {
                await Task.Delay(1200);
                return Results.Ok(MockFinalEvaluation(request.StudentAnswer, request.RequiredConcepts));
            }

            var result = await CallClaudeFinalEvaluation(request, config["Claude:ApiKey"]!);
            return Results.Ok(result);
        });
    }

    // --- Mock evaluations ---

    private static NodeEvaluationResult MockNodeEvaluation(string answer)
    {
        // Simple heuristic: longer answer = higher score
        // Real Claude evaluation replaces this entirely
        var score = Math.Min(100, answer.Trim().Length * 2);
        var correct = score >= 40;

        return new NodeEvaluationResult
        {
            Correct = correct,
            Score = score,
            Feedback = correct
                ? "Good understanding! The dragon feels a bit calmer."
                : "Not quite there yet — try to be more specific.",
            Missing = correct ? [] : ["more detail needed"]
        };
    }

    private static FinalEvaluationResult MockFinalEvaluation(
        string answer, List<string> requiredConcepts)
    {
        // Check which required concepts appear in the answer
        var answerLower = answer.ToLower();
        var covered = requiredConcepts
            .Where(c => answerLower.Contains(c.ToLower()))
            .ToList();
        var missing = requiredConcepts
            .Where(c => !answerLower.Contains(c.ToLower()))
            .ToList();

        var score = requiredConcepts.Count > 0
            ? (int)Math.Round((double)covered.Count / requiredConcepts.Count * 100)
            : 100;

        var defeated = missing.Count == 0;
        var damage = defeated ? 10 : missing.Count <= 2 ? 5 : 2;

        return new FinalEvaluationResult
        {
            Defeated = defeated,
            Score = score,
            Feedback = defeated
                ? "Outstanding! You covered everything. The dragon is finally at peace!"
                : $"Good effort! You covered {covered.Count}/{requiredConcepts.Count} concepts.",
            MissingConcepts = missing,
            Damage = damage
        };
    }

    // --- Real Claude API calls (active when UseMock = false) ---

    private static async Task<NodeEvaluationResult> CallClaudeNodeEvaluation(
        EvaluateNodeRequest request, string apiKey)
    {
        var jsonTemplate =
            """
            {
              "correct": true/false,
              "score": 0-100,
              "feedback": "encouraging phrase max 20 words",
              "missing": ["missing concept 1", "missing concept 2"]
            }
            """;

        var prompt =
            $"You are a professor evaluating student answers generously and semantically.\n" +
            $"Concept: {request.NodeLabel}\n" +
            $"Expected answer: {request.PeekAnswer}\n" +
            $"Student answer: {request.StudentAnswer}\n" +
            "Evaluate understanding of the concept, even with different words or partial answers.\n" +
            "Return ONLY this JSON:\n" +
            jsonTemplate +
            "\nConsider correct=true if score >= 40.\n" +
            "Be generous: if the student understood the essence, it counts as true.";

        var json = await CallClaude(apiKey, prompt);

        return JsonSerializer.Deserialize<NodeEvaluationResult>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
    }

    private static async Task<FinalEvaluationResult> CallClaudeFinalEvaluation(
        EvaluateFinalRequest request, string apiKey)
    {
        var jsonTemplate =
            """
            {
              "defeated": true/false,
              "score": 0-100,
              "feedback": "motivating comment in 2 sentences",
              "missing_concepts": ["missing concept 1"],
              "damage": 10
            }
            """;

        var prompt =
            $"You are a professor evaluating a student's final answer after studying a complete topic.\n" +
            $"Topic: {request.Topic}\n" +
            $"Required concepts: {string.Join(", ", request.RequiredConcepts)}\n" +
            $"Student answer: {request.StudentAnswer}\n" +
            "Verify that all required concepts are present and explained in the answer.\n" +
            "Return ONLY this JSON:\n" +
            jsonTemplate +
            "\nIf missing_concepts is empty → defeated=true.\n" +
            "If 1-2 concepts missing → defeated=false, damage=5.\n" +
            "If 3+ concepts missing → defeated=false, damage=2.";

        var json = await CallClaude(apiKey, prompt);

        return JsonSerializer.Deserialize<FinalEvaluationResult>(json,
            new JsonSerializerOptions { PropertyNameCaseInsensitive = true })!;
    }

    private static async Task<string> CallClaude(string apiKey, string prompt)
    {
        using var http = new HttpClient();

        var requestBody = new
        {
            model = "claude-sonnet-4-6",
            max_tokens = 512,
            messages = new[] { new { role = "user", content = prompt } }
        };

        var request = new HttpRequestMessage(HttpMethod.Post, "https://api.anthropic.com/v1/messages");
        request.Headers.Add("x-api-key", apiKey);
        request.Headers.Add("anthropic-version", "2023-06-01");
        request.Content = new StringContent(
            JsonSerializer.Serialize(requestBody),
            Encoding.UTF8,
            "application/json");

        var response = await http.SendAsync(request);
        var body = await response.Content.ReadAsStringAsync();

        if (!response.IsSuccessStatusCode)
            throw new Exception($"Claude API error: {body}");

        using var doc = JsonDocument.Parse(body);
        return doc.RootElement
            .GetProperty("content")[0]
            .GetProperty("text")
            .GetString()!;
    }
}

// --- Request / Response models ---

public record EvaluateNodeRequest(
    string NodeLabel,
    string PeekAnswer,
    string StudentAnswer
);

public record EvaluateFinalRequest(
    string Topic,
    List<string> RequiredConcepts,
    string StudentAnswer
);

public record NodeEvaluationResult
{
    public bool Correct { get; init; }
    public int Score { get; init; }
    public string Feedback { get; init; } = "";
    public List<string> Missing { get; init; } = [];
}

public record FinalEvaluationResult
{
    public bool Defeated { get; init; }
    public int Score { get; init; }
    public string Feedback { get; init; } = "";
    public List<string> MissingConcepts { get; init; } = [];
    public int Damage { get; init; }
}