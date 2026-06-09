using System.Text.Json.Serialization;

namespace Shared.Enums.Chat
{
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MemberRole
    {
        owner,
        admin,
        member
    }
}
