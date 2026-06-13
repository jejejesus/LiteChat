using Messages.DTOs;

namespace Messages.Services
{
    public interface IChatService
    {
        Task<List<ConversationDto>> GetUserConversationsAsync(Guid userId);
        Task<List<MessageDto>> GetConversationMessagesAsync(Guid conversationId, Guid userId, int page = 1, int pageSize = 50);
        Task<MessageDto> SendMessageAsync(Guid userId, SendMessageRequest request);
        Task MarkMessagesAsReadAsync(Guid conversationId, Guid userId);
    }
}
