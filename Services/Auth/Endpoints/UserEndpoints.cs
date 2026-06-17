using Microsoft.EntityFrameworkCore;
using Shared.Data;

namespace Auth.Endpoints;

/// <summary>Define los endpoints protegidos de gestión de usuarios.</summary>
public static class UserEndpoints
{
    /// <summary>Mapea los endpoints del grupo <c>/api/users</c> (requieren autenticación).</summary>
    public static void MapUserEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/users")
            .WithTags("Users")
            .RequireAuthorization();

        group.MapGet("/me", GetCurrentUserAsync);
        group.MapGet("/{id:guid}", GetUserByIdAsync);
        group.MapPut("/me", UpdateCurrentUserAsync);
    }

    /// <summary>Obtiene los datos del usuario autenticado.</summary>
    private static async Task<IResult> GetCurrentUserAsync(
        HttpContext httpContext,
        AppDbContext dbContext)
    {
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

    /// <summary>Obtiene un usuario por su identificador.</summary>
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

    /// <summary>Actualiza los datos del usuario autenticado (pendiente de implementar).</summary>
    private static async Task<IResult> UpdateCurrentUserAsync(
        HttpContext httpContext,
        AppDbContext dbContext)
    {
        await Task.CompletedTask;
        return Results.Ok(new { message = "Usuario actualizado" });
    }
}
