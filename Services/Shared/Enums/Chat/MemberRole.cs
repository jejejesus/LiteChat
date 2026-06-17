using System.Text.Json.Serialization;

namespace Shared.Enums.Chat
{
    /// <summary>Rol de un miembro dentro de una conversación.</summary>
    [JsonConverter(typeof(JsonStringEnumConverter))]
    public enum MemberRole
    {
        /// <summary>Propietario de la conversación con control total.</summary>
        owner,
        /// <summary>Administrador con permisos de gestión.</summary>
        admin,
        /// <summary>Miembro estándar con permisos básicos.</summary>
        member
    }
}
