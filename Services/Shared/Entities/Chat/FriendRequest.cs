using Shared.Entities.Auth;
using Shared.Enums.Chat;

namespace Shared.Entities.Chat;

/// <summary>Representa una solicitud de amistad entre dos usuarios.</summary>
public class FriendRequest
{
    /// <summary>Identificador único de la solicitud.</summary>
    public Guid Id { get; set; } = Guid.NewGuid();

    /// <summary>Identificador del usuario que envía la solicitud.</summary>
    public Guid SenderUserId { get; set; }
    /// <summary>Identificador del usuario que recibe la solicitud.</summary>
    public Guid ReceiverUserId { get; set; }

    /// <summary>Estado actual de la solicitud.</summary>
    public FriendRequestStatus Status { get; set; } = FriendRequestStatus.Pending;

    /// <summary>Mensaje opcional incluido con la solicitud.</summary>
    public string? Message { get; set; }

    /// <summary>Fecha y hora de creación de la solicitud.</summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    /// <summary>Fecha y hora de respuesta (aceptación/rechazo).</summary>
    public DateTime? RespondedAt { get; set; }

    // Navigation properties
    /// <summary>Usuario que envía la solicitud.</summary>
    public User? SenderUser { get; set; }
    /// <summary>Usuario que recibe la solicitud.</summary>
    public User? ReceiverUser { get; set; }
}
