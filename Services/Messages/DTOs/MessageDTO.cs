using Shared.Enums.Chat;

namespace Messages.DTOs;

/// <summary>Datos de un mensaje para la respuesta de la API.</summary>
public class MessageDTO
{
    /// <summary>Identificador único del mensaje.</summary>
    public Guid Id { get; set; }
    /// <summary>Identificador de la conversación.</summary>
    public Guid ConversationId { get; set; }
    /// <summary>Identificador del usuario remitente.</summary>
    public Guid SenderUserId { get; set; }
    /// <summary>Nombre completo del remitente.</summary>
    public string SenderName { get; set; } = string.Empty;
    /// <summary>URL del avatar del remitente.</summary>
    public string? SenderAvatarUrl { get; set; }
    /// <summary>Tipo de contenido del mensaje.</summary>
    public MessageType Type { get; set; }
    /// <summary>Cuerpo del mensaje (texto).</summary>
    public string? Body { get; set; }
    /// <summary>Fecha y hora de envío.</summary>
    public DateTime CreatedAt { get; set; }
    /// <summary>Fecha y hora de edición (null si no editado).</summary>
    public DateTime? EditedAt { get; set; }
    /// <summary>Indica si el mensaje ha sido editado.</summary>
    public bool IsEdited => EditedAt.HasValue;
    /// <summary>Archivos adjuntos al mensaje.</summary>
    public List<MessageAttachmentDTO> Attachments { get; set; } = [];
}
