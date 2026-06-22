namespace Shared.Enums.Chat;

/// <summary>Estado de una solicitud de amistad.</summary>
public enum FriendRequestStatus
{
    /// <summary>Solicitud pendiente de respuesta.</summary>
    Pending,
    /// <summary>Solicitud aceptada, los usuarios ahora son amigos.</summary>
    Accepted,
    /// <summary>Solicitud rechazada por el destinatario.</summary>
    Rejected,
    /// <summary>Usuario bloqueado.</summary>
    Blocked,
    /// <summary>Solicitud cancelada por el remitente.</summary>
    Cancelled
}
