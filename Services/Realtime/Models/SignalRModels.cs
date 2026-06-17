namespace Realtime.Models;

/// <summary>DTO para enviar un mensaje desde el cliente al hub.</summary>
public record SendMessageRequest(
    Guid ConversationId,
    string Body,
    string? Type = null,
    Guid? ParentMessageId = null
);

/// <summary>DTO para indicar que un usuario está escribiendo.</summary>
public record TypingRequest(
    Guid ConversationId,
    bool IsTyping
);

/// <summary>DTO para marcar mensajes como leídos.</summary>
public record MarkAsReadRequest(
    Guid ConversationId
);

/// <summary>DTO para notificar una solicitud de amistad desde Messages via HTTP.</summary>
public record FriendRequestNotification(
    Guid RequestId,
    Guid ReceiverUserId,
    string SenderName,
    string SenderAvatarUrl
);

/// <summary>DTO para enviar datos del mensaje a los clientes via SignalR.</summary>
public record MessagePayload(
    Guid Id,
    Guid ConversationId,
    Guid SenderUserId,
    string SenderName,
    string? SenderAvatarUrl,
    string Body,
    string Type,
    DateTime CreatedAt,
    Guid? ParentMessageId
);

/// <summary>DTO para notificar una nueva solicitud de amistad via SignalR.</summary>
public record FriendRequestPayload(
    Guid RequestId,
    Guid SenderUserId,
    string SenderName,
    string? SenderAvatarUrl,
    DateTime CreatedAt
);
