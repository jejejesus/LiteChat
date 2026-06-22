using System.Text.Json.Serialization;

namespace Shared.Enums.Chat;

/// <summary>Tipo de conversación disponible en el sistema.</summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum ConversationType
{
    /// <summary>Canal público visible para todos los miembros.</summary>
    channel,
    /// <summary>Canal privado con acceso restringido.</summary>
    private_channel,
    /// <summary>Conversación directa entre dos usuarios.</summary>
    direct_message,
    /// <summary>Conversación grupal entre múltiples usuarios.</summary>
    group_message
}
