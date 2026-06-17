using Shared.Enums.Chat;
using System.ComponentModel.DataAnnotations;

namespace Messages.DTOs;

/// <summary>Solicitud para enviar un nuevo mensaje a una conversación.</summary>
public class SendMessageRequest
{
    /// <summary>Identificador de la conversación destino.</summary>
    [Required]
    public required Guid ConversationId { get; set; }

    /// <summary>Tipo de contenido del mensaje.</summary>
    [Required]
    public required MessageType Type { get; set; }

    /// <summary>Cuerpo del mensaje (obligatorio para mensajes de texto).</summary>
    public string? Body { get; set; }

    /// <summary>Identificador del mensaje padre (para respuestas en hilos).</summary>
    public Guid? ParentMessageId { get; set; }
}
