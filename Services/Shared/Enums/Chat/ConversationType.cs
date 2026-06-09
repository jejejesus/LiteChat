using System.Text.Json.Serialization;

namespace Shared.Enums.Chat
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum ConversationType
    {
        channel,
        private_channel,
        direct_message,
        group_message
    }
}
