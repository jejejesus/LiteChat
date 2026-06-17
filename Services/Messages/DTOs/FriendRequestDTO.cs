using Shared.Enums.Chat;

namespace Messages.DTOs
{
    /// <summary>Datos de una solicitud de amistad para la respuesta de la API.</summary>
    public class FriendRequestDTO
    {
        /// <summary>Identificador único de la solicitud.</summary>
        public Guid Id { get; set; }
        /// <summary>Identificador del usuario remitente.</summary>
        public Guid SenderUserId { get; set; }
        /// <summary>Nombre completo del remitente.</summary>
        public string SenderName { get; set; } = string.Empty;
        /// <summary>URL del avatar del remitente.</summary>
        public string? SenderAvatarUrl { get; set; }
        /// <summary>Identificador del usuario destinatario.</summary>
        public Guid ReceiverUserId { get; set; }
        /// <summary>Nombre completo del destinatario.</summary>
        public string ReceiverName { get; set; } = string.Empty;
        /// <summary>URL del avatar del destinatario.</summary>
        public string? ReceiverAvatarUrl { get; set; }
        /// <summary>Estado actual de la solicitud.</summary>
        public FriendRequestStatus Status { get; set; }
        /// <summary>Mensaje opcional incluido en la solicitud.</summary>
        public string? Message { get; set; }
        /// <summary>Fecha y hora de creación.</summary>
        public DateTime CreatedAt { get; set; }
        /// <summary>Fecha y hora de respuesta (aceptación/rechazo).</summary>
        public DateTime? RespondedAt { get; set; }
    }

    /// <summary>Solicitud para enviar una solicitud de amistad.</summary>
    public class SendFriendRequestRequest
    {
        /// <summary>Identificador del usuario que recibirá la solicitud.</summary>
        public required Guid ReceiverUserId { get; set; }
        /// <summary>Mensaje opcional para acompañar la solicitud.</summary>
        public string? Message { get; set; }
    }

    /// <summary>Solicitud para responder a una solicitud de amistad.</summary>
    public class RespondFriendRequestRequest
    {
        /// <summary>Identificador de la solicitud a responder.</summary>
        public required Guid RequestId { get; set; }
        /// <summary>Nuevo estado (Accepted o Rejected).</summary>
        public required FriendRequestStatus Status { get; set; } 
    }
}
