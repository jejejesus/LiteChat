using Shared.Entities.Chat;
using Shared.Enums.Auth;
using System.ComponentModel.DataAnnotations;

namespace Shared.Entities.Auth
{
    /// <summary>Representa un usuario registrado en el sistema.</summary>
    public class User
    {
        /// <summary>Identificador único del usuario.</summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>Correo electrónico del usuario (único en el sistema).</summary>
        [MaxLength(320)]
        [EmailAddress]
        public required string Email { get; set; }

        /// <summary>Nombre del usuario.</summary>
        [MaxLength(120)]
        public required string Name { get; set; }

        /// <summary>Primer apellido del usuario.</summary>
        [MaxLength(120)]
        public required string FirstSurname { get; set; }

        /// <summary>Segundo apellido del usuario (opcional).</summary>
        [MaxLength(120)]
        public string? SecondSurname { get; set; }

        /// <summary>Indica si el apellido debe mostrarse antes que el nombre.</summary>
        public bool SurnameFirst { get; set; } = false;

        /// <summary>Fecha de nacimiento del usuario.</summary>
        public DateOnly BirthDate { get; set; }

        /// <summary>Número de teléfono del usuario (único en el sistema).</summary>
        [MaxLength(15)]
        [Phone]
        public required string PhoneNumber { get; set; }

        /// <summary>URL del avatar del usuario.</summary>
        [MaxLength(2048)]
        [Url]
        public string? AvatarUrl { get; set; }

        /// <summary>Estado actual del usuario en el sistema.</summary>
        public UserStatus Status { get; set; }

        /// <summary>Contraseña del usuario almacenada como hash SHA-256.</summary>
        [MaxLength(255)]
        public required string HashedPassword { get; set; }

        // Timestamps
        private DateTime _createdAt = DateTime.UtcNow;
        /// <summary>Fecha y hora de creación del usuario.</summary>
        public DateTime CreatedAt 
        { 
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
    
        private DateTime _updatedAt = DateTime.UtcNow;
        /// <summary>Fecha y hora de la última actualización.</summary>
        public DateTime UpdatedAt 
        { 
            get => _updatedAt;
            set => _updatedAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }
    
        private DateTime? _deletedAt;
        /// <summary>Fecha y hora de eliminación lógica (soft delete).</summary>
        public DateTime? DeletedAt 
        { 
            get => _deletedAt;
            set => _deletedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }

        // Navigation properties
        /// <summary>Conversaciones creadas por el usuario.</summary>
        public ICollection<Conversation> CreatedConversations { get; set; } = [];
        /// <summary>Suscripciones del usuario a conversaciones.</summary>
        public ICollection<ConversationMember> ConversationMemberships { get; set; } = [];
        /// <summary>Mensajes enviados por el usuario.</summary>
        public ICollection<Message> SentMessages { get; set; } = [];
    }
}
