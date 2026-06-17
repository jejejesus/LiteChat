using Messages.DTOs;
using Messages.Exceptions;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
using Shared.Entities.Auth;
using Shared.Entities.Chat;
using Shared.Enums.Chat;

namespace Messages.Services
{
    public class ChatService : IChatService
    {
        private readonly AppDbContext _context;
        private readonly ILogger<ChatService> _logger;

        public ChatService(AppDbContext context, ILogger<ChatService> logger)
        {
            _context = context;
            _logger = logger;
        }

        public async Task<List<ConversationDTO>> GetUserConversationsAsync(Guid userId)
        {
            var conversations = await _context.ConversationMembers
                .Where(cm => cm.UserId == userId && cm.LeftAt == null)
                .Include(cm => cm.Conversation)
                    .ThenInclude(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
                .Select(cm => new ConversationDTO
                {
                    Id = cm.Conversation.Id,
                    Type = cm.Conversation.Type,
                    Name = cm.Conversation.Name
                        ?? (cm.Conversation.Type == ConversationType.direct_message
                            ? cm.Conversation.Members
                                .Where(m => m.UserId != userId)
                                .Select(m => m.User.Name + " " + m.User.FirstSurname)
                                .FirstOrDefault()
                            : null)
                        ?? "Sin nombre",
                    IconUrl = cm.Conversation.IconUrl,
                    Description = cm.Conversation.Description,
                    UnreadCount = _context.Messages.Count(m =>
                        m.ConversationId == cm.Conversation.Id &&
                        m.CreatedAt > (cm.LastReadAt ?? cm.JoinedAt)),
                    UpdatedAt = cm.Conversation.UpdatedAt,
                    LastMessage = cm.Conversation.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .Take(1)
                        .Select(m => new MessageDTO
                        {
                            Id = m.Id,
                            ConversationId = m.ConversationId,
                            SenderUserId = m.SenderUserId,
                            Body = m.Body,
                            CreatedAt = m.CreatedAt,
                            Type = m.Type
                        })
                        .FirstOrDefault()
                })
                .OrderByDescending(c => c.UpdatedAt)
                .ToListAsync();

            return conversations;
        }

        public async Task<List<MessageDTO>> GetConversationMessagesAsync(Guid conversationId, Guid userId, int page = 1, int pageSize = 50)
        {
            // Verificar que el usuario es miembro de la conversación
            var isMember = await _context.ConversationMembers
                .AnyAsync(cm => cm.ConversationId == conversationId && cm.UserId == userId && cm.LeftAt == null);

            if (!isMember)
                throw new UnauthorizedAccessException("No eres miembro de esta conversación");

            var messages = await _context.Messages
                .Where(m => m.ConversationId == conversationId && m.DeletedAt == null)
                .Include(m => m.SenderUser)
                .Include(m => m.Attachments)
                .OrderByDescending(m => m.CreatedAt)
                .Skip((page - 1) * pageSize)
                .Take(pageSize)
                .Select(m => new MessageDTO
                {
                    Id = m.Id,
                    ConversationId = m.ConversationId,
                    SenderUserId = m.SenderUserId,
                    SenderName = m.SenderUser!.Name + " " + m.SenderUser.FirstSurname,
                    SenderAvatarUrl = m.SenderUser.AvatarUrl,
                    Type = m.Type,
                    Body = m.Body,
                    CreatedAt = m.CreatedAt,
                    EditedAt = m.EditedAt,
                    Attachments = m.Attachments.Select(a => new MessageAttachmentDTO
                    {
                        Id = a.Id,
                        StorageUrl = a.StorageUrl,
                        OriginalName = a.OriginalName,
                        MimeType = a.MimeType,
                        SizeBytes = a.SizeBytes
                    }).ToList()
                })
                .ToListAsync();

            return messages;
        }

        public async Task<MessageDTO> SendMessageAsync(Guid userId, SendMessageRequest request)
        {
            // Verificar membresía
            var member = await _context.ConversationMembers
                .FirstOrDefaultAsync(cm => cm.ConversationId == request.ConversationId && cm.UserId == userId && cm.LeftAt == null);

            if (member == null)
                throw new UnauthorizedAccessException("No eres miembro de esta conversación");

            // Validar mensaje de texto
            if (request.Type == MessageType.text && string.IsNullOrWhiteSpace(request.Body))
                throw new ArgumentException("El mensaje de texto no puede estar vacío");

            var message = new Message
            {
                Id = Guid.NewGuid(),
                ConversationId = request.ConversationId,
                SenderUserId = userId,
                ParentMessageId = request.ParentMessageId,
                Type = request.Type,
                Body = request.Body,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Messages.Add(message);

            // Actualizar la conversación
            var conversation = await _context.Conversations.FindAsync(request.ConversationId);
            if (conversation != null)
            {
                conversation.UpdatedAt = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();

            // Cargar datos del usuario para la respuesta
            var user = await _context.Users.FindAsync(userId);
            var attachments = await _context.MessageAttachments
                .Where(a => a.MessageId == message.Id)
                .ToListAsync();

            return new MessageDTO
            {
                Id = message.Id,
                ConversationId = message.ConversationId,
                SenderUserId = message.SenderUserId,
                SenderName = user?.Name + " " + user?.FirstSurname ?? "",
                SenderAvatarUrl = user?.AvatarUrl,
                Type = message.Type,
                Body = message.Body,
                CreatedAt = message.CreatedAt,
                EditedAt = message.EditedAt,
                Attachments = attachments.Select(a => new MessageAttachmentDTO
                {
                    Id = a.Id,
                    StorageUrl = a.StorageUrl,
                    OriginalName = a.OriginalName,
                    MimeType = a.MimeType,
                    SizeBytes = a.SizeBytes
                }).ToList()
            };
        }

        public async Task MarkMessagesAsReadAsync(Guid conversationId, Guid userId)
        {
            var member = await _context.ConversationMembers
                .FirstOrDefaultAsync(cm => cm.ConversationId == conversationId && cm.UserId == userId);

            if (member != null)
            {
                member.LastReadAt = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }
        }

        public async Task<FriendRequestDTO> SendFriendRequestAsync(Guid senderUserId, SendFriendRequestRequest request)
        {
            // No enviarse a sí mismo
            if (senderUserId == request.ReceiverUserId)
                throw new InvalidOperationException("No puedes enviarte una solicitud a ti mismo");

            // Verificar que el receptor existe
            var receiver = await _context.Users.FindAsync(request.ReceiverUserId);
            if (receiver == null)
                throw new NotFoundException("Usuario no encontrado");

            // Verificar si ya existe una solicitud pendiente
            var existingRequest = await _context.FriendRequests
                .FirstOrDefaultAsync(r =>
                    (r.SenderUserId == senderUserId && r.ReceiverUserId == request.ReceiverUserId && r.Status == FriendRequestStatus.Pending) ||
                    (r.SenderUserId == request.ReceiverUserId && r.ReceiverUserId == senderUserId && r.Status == FriendRequestStatus.Pending));

            if (existingRequest != null)
                throw new InvalidOperationException("Ya existe una solicitud pendiente entre estos usuarios");

            // Verificar si ya son amigos (tienen una conversación direct_message activa)
            var existingConversation = await _context.ConversationMembers
                .Where(cm => cm.UserId == senderUserId && cm.LeftAt == null)
                .Select(cm => cm.Conversation)
                .Where(c => c.Type == ConversationType.direct_message)
                .FirstOrDefaultAsync(c => c.Members.Any(m => m.UserId == request.ReceiverUserId && m.LeftAt == null));

            if (existingConversation != null)
                throw new InvalidOperationException("Ya son amigos");

            var friendRequest = new FriendRequest
            {
                Id = Guid.NewGuid(),
                SenderUserId = senderUserId,
                ReceiverUserId = request.ReceiverUserId,
                Message = request.Message,
                Status = FriendRequestStatus.Pending,
                CreatedAt = DateTime.UtcNow
            };

            _context.FriendRequests.Add(friendRequest);
            await _context.SaveChangesAsync();

            return MapToFriendRequestDto(friendRequest);
        }

        public async Task<List<FriendRequestDTO>> GetPendingFriendRequestsAsync(Guid userId)
        {
            var requests = await _context.FriendRequests
                .Where(r => r.ReceiverUserId == userId && r.Status == FriendRequestStatus.Pending)
                .Include(r => r.SenderUser)
                .Include(r => r.ReceiverUser)
                .OrderByDescending(r => r.CreatedAt)
                .ToListAsync();

            return requests.Select(MapToFriendRequestDto).ToList();
        }

        public async Task<FriendRequestDTO> RespondToFriendRequestAsync(Guid userId, RespondFriendRequestRequest request)
        {
            var friendRequest = await _context.FriendRequests
                .Include(r => r.SenderUser)
                .Include(r => r.ReceiverUser)
                .FirstOrDefaultAsync(r => r.Id == request.RequestId && r.ReceiverUserId == userId);

            if (friendRequest == null)
                throw new NotFoundException("Solicitud no encontrada");

            if (friendRequest.Status != FriendRequestStatus.Pending)
                throw new InvalidOperationException("Esta solicitud ya fue respondida");

            friendRequest.Status = request.Status;
            friendRequest.RespondedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            // Si es aceptada, crear la conversación directa
            if (request.Status == FriendRequestStatus.Accepted)
            {
                await CreateDirectConversationAsync(friendRequest.SenderUserId, friendRequest.ReceiverUserId);
            }

            return MapToFriendRequestDto(friendRequest);
        }

        public async Task<ConversationDTO> CreateDirectConversationAsync(Guid userId1, Guid userId2)
        {
            // Verificar si ya existe una conversación directa
            var existingConversation = await _context.ConversationMembers
                .Where(cm => cm.UserId == userId1 && cm.LeftAt == null)
                .Select(cm => cm.Conversation)
                .Where(c => c.Type == ConversationType.direct_message)
                .FirstOrDefaultAsync(c => c.Members.Any(m => m.UserId == userId2 && m.LeftAt == null));

            if (existingConversation != null)
                return await MapToConversationDto(existingConversation, userId1);

            // Crear nueva conversación
            var conversation = new Conversation
            {
                Id = Guid.NewGuid(),
                Type = ConversationType.direct_message,
                CreatedByUserId = userId1,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Conversations.Add(conversation);

            // Agregar ambos miembros
            var member1 = new ConversationMember
            {
                ConversationId = conversation.Id,
                UserId = userId1,
                Role = MemberRole.member,
                JoinedAt = DateTime.UtcNow
            };

            var member2 = new ConversationMember
            {
                ConversationId = conversation.Id,
                UserId = userId2,
                Role = MemberRole.member,
                JoinedAt = DateTime.UtcNow
            };

            _context.ConversationMembers.AddRange(member1, member2);
            await _context.SaveChangesAsync();

            return await MapToConversationDto(conversation, userId1);
        }

        public async Task<List<UserDTO>> GetUserFriendsAsync(Guid userId)
        {
            var friends = await _context.ConversationMembers
                .Where(cm => cm.UserId == userId && cm.LeftAt == null)
                .Select(cm => cm.Conversation)
                .Where(c => c.Type == ConversationType.direct_message)
                .SelectMany(c => c.Members)
                .Where(cm => cm.UserId != userId && cm.LeftAt == null)
                .Select(cm => new UserDTO
                {
                    Id = cm.User!.Id,
                    Name = cm.User.Name,
                    FirstSurname = cm.User.FirstSurname,
                    SecondSurname = cm.User.SecondSurname,
                    SurnameFirst = cm.User.SurnameFirst,
                    AvatarUrl = cm.User.AvatarUrl,
                    Status = cm.User.Status,
                    FullName = cm.User.SurnameFirst
                        ? $"{cm.User.FirstSurname} {cm.User.SecondSurname} {cm.User.Name}"
                        : $"{cm.User.Name} {cm.User.FirstSurname} {cm.User.SecondSurname}"
                })
                .ToListAsync();

            return friends;
        }

        // Métodos auxiliares privados
        private FriendRequestDTO MapToFriendRequestDto(FriendRequest request)
        {
            return new FriendRequestDTO
            {
                Id = request.Id,
                SenderUserId = request.SenderUserId,
                SenderName = GetFullName(request.SenderUser),
                SenderAvatarUrl = request.SenderUser?.AvatarUrl,
                ReceiverUserId = request.ReceiverUserId,
                ReceiverName = GetFullName(request.ReceiverUser),
                ReceiverAvatarUrl = request.ReceiverUser?.AvatarUrl,
                Status = request.Status,
                Message = request.Message,
                CreatedAt = request.CreatedAt,
                RespondedAt = request.RespondedAt
            };
        }

        private async Task<ConversationDTO> MapToConversationDto(Conversation conversation, Guid currentUserId)
        {
            return new ConversationDTO
            {
                Id = conversation.Id,
                Type = conversation.Type,
                Name = conversation.Type == ConversationType.direct_message
                    ? GetOtherMemberName(conversation.Id, currentUserId)
                    : conversation.Name,
                IconUrl = conversation.IconUrl,
                Description = conversation.Description,
                UnreadCount = await _context.Messages
                    .CountAsync(m => m.ConversationId == conversation.Id &&
                        m.CreatedAt > (_context.ConversationMembers
                            .Where(cm => cm.ConversationId == conversation.Id && cm.UserId == currentUserId)
                            .Select(cm => cm.LastReadAt)
                            .FirstOrDefault() ?? DateTime.MinValue)),
                UpdatedAt = conversation.UpdatedAt
            };
        }

        private string GetFullName(User? user)
        {
            if (user == null) return string.Empty;

            return user.SurnameFirst
                ? $"{user.FirstSurname} {user.SecondSurname} {user.Name}".Trim()
                : $"{user.Name} {user.FirstSurname} {user.SecondSurname}".Trim();
        }

        private string GetOtherMemberName(Guid conversationId, Guid currentUserId)
        {
            var otherMember = _context.ConversationMembers
                .Where(cm => cm.ConversationId == conversationId && cm.UserId != currentUserId)
                .Select(cm => cm.User)
                .FirstOrDefault();

            return GetFullName(otherMember);
        }
    }
}
