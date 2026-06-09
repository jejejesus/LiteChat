using Auth.DTOs;
using Auth.Services;

namespace Auth.Endpoints
{
    public static class AuthEndpoints
    {
        public static void MapAuthEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/auth")
                .WithTags("Authentication");

            // POST /api/auth/register
            group.MapPost("/register", RegisterAsync)
                .WithName("RegisterUser")
                .WithDescription("Registra un nuevo usuario")
                .Produces<AuthResponse>(StatusCodes.Status201Created)
                .ProducesValidationProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status409Conflict)
                .AllowAnonymous();

            // POST /api/auth/login
            group.MapPost("/login", LoginAsync)
                .WithName("LoginUser")
                .WithDescription("Autentica un usuario existente")
                .Produces<AuthResponse>(StatusCodes.Status200OK)
                .ProducesValidationProblem(StatusCodes.Status400BadRequest)
                .ProducesProblem(StatusCodes.Status401Unauthorized)
                .AllowAnonymous();

            // POST /api/auth/logout
            group.MapPost("/logout", LogoutAsync)
                .WithName("LogoutUser")
                .WithDescription("Cierra la sesión del usuario")
                .RequireAuthorization();

            // GET /api/auth/verify
            group.MapGet("/verify", VerifyAsync)
                .WithName("VerifyToken")
                .WithDescription("Verifica si el token es válido")
                .RequireAuthorization();
        }

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
                return Results.Problem("Error interno del servidor", statusCode: 500);
            }
        }

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
                return Results.Unauthorized();
            }
            catch (Exception)
            {
                return Results.Problem("Error interno del servidor", statusCode: 500);
            }
        }

        private static async Task<IResult> LogoutAsync(HttpContext httpContext)
        {
            // Aquí podrías invalidar el token si estás usando una blacklist
            await Task.CompletedTask;
            return Results.Ok(new { message = "Sesión cerrada exitosamente" });
        }

        private static async Task<IResult> VerifyAsync(HttpContext httpContext)
        {
            // Verificar que el usuario está autenticado
            var user = httpContext.User;
            if (user.Identity?.IsAuthenticated == true)
            {
                return Results.Ok(new { valid = true, message = "Token válido" });
            }

            return Results.Unauthorized();
        }
    }
}
