namespace Auth.DTOs;

/// <summary>Respuesta de autenticación devuelta tras registro o inicio de sesión.</summary>
public class AuthResponse
{
    /// <summary>Identificador del usuario autenticado.</summary>
    public Guid UserId { get; set; }
    /// <summary>Correo electrónico del usuario.</summary>
    public string Email { get; set; } = string.Empty;
    /// <summary>Nombre completo del usuario.</summary>
    public string FullName { get; set; } = string.Empty;
    /// <summary>Token JWT para autorización en solicitudes posteriores.</summary>
    public string Token { get; set; } = string.Empty;
    /// <summary>Fecha y hora de expiración del token.</summary>
    public DateTime ExpiresAt { get; set; }
}
