using BizTrack.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace BizTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CurrencyController : ControllerBase
{
    private readonly ICurrencyService _currencyService;

    public CurrencyController(ICurrencyService currencyService)
    {
        _currencyService = currencyService;
    }

    [HttpGet("rates")]
    public async Task<IActionResult> GetRates()
    {
        var rates = await _currencyService.GetKeyRatesAsync();
        return Ok(new
        {
            provider = "ExchangeRate API (Third-Party Integration)",
            baseCurrency = "USD",
            rates
        });
    }

    [HttpGet("convert")]
    public async Task<IActionResult> Convert(
        [FromQuery] decimal amount,
        [FromQuery] string from = "USD",
        [FromQuery] string to = "LKR")
    {
        if (amount <= 0)
        {
            return BadRequest(new { message = "Amount must be greater than 0." });
        }

        try
        {
            var converted = await _currencyService.ConvertAsync(amount, from, to);
            var rate = await _currencyService.GetExchangeRateAsync(from, to);

            return Ok(new
            {
                originalAmount = amount,
                fromCurrency = from.ToUpperInvariant(),
                targetCurrency = to.ToUpperInvariant(),
                exchangeRate = rate,
                convertedAmount = converted
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }
}
