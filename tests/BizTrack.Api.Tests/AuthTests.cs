using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using BizTrack.Api.Models;
using BizTrack.Api.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace BizTrack.Api.Tests;

public class AuthTests
{
    [Fact]
    public void GenerateJwtToken_ProducesValidToken_WithRoleAndIdentityClaims()
    {
        var configValues = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "Super_Secret_Testing_Key_For_Unit_Tests_2026_SE3090_Key!",
            ["Jwt:Issuer"] = "BizTrack.Api",
            ["Jwt:Audience"] = "BizTrack.Clients"
        };
        var configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(configValues)
            .Build();

        var tokenService = new TokenService(configuration);

        var user = new User
        {
            Id = 42,
            Username = "test_manager",
            Email = "manager@biztrack.lk",
            FullName = "Jane Doe",
            Role = UserRoles.InventoryManager
        };

        var (token, expiresAt) = tokenService.GenerateJwtToken(user);

        Assert.False(string.IsNullOrWhiteSpace(token));
        Assert.True(expiresAt > DateTime.UtcNow);

        // Decode token and verify claims
        var handler = new JwtSecurityTokenHandler();
        var jwt = handler.ReadJwtToken(token);

        Assert.Equal("BizTrack.Api", jwt.Issuer);
        Assert.Contains(jwt.Audiences, a => a == "BizTrack.Clients");

        var roleClaim = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Role || c.Type == "role");
        Assert.NotNull(roleClaim);
        Assert.Equal(UserRoles.InventoryManager, roleClaim.Value);

        var nameClaim = jwt.Claims.FirstOrDefault(c => c.Type == ClaimTypes.Name || c.Type == "unique_name");
        Assert.NotNull(nameClaim);
        Assert.Equal("test_manager", nameClaim.Value);
    }
}
