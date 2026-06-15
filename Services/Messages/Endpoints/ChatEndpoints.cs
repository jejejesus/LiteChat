using Messages.DTOs;
using Messages.Services;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using System.Security.Claims;

namespace Messages.Endpoints
{
    public static class ChatEndpoints
    {
        public static void MapChatEndpoints(this IEndpointRouteBuilder app)
        {
            var group = app.MapGroup("/api/chat")
                .WithTags("Chat")
                .RequireAuthorization();

            // GET /api/chat/conversations
            group.MapGet("/conversations", GetUserConversationsAsync)
                .WithName("GetUserConversations")
                .Produces<List<ConversationDTO>>(StatusCodes.Status200OK);

            // GET /api/chat/conversations/{conversationId}/messages
            group.MapGet("/conversations/{conversationId}/messages", GetConversationMessagesAsync)
                .WithName("GetConversationMessages")
                .Produces<List<MessageDTO>>(StatusCodes.Status200OK);

            // POST /api/chat/messages
            group.MapPost("/messages", SendMessageAsync)
                .WithName("SendMessage")
                .Produces<MessageDTO>(StatusCodes.Status201Created)
                .ProducesValidationProblem(StatusCodes.Status400BadRequest);

            // POST /api/chat/conversations/{conversationId}/read
            group.MapPost("/conversations/{conversationId}/read", MarkMessagesAsReadAsync)
                .WithName("MarkMessagesAsRead")
                .Produces(StatusCodes.Status204NoContent);

            // Friend Requests endpoints
            var friendGroup = app.MapGroup("/api/friends")
                .WithTags("Friends")
                .RequireAuthorization();

            // POST /api/friends/requests
            friendGroup.MapPost("/requests", SendFriendRequestAsync)
                .WithName("SendFriendRequest")
                .Produces<FriendRequestDTO>(StatusCodes.Status201Created);

            // GET /api/friends/requests/pending
            friendGroup.MapGet("/requests/pending", GetPendingFriendRequestsAsync)
                .WithName("GetPendingFriendRequests")
                .Produces<List<FriendRequestDTO>>(StatusCodes.Status200OK);

            // PUT /api/friends/requests/{requestId}/respond
            friendGroup.MapPut("/requests/{requestId}/respond", RespondToFriendRequestAsync)
                .WithName("RespondToFriendRequest")
                .Produces<FriendRequestDTO>(StatusCodes.Status200OK);

            // GET /api/friends/list
            friendGroup.MapGet("/list", GetFriendsListAsync)
                .WithName("GetFriendsList")
                .Produces<List<UserDTO>>(StatusCodes.Status200OK);

            // POST /api/friends/search
            friendGroup.MapPost("/search", SearchUsersAsync)
                .WithName("SearchUsers")
                .Produces<List<UserDTO>>(StatusCodes.Status200OK);

        }

        private static async Task<IResult> GetUserConversationsAsync(
            ClaimsPrincipal user,
            IChatService chatService)
        {
            var userId = GetUserId(user);
            var conversations = await chatService.GetUserConversationsAsync(userId);
            return Results.Ok(conversations);
        }

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

        private static async Task<IResult> MarkMessagesAsReadAsync(
            Guid conversationId,
            ClaimsPrincipal user,
            IChatService chatService)
        {
            var userId = GetUserId(user);
            await chatService.MarkMessagesAsReadAsync(conversationId, userId);
            return Results.NoContent();
        }

        private static Guid GetUserId(ClaimsPrincipal user)
        {
            var userIdClaim = user.FindFirst(ClaimTypes.NameIdentifier)?.Value
                ?? user.FindFirst("sub")?.Value;

            if (string.IsNullOrEmpty(userIdClaim))
                throw new UnauthorizedAccessException("Usuario no identificado");

            return Guid.Parse(userIdClaim);
        }

        private static async Task<IResult> SendFriendRequestAsync(SendFriendRequestRequest request, ClaimsPrincipal user, IChatService chatService)
        {
            var userId = GetUserId(user);
            var result = await chatService.SendFriendRequestAsync(userId, request);
            return Results.Created($"/api/friends/requests/{result.Id}", result);
        }

        private static async Task<IResult> GetPendingFriendRequestsAsync(
            ClaimsPrincipal user,
            IChatService chatService)
        {
            var userId = GetUserId(user);
            var requests = await chatService.GetPendingFriendRequestsAsync(userId);
            return Results.Ok(requests);
        }

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

        private static async Task<IResult> GetFriendsListAsync(
            ClaimsPrincipal user,
            IChatService chatService)
        {
            var userId = GetUserId(user);
            var friends = await chatService.GetUserFriendsAsync(userId);
            return Results.Ok(friends);
        }

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
