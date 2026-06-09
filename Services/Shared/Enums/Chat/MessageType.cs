using System.Text.Json.Serialization;

namespace Shared.Enums.Chat
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MessageType
    {
        text,
        system,
        file,
        comment
    }
}
