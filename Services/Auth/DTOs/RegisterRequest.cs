using System.ComponentModel.DataAnnotations;

namespace Auth.DTOs
{
    public class RegisterRequest
    {
        [Required]
        [EmailAddress]
        [MaxLength(320)]
        public required string Email { get; set; }

        [Required]
        [MaxLength(120)]
        public required string Name { get; set; }

        [Required]
        [MaxLength(120)]
        public required string FirstSurname { get; set; }

        [MaxLength(120)]
        public string? SecondSurname { get; set; }

        public bool SurnameFirst { get; set; } = false;

        [Required]
        public DateOnly BirthDate { get; set; }

        [Required]
        [Phone]
        [MaxLength(15)]
        public required string PhoneNumber { get; set; }

        [Required]
        [MinLength(6)]
        [MaxLength(100)]
        public required string Password { get; set; }
    }
}
