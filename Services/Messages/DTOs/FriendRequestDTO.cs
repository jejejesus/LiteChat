using Shared.Enums.Chat;

namespace Messages.DTOs
{
    public class FriendRequestDTO
    {
        public Guid Id { get; set; }
        public Guid SenderUserId { get; set; }
        public string SenderName { get; set; } = string.Empty;
        public string? SenderAvatarUrl { get; set; }
        public Guid ReceiverUserId { get; set; }
        public string ReceiverName { get; set; } = string.Empty;
        public string? ReceiverAvatarUrl { get; set; }
        public FriendRequestStatus Status { get; set; }
        public string? Message { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? RespondedAt { get; set; }
    }

    public class SendFriendRequestRequest
    {
        public required Guid ReceiverUserId { get; set; }
        public string? Message { get; set; }
    }

    public class RespondFriendRequestRequest
    {
        public required Guid RequestId { get; set; }
        public required FriendRequestStatus Status { get; set; } 
    }
}
