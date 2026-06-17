using Shared.Entities.Auth;
using Shared.Enums.Chat;
using System.ComponentModel.DataAnnotations;

namespace Shared.Entities.Chat
{
    /// <summary>Representa un mensaje enviado en una conversación.</summary>
    public class Message
    {
        /// <summary>Identificador único del mensaje.</summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>Identificador de la conversación a la que pertenece.</summary>
        public Guid ConversationId { get; set; }
        /// <summary>Identificador del usuario remitente.</summary>
        public Guid SenderUserId { get; set; }
        /// <summary>Identificador del mensaje padre (para respuestas/hilos).</summary>
        public Guid? ParentMessageId { get; set; }

        /// <summary>Tipo de contenido del mensaje.</summary>
        public MessageType Type { get; set; }

        /// <summary>Cuerpo del mensaje (texto).</summary>
        public string? Body { get; set; }

        // Timestamps
        private DateTime _createdAt = DateTime.UtcNow;
        /// <summary>Fecha y hora de envío.</summary>
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private DateTime _updatedAt = DateTime.UtcNow;
        /// <summary>Fecha y hora de la última edición.</summary>
        public DateTime UpdatedAt
        {
            get => _updatedAt;
            set => _updatedAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        private DateTime? _editedAt;
        /// <summary>Fecha y hora de edición (null si no ha sido editado).</summary>
        public DateTime? EditedAt
        {
            get => _editedAt;
            set => _editedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }

        private DateTime? _deletedAt;
        /// <summary>Fecha y hora de eliminación lógica.</summary>
        public DateTime? DeletedAt
        {
            get => _deletedAt;
            set => _deletedAt = value.HasValue ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc) : null;
        }

        // Navigation properties
        /// <summary>Conversación a la que pertenece el mensaje.</summary>
        public Conversation? Conversation { get; set; }
        /// <summary>Usuario que envió el mensaje.</summary>
        public User? SenderUser { get; set; }
        /// <summary>Mensaje padre (para respuestas en hilos).</summary>
        public Message? ParentMessage { get; set; }
        /// <summary>Respuestas a este mensaje.</summary>
        public ICollection<Message> Replies { get; set; } = [];
        /// <summary>Archivos adjuntos al mensaje.</summary>
        public ICollection<MessageAttachment> Attachments { get; set; } = [];
        /// <summary>Miembros que han leído este mensaje.</summary>
        public ICollection<ConversationMember> MembersWhoRead { get; set; } = [];
    }

    /// <summary>Representa un archivo adjunto a un mensaje.</summary>
    public class MessageAttachment
    {
        /// <summary>Identificador único del adjunto.</summary>
        public Guid Id { get; set; } = Guid.NewGuid();

        /// <summary>Identificador del mensaje al que pertenece.</summary>
        public Guid MessageId { get; set; }

        /// <summary>URL de almacenamiento del archivo.</summary>
        [MaxLength(2048)]
        [Url]
        public required string StorageUrl { get; set; }

        /// <summary>Nombre original del archivo.</summary>
        [MaxLength(255)]
        public required string OriginalName { get; set; }

        /// <summary>Tipo MIME del archivo.</summary>
        [MaxLength(255)]
        public required string MimeType { get; set; }

        /// <summary>Tamaño del archivo en bytes.</summary>
        public long SizeBytes { get; set; }

        private DateTime _createdAt = DateTime.UtcNow;
        /// <summary>Fecha y hora de subida.</summary>
        public DateTime CreatedAt
        {
            get => _createdAt;
            set => _createdAt = DateTime.SpecifyKind(value, DateTimeKind.Utc);
        }

        // Navigation properties
        /// <summary>Mensaje al que pertenece el adjunto.</summary>
        public Message? Message { get; set; }
    }

    /// <summary>Clave de cifrado para una conversación de mensajes directos.</summary>
    public class DirectMessageKey
    {
        /// <summary>Identificador de la conversación asociada.</summary>
        public Guid ConversationId { get; set; }

        /// <summary>Clave compartida entre los dos participantes.</summary>
        [MaxLength(255)]
        public required string UserPairKey { get; set; }

        // Navigation properties
        /// <summary>Conversación asociada.</summary>
        public Conversation? Conversation { get; set; }
    }
}
