using Auth.DTOs;
using Auth.Services;

namespace Auth.Endpoints;

/// <summary>Define los endpoints públicos de autenticación (registro, login, logout, verificación).</summary>
public static class AuthEndpoints
{
    /// <summary>Mapea los endpoints del grupo <c>/api/auth</c>.</summary>
    public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/auth")
            .WithTags("Authentication");

        group.MapPost("/register", RegisterAsync)
            .WithName("RegisterUser")
            .WithDescription("Registra un nuevo usuario")
            .Produces<AuthResponse>(StatusCodes.Status201Created)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status409Conflict)
            .AllowAnonymous();

        group.MapPost("/login", LoginAsync)
            .WithName("LoginUser")
            .WithDescription("Autentica un usuario existente")
            .Produces<AuthResponse>(StatusCodes.Status200OK)
            .ProducesValidationProblem(StatusCodes.Status400BadRequest)
            .ProducesProblem(StatusCodes.Status401Unauthorized)
            .AllowAnonymous();

        group.MapPost("/logout", LogoutAsync)
            .WithName("LogoutUser")
            .WithDescription("Cierra la sesión del usuario")
            .RequireAuthorization();

        group.MapGet("/verify", VerifyAsync)
            .WithName("VerifyToken")
            .WithDescription("Verifica si el token es válido")
            .RequireAuthorization();
    }

    /// <summary>Registra un nuevo usuario y devuelve un JWT.</summary>
    private static async Task<IResult> RegisterAsync(
        RegisterRequest request,
        IAuthService authService)
    {
        try
        {
            var result = await authService.RegisterAsync(request);
            return Results.Created($"/api/auth/users/{result.UserId}", result);
        }
        catch (InvalidOperationException ex)
        {
            return Results.Conflict(new { error = ex.Message });
        }
        catch (Exception)
        {
            return Results.Json(new { error = "Error interno del servidor" }, statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>Inicia sesión con email y contraseña, devuelve un JWT.</summary>
    private static async Task<IResult> LoginAsync(
        LoginRequest request,
        IAuthService authService)
    {
        try
        {
            var result = await authService.LoginAsync(request);
            return Results.Ok(result);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Results.Json(new { error = ex.Message }, statusCode: StatusCodes.Status401Unauthorized);
        }
        catch (Exception)
        {
            return Results.Json(new { error = "Error interno del servidor" }, statusCode: StatusCodes.Status500InternalServerError);
        }
    }

    /// <summary>Cierra la sesión del usuario (requiere invalidación del token en producción).</summary>
    private static async Task<IResult> LogoutAsync(HttpContext httpContext)
    {
        await Task.CompletedTask;
        return Results.Ok(new { message = "Sesión cerrada exitosamente" });
    }

    /// <summary>Verifica que el token JWT del usuario sea válido.</summary>
    private static async Task<IResult> VerifyAsync(HttpContext httpContext)
    {
        var user = httpContext.User;
        if (user.Identity?.IsAuthenticated == true)
        {
            return Results.Ok(new { valid = true, message = "Token válido" });
        }

        return Results.Unauthorized();
    }
}
