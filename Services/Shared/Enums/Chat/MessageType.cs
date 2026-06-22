using System.Text.Json.Serialization;

namespace Shared.Enums.Chat;

/// <summary>Tipo de contenido de un mensaje.</summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum MessageType
{
    /// <summary>Mensaje de texto plano.</summary>
    text,
    /// <summary>Mensaje generado automáticamente por el sistema.</summary>
    system,
    /// <summary>Mensaje con archivo adjunto.</summary>
    file,
    /// <summary>Comentario a un mensaje existente.</summary>
    comment
}
