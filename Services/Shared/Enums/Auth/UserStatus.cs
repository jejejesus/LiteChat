using System.Text.Json.Serialization;

namespace Shared.Enums.Auth;

/// <summary>Estado de un usuario en el sistema.</summary>
[JsonConverter(typeof(JsonStringEnumConverter))]
public enum UserStatus
{
    /// <summary>Usuario invitado, aún no activo.</summary>
    invited,
    /// <summary>Usuario activo con acceso completo.</summary>
    active,
    /// <summary>Usuario suspendido temporalmente.</summary>
    suspended,
    /// <summary>Usuario deshabilitado permanentemente.</summary>
    disabled
}

