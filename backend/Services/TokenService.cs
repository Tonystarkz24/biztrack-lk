using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BizTrack.Api.Models;
using Microsoft.IdentityModel.Tokens;

namespace BizTrack.Api.Services;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) GenerateJwtToken(User user);
}

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime ExpiresAt) GenerateJwtToken(User user)
    {
        var jwtKey = _configuration["Jwt:Key"] ?? "BizTrack_LK_Super_Secret_Key_2026_SE3090_Default!";
        var jwtIssuer = _configuration["Jwt:Issuer"] ?? "BizTrack.Api";
        var jwtAudience = _configuration["Jwt:Audience"] ?? "BizTrack.Clients";
        var expiresAt = DateTime.UtcNow.AddDays(7);

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new(ClaimTypes.Name, user.Username),
            new(ClaimTypes.Email, user.Email),
            new(ClaimTypes.Role, user.Role),
            new("fullName", user.FullName)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiresAt,
            Issuer = jwtIssuer,
            Audience = jwtAudience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return (tokenHandler.WriteToken(token), expiresAt);
    }
}
