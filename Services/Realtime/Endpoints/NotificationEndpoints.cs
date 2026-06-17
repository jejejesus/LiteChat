using Microsoft.AspNetCore.SignalR;
using Realtime.Hubs;
using Realtime.Models;

namespace Realtime.Endpoints;

/// <summary>Endpoints internos para que otros servicios (Messages) envíen notificaciones al hub.</summary>
public static class NotificationEndpoints
{
    public static void MapNotificationEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/internal/notify")
            .WithTags("Internal Notifications");

        group.MapPost("/friend-request", async (
            FriendRequestNotification notification,
            IHubContext<ChatHub> hubContext) =>
        {
            var payload = new FriendRequestPayload(
                RequestId: notification.RequestId,
                SenderUserId: Guid.Empty,
                SenderName: notification.SenderName,
                SenderAvatarUrl: notification.SenderAvatarUrl,
                CreatedAt: DateTime.UtcNow
            );

            await hubContext
                .Clients
                .Group($"user_{notification.ReceiverUserId}")
                .SendAsync("FriendRequestReceived", payload);

            return Results.Ok();
        });

        group.MapPost("/friend-request-accepted", async (
            FriendRequestNotification notification,
            IHubContext<ChatHub> hubContext) =>
        {
            var payload = new FriendRequestPayload(
                RequestId: notification.RequestId,
                SenderUserId: Guid.Empty,
                SenderName: notification.SenderName,
                SenderAvatarUrl: notification.SenderAvatarUrl,
                CreatedAt: DateTime.UtcNow
            );

            await hubContext
                .Clients
                .Group($"user_{notification.ReceiverUserId}")
                .SendAsync("FriendRequestAccepted", payload);

            return Results.Ok();
        });
    }
}