using Shared.Enums.Auth;

namespace Messages.DTOs
{
    public class UserDTO
    {
        public Guid Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public string FirstSurname { get; set; } = string.Empty;
        public string? SecondSurname { get; set; }
        public bool SurnameFirst { get; set; }
        public string? AvatarUrl { get; set; }
        public UserStatus Status { get; set; }
        public string FullName { get; set; } = string.Empty;
    }
}
