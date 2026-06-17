using System.ComponentModel.DataAnnotations;

namespace Auth.DTOs
{
    /// <summary>Solicitud de registro de un nuevo usuario.</summary>
    public class RegisterRequest
    {
        /// <summary>Correo electrónico del usuario.</summary>
        [Required]
        [EmailAddress]
        [MaxLength(320)]
        public required string Email { get; set; }

        /// <summary>Nombre del usuario.</summary>
        [Required]
        [MaxLength(120)]
        public required string Name { get; set; }

        /// <summary>Primer apellido del usuario.</summary>
        [Required]
        [MaxLength(120)]
        public required string FirstSurname { get; set; }

        /// <summary>Segundo apellido del usuario (opcional).</summary>
        [MaxLength(120)]
        public string? SecondSurname { get; set; }

        /// <summary>Indica si el apellido debe mostrarse antes que el nombre.</summary>
        public bool SurnameFirst { get; set; } = false;

        /// <summary>Fecha de nacimiento.</summary>
        [Required]
        public DateOnly BirthDate { get; set; }

        /// <summary>Número de teléfono.</summary>
        [Required]
        [Phone]
        [MaxLength(15)]
        public required string PhoneNumber { get; set; }

        /// <summary>Contraseña (mín. 6 caracteres).</summary>
        [Required]
        [MinLength(6)]
        [MaxLength(100)]
        public required string Password { get; set; }
    }
}
