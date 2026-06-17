using Messages.DTOs;

namespace Messages.Services;

/// <summary>Define el contrato para el servicio de mensajería y amigos.</summary>
public interface IChatService
{
    /// <summary>Obtiene las conversaciones activas del usuario.</summary>
    Task<List<ConversationDTO>> GetUserConversationsAsync(Guid userId);

    /// <summary>Obtiene los mensajes de una conversación con paginación.</summary>
    Task<List<MessageDTO>> GetConversationMessagesAsync(Guid conversationId, Guid userId, int page = 1, int pageSize = 50);

    /// <summary>Envía un mensaje a una conversación.</summary>
    Task<MessageDTO> SendMessageAsync(Guid userId, SendMessageRequest request);

    /// <summary>Marca todos los mensajes de una conversación como leídos.</summary>
    Task MarkMessagesAsReadAsync(Guid conversationId, Guid userId);

    /// <summary>Envía una solicitud de amistad a otro usuario.</summary>
    Task<FriendRequestDTO> SendFriendRequestAsync(Guid senderUserId, SendFriendRequestRequest request);

    /// <summary>Obtiene las solicitudes de amistad pendientes del usuario.</summary>
    Task<List<FriendRequestDTO>> GetPendingFriendRequestsAsync(Guid userId);

    /// <summary>Responde a una solicitud de amistad (aceptar/rechazar).</summary>
    Task<FriendRequestDTO> RespondToFriendRequestAsync(Guid userId, RespondFriendRequestRequest request);

    /// <summary>Crea una conversación directa entre dos usuarios.</summary>
    Task<ConversationDTO> CreateDirectConversationAsync(Guid userId1, Guid userId2);

    /// <summary>Obtiene la lista de amigos del usuario.</summary>
    Task<List<UserDTO>> GetUserFriendsAsync(Guid userId);
}
