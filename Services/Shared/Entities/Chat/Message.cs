using Shared.Entities.Auth;
using Shared.Enums.Chat;
using System.ComponentModel.DataAnnotations;

namespace Shared.Entities.Chat
{
    public class Message
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid ConversationId { get; set; }
        public Guid SenderUserId { get; set; }
        public Guid? ParentMessageId { get; set; }

        public MessageType Type { get; set; }

        public string? Body { get; set; }

        // Timestamps
        private DateTime _createdAt = DateTime.UtcNow;
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private DateTime _updatedAt = DateTime.UtcNow;
        public DateTime UpdatedAt
        {
            get => _updatedAt;
            set => _updatedAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private DateTime? _editedAt;
        public DateTime? EditedAt
        {
            get => _editedAt;
            set => _editedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }

        private DateTime? _deletedAt;
        public DateTime? DeletedAt
        {
            get => _deletedAt;
            set => _deletedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }

        // Navigation properties
        public Conversation? Conversation { get; set; }
        public User? SenderUser { get; set; }
        public Message? ParentMessage { get; set; }
        public ICollection<Message> Replies { get; set; } = [];
        public ICollection<MessageAttachment> Attachments { get; set; } = [];
        public ICollection<ConversationMember> MembersWhoRead { get; set; } = [];
    }

    public class MessageAttachment
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid MessageId { get; set; }

        [MaxLength(2048)]
        [Url]
        public required string StorageUrl { get; set; }

        [MaxLength(255)]
        public required string OriginalName { get; set; }

        [MaxLength(255)]
        public required string MimeType { get; set; }

        public long SizeBytes { get; set; }

        private DateTime _createdAt = DateTime.UtcNow;
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        // Navigation properties
        public Message? Message { get; set; }
    }

    public class DirectMessageKey
    {
        public Guid ConversationId { get; set; }

        [MaxLength(255)]
        public required string UserPairKey { get; set; }

        // Navigation properties
        public Conversation? Conversation { get; set; }
    }
}
