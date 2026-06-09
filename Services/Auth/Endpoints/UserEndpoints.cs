using Microsoft.EntityFrameworkCore;
using Shared.Data;
using Shared.Entities.Auth;

namespace Auth.Endpoints
{
    public static class UserEndpoints
    {
        public static void MapUserEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/users")
                .WithTags("Users")
                .RequireAuthorization(); // Todas requieren autenticación

            // GET /api/users/me
            group.MapGet("/me", GetCurrentUserAsync);

            // GET /api/users/{id}
            group.MapGet("/{id:guid}", GetUserByIdAsync);

            // PUT /api/users/me
            group.MapPut("/me", UpdateCurrentUserAsync);
        }

        private static async Task<IResult> GetCurrentUserAsync(
            HttpContext httpContext,
            AppDbContext dbContext)
        {
            // Obtener userId del token (implementar después)
            var userId = Guid.NewGuid(); // Temporal

            var user = await dbContext.Users
                .Where(u => u.Id == userId)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Name,
                    u.FirstSurname,
                    u.SecondSurname,
                    u.SurnameFirst,
                    u.BirthDate,
                    u.PhoneNumber,
                    u.AvatarUrl,
                    u.Status,
                    u.CreatedAt
                })
                .FirstOrDefaultAsync();

            return user is null
                ? Results.NotFound()
                : Results.Ok(user);
        }

        private static async Task<IResult> GetUserByIdAsync(
            Guid id,
            AppDbContext dbContext)
        {
            var user = await dbContext.Users
                .Where(u => u.Id == id)
                .Select(u => new
                {
                    u.Id,
                    u.Email,
                    u.Name,
                    u.FirstSurname,
                    u.SecondSurname,
                    u.SurnameFirst,
                    u.AvatarUrl,
                    u.Status
                })
                .FirstOrDefaultAsync();

            return user is null
                ? Results.NotFound()
                : Results.Ok(user);
        }

        private static async Task<IResult> UpdateCurrentUserAsync(
            HttpContext httpContext,
            AppDbContext dbContext)
        {
            // Implementar actualización
            await Task.CompletedTask;
            return Results.Ok(new { message = "Usuario actualizado" });
        }
    }
}
