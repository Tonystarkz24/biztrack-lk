using System.Text.Json;

namespace BizTrack.Api.Services;

public class ExchangeRatesResponse
{
    public string Result { get; set; } = string.Empty;
    public string BaseCode { get; set; } = string.Empty;
    public Dictionary<string, decimal> Rates { get; set; } = new();
    public DateTime TimeLastUpdateUtc { get; set; }
}

public interface ICurrencyService
{
    Task<decimal> GetExchangeRateAsync(string fromCurrency, string toCurrency);
    Task<decimal> ConvertAsync(decimal amount, string fromCurrency, string toCurrency);
    Task<Dictionary<string, decimal>> GetKeyRatesAsync();
}

public class CurrencyService : ICurrencyService
{
    private readonly HttpClient _httpClient;
    private readonly ILogger<CurrencyService> _logger;
    private static Dictionary<string, decimal> _cachedRates = new();
    private static DateTime _lastFetched = DateTime.MinValue;
    private static readonly TimeSpan CacheDuration = TimeSpan.FromHours(1);

    public CurrencyService(HttpClient httpClient, ILogger<CurrencyService> logger)
    {
        _httpClient = httpClient;
        _logger = logger;
        _httpClient.Timeout = TimeSpan.FromSeconds(5);
    }

    private async Task EnsureRatesLoadedAsync()
    {
        if (_cachedRates.Count > 0 && (DateTime.UtcNow - _lastFetched) < CacheDuration)
        {
            return;
        }

        try
        {
            // Free, reliable public exchange rates endpoint
            var response = await _httpClient.GetAsync("https://open.er-api.com/v6/latest/USD");
            if (response.IsSuccessStatusCode)
            {
                var content = await response.Content.ReadAsStringAsync();
                var parsed = JsonSerializer.Deserialize<ExchangeRatesResponse>(content, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });

                if (parsed != null && parsed.Rates != null)
                {
                    _cachedRates = parsed.Rates;
                    _lastFetched = DateTime.UtcNow;
                    _logger.LogInformation("Successfully fetched live exchange rates from third-party provider.");
                    return;
                }
            }
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to reach third-party currency API. Using robust fallback rates.");
        }

        // Resilient fallback rates if external API is unreachable or times out
        if (_cachedRates.Count == 0)
        {
            _cachedRates = new Dictionary<string, decimal>
            {
                ["USD"] = 1.0m,
                ["LKR"] = 305.50m,
                ["EUR"] = 0.92m,
                ["GBP"] = 0.78m,
                ["INR"] = 83.20m,
                ["SGD"] = 1.34m
            };
            _lastFetched = DateTime.UtcNow;
        }
    }

    public async Task<decimal> GetExchangeRateAsync(string fromCurrency, string toCurrency)
    {
        await EnsureRatesLoadedAsync();
        var from = fromCurrency.ToUpperInvariant();
        var to = toCurrency.ToUpperInvariant();

        if (from == to) return 1.0m;

        if (_cachedRates.TryGetValue(from, out var rateFrom) && _cachedRates.TryGetValue(to, out var rateTo))
        {
            // Convert via USD base
            return Math.Round(rateTo / rateFrom, 4);
        }

        throw new ArgumentException($"Unsupported currency pair: {from}/{to}");
    }

    public async Task<decimal> ConvertAsync(decimal amount, string fromCurrency, string toCurrency)
    {
        var rate = await GetExchangeRateAsync(fromCurrency, toCurrency);
        return Math.Round(amount * rate, 2);
    }

    public async Task<Dictionary<string, decimal>> GetKeyRatesAsync()
    {
        await EnsureRatesLoadedAsync();
        var keys = new[] { "LKR", "USD", "EUR", "GBP", "INR", "SGD" };
        return _cachedRates.Where(k => keys.Contains(k.Key)).ToDictionary(k => k.Key, k => k.Value);
    }
}
