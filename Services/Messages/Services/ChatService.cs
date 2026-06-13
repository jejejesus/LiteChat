using Messages.DTOs;
using Microsoft.EntityFrameworkCore;
using Shared.Data;
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

        public async Task<List<ConversationDto>> GetUserConversationsAsync(Guid userId)
        {
            var conversations = await _context.ConversationMembers
                .Where(cm => cm.UserId == userId && cm.LeftAt == null)
                .Include(cm => cm.Conversation)
                    .ThenInclude(c => c.Messages.OrderByDescending(m => m.CreatedAt).Take(1))
                .Select(cm => new ConversationDto
                {
                    Id = cm.Conversation.Id,
                    Type = cm.Conversation.Type,
                    Name = cm.Conversation.Name ?? GetConversationName(cm.Conversation, userId),
                    IconUrl = cm.Conversation.IconUrl,
                    Description = cm.Conversation.Description,
                    UnreadCount = _context.Messages.Count(m =>
                        m.ConversationId == cm.Conversation.Id &&
                        m.CreatedAt > (cm.LastReadAt ?? cm.JoinedAt)),
                    UpdatedAt = cm.Conversation.UpdatedAt,
                    LastMessage = cm.Conversation.Messages
                        .OrderByDescending(m => m.CreatedAt)
                        .Take(1)
                        .Select(m => new MessageDto
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

        public async Task<List<MessageDto>> GetConversationMessagesAsync(Guid conversationId, Guid userId, int page = 1, int pageSize = 50)
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
                .Select(m => new MessageDto
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
                    Attachments = m.Attachments.Select(a => new MessageAttachmentDto
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

        public async Task<MessageDto> SendMessageAsync(Guid userId, SendMessageRequest request)
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

            return new MessageDto
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
                Attachments = attachments.Select(a => new MessageAttachmentDto
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

        private string GetConversationName(Conversation conversation, Guid userId)
        {
            // Para DMs, obtener el nombre del otro participante
            if (conversation.Type == ConversationType.direct_message)
            {
                var otherMember = _context.ConversationMembers
                    .Where(cm => cm.ConversationId == conversation.Id && cm.UserId != userId)
                    .Select(cm => cm.User)
                    .FirstOrDefault();

                if (otherMember != null)
                    return $"{otherMember.Name} {otherMember.FirstSurname}";
            }

            return conversation.Name ?? "Sin nombre";
        }
    }
}
