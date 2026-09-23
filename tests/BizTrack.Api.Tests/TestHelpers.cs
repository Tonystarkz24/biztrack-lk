using BizTrack.Api.Services;

namespace BizTrack.Api.Tests;

public class FakeGeminiService : IGeminiService
{
    public Task<string> GenerateTextAsync(string prompt, string? systemInstruction = null) =>
        Task.FromResult("AI Evaluated sales velocity: High demand retail staple.");

    public Task<T?> GenerateStructuredAsync<T>(string prompt, string? systemInstruction = null) =>
        Task.FromResult<T?>(default);
}
