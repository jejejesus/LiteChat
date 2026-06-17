using Messages.DTOs;
using Messages.Services;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using System.Security.Claims;

namespace Messages.Endpoints
{
    /// <summary>Define los endpoints de mensajería y gestión de amigos.</summary>
    public static class ChatEndpoints
    {
        /// <summary>Mapea los endpoints de chat (<c>/api/chat</c>) y amigos (<c>/api/friends</c>).</summary>
        public static void MapChatEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/chat")
                .WithTags("Chat")
                .RequireAuthorization();

            group.MapGet("/conversations", GetUserConversationsAsync)
                .WithName("GetUserConversations")
                .Produces<List<ConversationDTO>>(StatusCodes.Status200OK);

            group.MapGet("/conversations/{conversationId}/messages", GetConversationMessagesAsync)
                .WithName("GetConversationMessages")
                .Produces<List<MessageDTO>>(StatusCodes.Status200OK);

            group.MapPost("/messages", SendMessageAsync)
                .WithName("SendMessage")
                .Produces<MessageDTO>(StatusCodes.Status201Created)
                .ProducesValidationProblem(StatusCodes.Status400BadRequest);

            group.MapPost("/conversations/{conversationId}/read", MarkMessagesAsReadAsync)
                .WithName("MarkMessagesAsRead")
                .Produces(StatusCodes.Status204NoContent);

            // ── Amigos ────────────────────────────────────────────────
            var friendGroup = app.MapGroup("/api/friends")
                .WithTags("Friends")
                .RequireAuthorization();

            friendGroup.MapPost("/requests", SendFriendRequestAsync)
                .WithName("SendFriendRequest")
                .Produces<FriendRequestDTO>(StatusCodes.Status201Created);

            friendGroup.MapGet("/requests/pending", GetPendingFriendRequestsAsync)
                .WithName("GetPendingFriendRequests")
                .Produces<List<FriendRequestDTO>>(StatusCodes.Status200OK);

            friendGroup.MapPut("/requests/{requestId}/respond", RespondToFriendRequestAsync)
                .WithName("RespondToFriendRequest")
                .Produces<FriendRequestDTO>(StatusCodes.Status200OK);

            friendGroup.MapGet("/list", GetFriendsListAsync)
                .WithName("GetFriendsList")
                .Produces<List<UserDTO>>(StatusCodes.Status200OK);

            friendGroup.MapPost("/search", SearchUsersAsync)
                .WithName("SearchUsers")
                .Produces<List<UserDTO>>(StatusCodes.Status200OK);

        }

        /// <summary>Obtiene las conversaciones activas del usuario autenticado.</summary>
        private static async Task<IResult> GetUserConversationsAsync(
            ClaimsPrincipal user,
            IChatService chatService)
        {
            var userId = GetUserId(user);
            var conversations = await chatService.GetUserConversationsAsync(userId);
            return Results.Ok(conversations);
        }

        /// <summary>Obtiene los mensajes de una conversación con paginación.</summary>
        private static async Task<IResult> GetConversationMessagesAsync(
            Guid conversationId,
            int page,
            int pageSize,
            ClaimsPrincipal user,
            IChatService chatService)
        {
            var userId = GetUserId(user);
            var messages = await chatService.GetConversationMessagesAsync(conversationId, userId, page, pageSize);
            return Results.Ok(messages);
        }

        /// <summary>Envía un mensaje a una conversación.</summary>
        private static async Task<IResult> SendMessageAsync(
            SendMessageRequest request,
            ClaimsPrincipal user,
            IChatService chatService)
        {
            try
            {
                var userId = GetUserId(user);
                var message = await chatService.SendMessageAsync(userId, request);
                return Results.Created($"/api/chat/messages/{message.Id}", message);
            }
            catch (ArgumentException ex)
            {
                return Results.BadRequest(new { error = ex.Message });
            }
            catch (UnauthorizedAccessException ex)
            {
                return Results.Forbid();
            }
        }

        /// <summary>Marca los mensajes de una conversación como leídos.</summary>
        private static async Task<IResult> MarkMessagesAsReadAsync(
            Guid conversationId,
            ClaimsPrincipal user,
            IChatService chatService)
        {
            var userId = GetUserId(user);
            await chatService.MarkMessagesAsReadAsync(conversationId, userId);
            return Results.NoContent();
        }

        /// <summary>Extrae el userId del JWT del usuario autenticado.</summary>
        private static Guid GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("Usuario no identificado");

            return Guid.Parse(userIdClaim);
        }

        /// <summary>Envía una solicitud de amistad a otro usuario.</summary>
        private static async Task<IResult> SendFriendRequestAsync(SendFriendRequestRequest request, ClaimsPrincipal user, IChatService chatService)
        {
            var userId = GetUserId(user);
            var result = await chatService.SendFriendRequestAsync(userId, request);
            return Results.Created($"/api/friends/requests/{result.Id}", result);
        }

        /// <summary>Obtiene las solicitudes de amistad pendientes del usuario.</summary>
        private static async Task<IResult> GetPendingFriendRequestsAsync(
            ClaimsPrincipal user,
            IChatService chatService)
        {
            var userId = GetUserId(user);
            var requests = await chatService.GetPendingFriendRequestsAsync(userId);
            return Results.Ok(requests);
        }

        /// <summary>Responde a una solicitud de amistad (aceptar/rechazar).</summary>
        private static async Task<IResult> RespondToFriendRequestAsync(
            Guid requestId,
            RespondFriendRequestRequest request,
            ClaimsPrincipal user,
            IChatService chatService)
        {
            if (requestId != request.RequestId)
                return Results.BadRequest("ID mismatch");

            var userId = GetUserId(user);
            var result = await chatService.RespondToFriendRequestAsync(userId, request);
            return Results.Ok(result);
        }

        /// <summary>Obtiene la lista de amigos del usuario autenticado.</summary>
        private static async Task<IResult> GetFriendsListAsync(
            ClaimsPrincipal user,
            IChatService chatService)
        {
            var userId = GetUserId(user);
            var friends = await chatService.GetUserFriendsAsync(userId);
            return Results.Ok(friends);
        }

        /// <summary>Busca usuarios por nombre o email (excluye al usuario autenticado).</summary>
        private static async Task<IResult> SearchUsersAsync(
            SearchUsersRequest request,
            AppDbContext dbContext,
            ClaimsPrincipal user)
        {
            var currentUserId = GetUserId(user);

            var users = await dbContext.Users
                .Where(u => u.Id != currentUserId &&
                    (u.Email.Contains(request.Query) ||
                     u.Name.Contains(request.Query) ||
                     u.FirstSurname.Contains(request.Query) ||
                     (u.Name + " " + u.FirstSurname).Contains(request.Query)))
                .Take(20)
                .Select(u => new UserDTO
                {
                    Id = u.Id,
                    Name = u.Name,
                    FirstSurname = u.FirstSurname,
                    SecondSurname = u.SecondSurname,
                    SurnameFirst = u.SurnameFirst,
                    AvatarUrl = u.AvatarUrl,
                    Status = u.Status,
                    FullName = u.SurnameFirst
                        ? $"{u.FirstSurname} {u.SecondSurname} {u.Name}"
                        : $"{u.Name} {u.FirstSurname} {u.SecondSurname}"
                })
                .ToListAsync();

            return Results.Ok(users);
        }
    }
}
