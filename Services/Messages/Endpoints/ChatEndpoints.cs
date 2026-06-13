using Messages.DTOs;
using Messages.Services;
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
    }
}
