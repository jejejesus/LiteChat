using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using Realtime.Models;
using Shared.Data;
using Shared.Entities.Chat;
using Shared.Enums.Chat;
using System.Security.Claims;

namespace Realtime.Hubs;

/// <summary>Hub principal de SignalR para mensajería en tiempo real.</summary>
public class ChatHub : Hub
{
    private readonly AppDbContext _db;
    private readonly ILogger<ChatHub> _logger;

    public ChatHub(AppDbContext db, ILogger<ChatHub> logger)
    {
        _db = db;
        _logger = logger;
    }

    private Guid GetUserId() =>
        Guid.Parse(Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? Context.User?.FindFirst("sub")?.Value
            ?? throw new HubException("Usuario no autenticado"));

    /// <summary>Al conectarse, agrega al usuario a su grupo personal.</summary>
    public override async Task OnConnectedAsync()
    {
        try
        {
            var userId = GetUserId();
            await Groups.AddToGroupAsync(Context.ConnectionId, $"user_{userId}");
            _logger.LogInformation("Usuario {UserId} conectado al hub", userId);
        }
        catch (HubException)
        {
            Context.Abort();
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        _logger.LogInformation("Usuario {ConnectionId} desconectado", Context.ConnectionId);
        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>El usuario se une a una conversación (grupo SignalR).</summary>
    public async Task JoinConversation(Guid conversationId)
    {
        var userId = GetUserId();
        var isMember = await _db.ConversationMembers
            .AnyAsync(cm => cm.ConversationId == conversationId && cm.UserId == userId && cm.LeftAt == null);

        if (!isMember)
            throw new HubException("No eres miembro de esta conversación");

        await Groups.AddToGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
    }

    /// <summary>El usuario abandona una conversación.</summary>
    public async Task LeaveConversation(Guid conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"conversation_{conversationId}");
    }

    /// <summary>Envía un mensaje a una conversación y lo retransmite a los miembros.</summary>
    public async Task SendMessage(SendMessageRequest request)
    {
        var senderUserId = GetUserId();

        var member = await _db.ConversationMembers
            .AsNoTracking()
            .FirstOrDefaultAsync(cm =>
                cm.ConversationId == request.ConversationId &&
                cm.UserId == senderUserId &&
                cm.LeftAt == null);

        if (member == null)
            throw new HubException("No eres miembro de esta conversación");

        var user = await _db.Users.AsNoTracking()
            .FirstAsync(u => u.Id == senderUserId);

        var messageType = request.Type != null
            ? Enum.Parse<MessageType>(request.Type, ignoreCase: true)
            : MessageType.text;

        var message = new Message
        {
            Id = Guid.NewGuid(),
            ConversationId = request.ConversationId,
            SenderUserId = senderUserId,
            ParentMessageId = request.ParentMessageId,
            Type = messageType,
            Body = request.Body,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _db.Messages.Add(message);

        var conversation = await _db.Conversations.FindAsync(request.ConversationId);
        if (conversation != null)
            conversation.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var payload = new MessagePayload(
            Id: message.Id,
            ConversationId: message.ConversationId,
            SenderUserId: message.SenderUserId,
            SenderName: $"{user.Name} {user.FirstSurname}".Trim(),
            SenderAvatarUrl: user.AvatarUrl,
            Body: message.Body ?? "",
            Type: message.Type.ToString(),
            CreatedAt: message.CreatedAt,
            ParentMessageId: message.ParentMessageId
        );

        await Clients.Group($"conversation_{request.ConversationId}").SendAsync("MessageReceived", payload);
    }

    /// <summary>Indica que el usuario está escribiendo (o dejó de escribir).</summary>
    public async Task Typing(TypingRequest request)
    {
        var userId = GetUserId();

        await Clients
            .Group($"conversation_{request.ConversationId}")
            .SendAsync("UserTyping", new
            {
                ConversationId = request.ConversationId,
                UserId = userId,
                IsTyping = request.IsTyping
            });
    }

    /// <summary>Marca los mensajes de una conversación como leídos y notifica al remitente.</summary>
    public async Task MarkAsRead(MarkAsReadRequest request)
    {
        var userId = GetUserId();

        var member = await _db.ConversationMembers
            .FirstOrDefaultAsync(cm =>
                cm.ConversationId == request.ConversationId &&
                cm.UserId == userId);

        if (member != null)
        {
            member.LastReadAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        await Clients
            .Group($"conversation_{request.ConversationId}")
            .SendAsync("MessagesRead", new
            {
                ConversationId = request.ConversationId,
                UserId = userId
            });
    }
}
