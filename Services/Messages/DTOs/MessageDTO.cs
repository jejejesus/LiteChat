using Shared.Enums.Chat;

namespace Messages.DTOs
{
    public class MessageDto
    {
        public Guid Id { get; set; }
        public Guid ConversationId { get; set; }
        public Guid SenderUserId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string? SenderAvatarUrl { get; set; }
        public MessageType Type { get; set; }
        public string? Body { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EditedAt { get; set; }
        public bool IsEdited => EditedAt.HasValue;
        public List<MessageAttachmentDto> Attachments { get; set; } = [];
    }
}
