using BizTrack.Api.Data;
using Microsoft.AspNetCore.Mvc;

namespace BizTrack.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    private readonly AppDbContext _context;

    public HealthController(AppDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetHealth()
    {
        bool dbConnected = false;
        try
        {
            dbConnected = await _context.Database.CanConnectAsync();
        }
        catch
        {
            dbConnected = false;
        }

        return Ok(new
        {
            success = true,
            status = "online",
            framework = "ASP.NET Core 8.0 Web API",
            database = dbConnected ? "connected" : "unavailable",
            timestamp = DateTime.UtcNow
        });
    }
}
