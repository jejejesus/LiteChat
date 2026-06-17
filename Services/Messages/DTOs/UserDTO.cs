using Shared.Enums.Auth;

namespace Messages.DTOs
{
    /// <summary>Datos públicos de un usuario para la respuesta de la API.</summary>
    public class UserDTO
    {
        /// <summary>Identificador del usuario.</summary>
        public Guid Id { get; set; }
        /// <summary>Nombre del usuario.</summary>
        public string Name { get; set; } = string.Empty;
        /// <summary>Primer apellido.</summary>
        public string FirstSurname { get; set; } = string.Empty;
        /// <summary>Segundo apellido (opcional).</summary>
        public string? SecondSurname { get; set; }
        /// <summary>Indica si el apellido se muestra antes que el nombre.</summary>
        public bool SurnameFirst { get; set; }
        /// <summary>URL del avatar.</summary>
        public string? AvatarUrl { get; set; }
        /// <summary>Estado actual del usuario.</summary>
        public UserStatus Status { get; set; }
        /// <summary>Nombre completo formateado según la preferencia de orden.</summary>
        public string FullName { get; set; } = string.Empty;
    }
}
