using System.ComponentModel.DataAnnotations;

namespace Auth.DTOs;

/// <summary>Solicitud de inicio de sesión.</summary>
public class LoginRequest
{
    /// <summary>Correo electrónico del usuario.</summary>
    [Required]
    [EmailAddress]
    public required string Email { get; set; }

    /// <summary>Contraseña del usuario.</summary>
    [Required]
    public required string Password { get; set; }
}
