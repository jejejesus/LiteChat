using Shared.Enums.Chat;

namespace Messages.DTOs
{
    public class ConversationDTO
    {
        public Guid Id { get; set; }
        public ConversationType Type { get; set; }
        public string? Name { get; set; }
        public string? IconUrl { get; set; }
        public string? Description { get; set; }
        public MessageDTO? LastMessage { get; set; }
        public int UnreadCount { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}
