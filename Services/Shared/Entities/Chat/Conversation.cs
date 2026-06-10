using Shared.Entities.Auth;
using Shared.Enums.Chat;
using System.ComponentModel.DataAnnotations;

namespace Shared.Entities.Chat
{
    public class Conversation
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public ConversationType Type { get; set; }

        [MaxLength(160)]
        public string? Name { get; set; }

        [MaxLength(2048)]
        [Url]
        public string? IconUrl { get; set; }

        public string? Description { get; set; }

        public Guid CreatedByUserId { get; set; }

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

        private DateTime? _deletedAt;
        public DateTime? DeletedAt
        {
            get => _deletedAt;
            set => _deletedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }

        // Navigation properties
        public User? CreatedByUser { get; set; }
        public ICollection<ConversationMember> Members { get; set; } = [];
        public ICollection<Message> Messages { get; set; } = [];
        public DirectMessageKey? DirectMessageKey { get; set; }
    }

    public class ConversationMember
    {
        public Guid ConversationId { get; set; }
        public Guid UserId { get; set; }

        public MemberRole Role { get; set; } = MemberRole.member;
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        public Guid? LastReadMessageId { get; set; }
        public DateTime? LastReadAt { get; set; }
        public DateTime? MutedUntil { get; set; }
        public DateTime? LeftAt { get; set; }

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

        // Navigation properties
        public Conversation? Conversation { get; set; }
        public User? User { get; set; }
        public Message? LastReadMessage { get; set; }
    }
}
