using Shared.Enums.Chat;
using System.ComponentModel.DataAnnotations;

namespace Messages.DTOs
{
    public class SendMessageRequest
    {
        [Required]
        public required Guid ConversationId { get; set; }

        [Required]
        public required MessageType Type { get; set; }

        public string? Body { get; set; }

        public Guid? ParentMessageId { get; set; }
    }
}
