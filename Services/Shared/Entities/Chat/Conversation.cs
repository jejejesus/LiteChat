using Shared.Entities.Auth;
using Shared.Enums.Chat;
using System.ComponentModel.DataAnnotations;

namespace Shared.Entities.Chat
{
    /// <summary>Representa una conversación (canal, DM o grupo).</summary>
    public class Conversation
    {
        /// <summary>Identificador único de la conversación.</summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>Tipo de conversación.</summary>
        public ConversationType Type { get; set; }

        /// <summary>Nombre de la conversación (para canales y grupos).</summary>
        [MaxLength(160)]
        public string? Name { get; set; }

        /// <summary>URL del ícono o avatar de la conversación.</summary>
        [MaxLength(2048)]
        [Url]
        public string? IconUrl { get; set; }

        /// <summary>Descripción de la conversación.</summary>
        public string? Description { get; set; }

        /// <summary>Identificador del usuario que creó la conversación.</summary>
        public Guid CreatedByUserId { get; set; }

        // Timestamps
        private DateTime _createdAt = DateTime.UtcNow;
        /// <summary>Fecha y hora de creación.</summary>
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private DateTime _updatedAt = DateTime.UtcNow;
        /// <summary>Fecha y hora de la última actividad.</summary>
        public DateTime UpdatedAt
        {
            get => _updatedAt;
            set => _updatedAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private DateTime? _deletedAt;
        /// <summary>Fecha y hora de eliminación lógica.</summary>
        public DateTime? DeletedAt
        {
            get => _deletedAt;
            set => _deletedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }

        // Navigation properties
        /// <summary>Usuario que creó la conversación.</summary>
        public User? CreatedByUser { get; set; }
        /// <summary>Miembros de la conversación.</summary>
        public ICollection<ConversationMember> Members { get; set; } = [];
        /// <summary>Mensajes de la conversación.</summary>
        public ICollection<Message> Messages { get; set; } = [];
        /// <summary>Clave de cifrado para mensajes directos.</summary>
        public DirectMessageKey? DirectMessageKey { get; set; }
    }

    /// <summary>Representa la suscripción de un usuario a una conversación.</summary>
    public class ConversationMember
    {
        /// <summary>Identificador de la conversación.</summary>
        public Guid ConversationId { get; set; }
        /// <summary>Identificador del usuario miembro.</summary>
        public Guid UserId { get; set; }

        /// <summary>Rol del miembro dentro de la conversación.</summary>
        public MemberRole Role { get; set; } = MemberRole.member;
        /// <summary>Fecha y hora en que el usuario se unió.</summary>
        public DateTime JoinedAt { get; set; } = DateTime.UtcNow;
        /// <summary>Identificador del último mensaje leído.</summary>
        public Guid? LastReadMessageId { get; set; }
        /// <summary>Fecha y hora de la última lectura.</summary>
        public DateTime? LastReadAt { get; set; }
        /// <summary>Fecha y hora hasta la que el usuario está silenciado.</summary>
        public DateTime? MutedUntil { get; set; }
        /// <summary>Fecha y hora en que el usuario abandonó la conversación.</summary>
        public DateTime? LeftAt { get; set; }

        // Timestamps
        private DateTime _createdAt = DateTime.UtcNow;
        /// <summary>Fecha y hora de creación del registro.</summary>
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

        // Navigation properties
        /// <summary>Conversación asociada.</summary>
        public Conversation? Conversation { get; set; }
        /// <summary>Usuario miembro.</summary>
        public User? User { get; set; }
        /// <summary>Último mensaje marcado como leído.</summary>
        public Message? LastReadMessage { get; set; }
    }
}
