using Messages.DTOs;

namespace Messages.Services
{
    public interface IChatService
    {
        Task<List<ConversationDTO>> GetUserConversationsAsync(Guid userId);
        Task<List<MessageDTO>> GetConversationMessagesAsync(Guid conversationId, Guid userId, int page = 1, int pageSize = 50);
        Task<MessageDTO> SendMessageAsync(Guid userId, SendMessageRequest request);
        Task MarkMessagesAsReadAsync(Guid conversationId, Guid userId);
        Task<FriendRequestDTO> SendFriendRequestAsync(Guid senderUserId, SendFriendRequestRequest request);
        Task<List<FriendRequestDTO>> GetPendingFriendRequestsAsync(Guid userId);
        Task<FriendRequestDTO> RespondToFriendRequestAsync(Guid userId, RespondFriendRequestRequest request);
        Task<ConversationDTO> CreateDirectConversationAsync(Guid userId1, Guid userId2);
        Task<List<UserDTO>> GetUserFriendsAsync(Guid userId);
    }
}
