using System.Text.Json.Serialization;

namespace Shared.Enums.Auth
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum UserStatus
    {
        invited,
        active,
        suspended,
        disabled
    }
}
