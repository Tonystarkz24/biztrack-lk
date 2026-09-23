namespace BizTrack.Api.Services;

public interface IGeminiService
{
    Task<string> GenerateTextAsync(string prompt, string? systemInstruction = null);
    Task<T?> GenerateStructuredAsync<T>(string prompt, string? systemInstruction = null);
}
