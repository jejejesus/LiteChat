using Shared.Enums.Chat;

namespace Messages.DTOs
{
    /// <summary>Datos de una conversación para la respuesta de la API.</summary>
    public class ConversationDTO
    {
        /// <summary>Identificador único de la conversación.</summary>
        public Guid Id { get; set; }
        /// <summary>Tipo de conversación (DM, grupo, canal).</summary>
        public ConversationType Type { get; set; }
        /// <summary>Nombre mostrado de la conversación.</summary>
        public string? Name { get; set; }
        /// <summary>URL del ícono de la conversación.</summary>
        public string? IconUrl { get; set; }
        /// <summary>Descripción de la conversación.</summary>
        public string? Description { get; set; }
        /// <summary>Último mensaje enviado en la conversación.</summary>
        public MessageDTO? LastMessage { get; set; }
        /// <summary>Cantidad de mensajes no leídos.</summary>
        public int UnreadCount { get; set; }
        /// <summary>Fecha y hora de la última actividad.</summary>
        public DateTime UpdatedAt { get; set; }
    }
}
