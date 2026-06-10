using Auth.DTOs;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Shared.Data;
using Shared.Entities.Auth;
using Shared.Enums.Auth;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;

namespace Auth.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthService(AppDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
        {
            // Verificar si el email ya existe
            if (await EmailExistsAsync(request.Email))
                throw new InvalidOperationException("El email ya está registrado");

            // Verificar si el teléfono ya existe
            if (await PhoneExistsAsync(request.PhoneNumber))
                throw new InvalidOperationException("El número de teléfono ya está registrado");

            // Crear el usuario
            var user = new User
            {
                Email = request.Email,
                Name = request.Name,
                FirstSurname = request.FirstSurname,
                SecondSurname = request.SecondSurname,
                SurnameFirst = request.SurnameFirst,
                BirthDate = request.BirthDate,
                PhoneNumber = request.PhoneNumber,
                Status = UserStatus.active,
                HashedPassword = HashPassword(request.Password)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Generar token (JWT)
            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = GetFullName(user),
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
        }

        public async Task<AuthResponse> LoginAsync(LoginRequest request)
        {
            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email == request.Email);

            if (user == null || !VerifyPassword(request.Password, user.HashedPassword))
                throw new UnauthorizedAccessException("Credenciales inválidas");

            if (user.Status != UserStatus.active)
                throw new UnauthorizedAccessException("Usuario no activo");

            var token = GenerateJwtToken(user);

            return new AuthResponse
            {
                UserId = user.Id,
                Email = user.Email,
                FullName = GetFullName(user),
                Token = token,
                ExpiresAt = DateTime.UtcNow.AddHours(24)
            };
        }

        public async Task<bool> EmailExistsAsync(string email)
        {
            return await _context.Users.AnyAsync(u => u.Email == email);
        }

        public async Task<bool> PhoneExistsAsync(string phoneNumber)
        {
            return await _context.Users.AnyAsync(u => u.PhoneNumber == phoneNumber);
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string hashedPassword)
        {
            return HashPassword(password) == hashedPassword;
        }

        private string GenerateJwtToken(User user)
        {
            // Obtener configuración JWT
            var jwtKey = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("JWT Key not configured");
            var jwtIssuer = _configuration["Jwt:Issuer"] ?? throw new InvalidOperationException("JWT Issuer not configured");
            var jwtAudience = _configuration["Jwt:Audience"] ?? throw new InvalidOperationException("JWT Audience not configured");
            var jwtExpiryHours = _configuration.GetValue<int>("Jwt:ExpiryHours", 24);

            // Crear claims (información del usuario)
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, user.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, user.Email),
                new Claim(JwtRegisteredClaimNames.Name, user.Name),
                new Claim(JwtRegisteredClaimNames.FamilyName, user.FirstSurname),
                new Claim("phone_number", user.PhoneNumber ?? ""),
                new Claim("status", user.Status.ToString()),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, DateTimeOffset.UtcNow.ToUnixTimeSeconds().ToString(), ClaimValueTypes.Integer64)
            };

            // Agregar apellido segundo si existe
            if (!string.IsNullOrEmpty(user.SecondSurname))
            {
                claims.Add(new Claim("second_surname", user.SecondSurname));
            }

            // Agregar el nombre completo como claim
            claims.Add(new Claim("full_name", GetFullName(user)));

            // Crear credenciales de firma
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtKey));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            // Crear el token
            var token = new JwtSecurityToken(
                issuer: jwtIssuer,
                audience: jwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(jwtExpiryHours),
                signingCredentials: credentials
            );

            // Serializar el token
            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private string GetFullName(User user)
        {
            var names = user.SurnameFirst
                ? $"{user.FirstSurname} {user.SecondSurname} {user.Name}"
                : $"{user.Name} {user.FirstSurname} {user.SecondSurname}";

            return names.Trim();
        }
    }
}