using Auth.DTOs;

namespace Auth.Services;

/// <summary>Define el contrato para el servicio de autenticación de usuarios.</summary>
public interface IAuthService
{
    /// <summary>Registra un nuevo usuario en el sistema.</summary>
    /// <param name="request">Datos del registro (email, nombre, contraseña, etc.).</param>
    /// <returns>Respuesta con los datos del usuario creado y un JWT.</returns>
    /// <exception cref="InvalidOperationException">Si el email o teléfono ya están registrados.</exception>
    Task<AuthResponse> RegisterAsync(RegisterRequest request);

    /// <summary>Autentica a un usuario existente.</summary>
    /// <param name="request">Credenciales de inicio de sesión (email y contraseña).</param>
    /// <returns>Respuesta con los datos del usuario y un JWT.</returns>
    /// <exception cref="UnauthorizedAccessException">Si las credenciales son inválidas.</exception>
    Task<AuthResponse> LoginAsync(LoginRequest request);

    /// <summary>Verifica si un email ya está registrado.</summary>
    Task<bool> EmailExistsAsync(string email);

    /// <summary>Verifica si un número de teléfono ya está registrado.</summary>
    Task<bool> PhoneExistsAsync(string phoneNumber);
}
