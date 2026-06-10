using Shared.Entities.Chat;
using Shared.Enums.Auth;
using System.ComponentModel.DataAnnotations;

namespace Shared.Entities.Auth
{
    public class User
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        [MaxLength(320)]
        [EmailAddress]
        public required string Email { get; set; }

        [MaxLength(120)]
        public required string Name { get; set; }

        [MaxLength(120)]
        public required string FirstSurname { get; set; }

        [MaxLength(120)]
        public string? SecondSurname { get; set; }

        public bool SurnameFirst { get; set; } = false;

        public DateOnly BirthDate { get; set; }

        [MaxLength(15)]
        [Phone]
        public required string PhoneNumber { get; set; }

        [MaxLength(2048)]
        [Url]
        public string? AvatarUrl { get; set; }

        public UserStatus Status { get; set; }

        [MaxLength(255)]
        public required string HashedPassword { get; set; }

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
        public ICollection<Conversation> CreatedConversations { get; set; } = [];
        public ICollection<ConversationMember> ConversationMemberships { get; set; } = [];
        public ICollection<Message> SentMessages { get; set; } = [];
    }
}
