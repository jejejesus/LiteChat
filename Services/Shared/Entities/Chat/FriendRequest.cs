using Shared.Entities.Auth;
using Shared.Enums.Chat;

namespace Shared.Entities.Chat
{
    public class FriendRequest
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public Guid SenderUserId { get; set; }
        public Guid ReceiverUserId { get; set; }

        public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;

        public string? Message { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? RespondedAt { get; set; }

        // Navigation properties
        public User? SenderUser { get; set; }
        public User? ReceiverUser { get; set; }
    }
}
