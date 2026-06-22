using Microsoft.EntityFrameworkCore;
using Shared.Entities.Auth;
using Shared.Entities.Chat;
using Shared.Enums.Chat;

namespace Shared.Data;

/// <summary>Contexto de base de datos principal de LiteChat.</summary>
/// <remarks>
/// Configura las entidades del dominio, las convenciones de nomenclatura snake_case,
/// las conversiones de tipos (enums a string, DateOnly a DateTime) y las relaciones
/// entre entidades mediante Fluent API.
/// </remarks>
public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    /// <summary>Usuarios registrados en el sistema.</summary>
    public DbSet<User> Users { get; set; }
    /// <summary>Conversaciones (canales, DMs, grupos).</summary>
    public DbSet<Conversation> Conversations { get; set; }
    /// <summary>Suscripciones de usuarios a conversaciones.</summary>
    public DbSet<ConversationMember> ConversationMembers { get; set; }
    /// <summary>Mensajes enviados en las conversaciones.</summary>
    public DbSet<Message> Messages { get; set; }
    /// <summary>Archivos adjuntos a los mensajes.</summary>
    public DbSet<MessageAttachment> MessageAttachments { get; set; }
    /// <summary>Claves de cifrado para mensajes directos.</summary>
    public DbSet<DirectMessageKey> DirectMessageKeys { get; set; }
    /// <summary>Solicitudes de amistad entre usuarios.</summary>
    public DbSet<FriendRequest> FriendRequests { get; set; }

    /// <summary>Configura el modelo de entidades y sus relaciones mediante Fluent API.</summary>
    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.UseSnakeCaseNaming();

        modelBuilder.Entity<User>().ToTable("user", "auth");
        modelBuilder.Entity<Conversation>().ToTable("conversation", "chat");
        modelBuilder.Entity<ConversationMember>().ToTable("conversation_member", "chat");
        modelBuilder.Entity<Message>().ToTable("message", "chat");
        modelBuilder.Entity<MessageAttachment>().ToTable("message_attachment", "chat");
        modelBuilder.Entity<DirectMessageKey>().ToTable("direct_message_key", "chat");

        modelBuilder.Entity<User>()
            .Property(u => u.Status)
            .HasConversion<string>();

        modelBuilder.Entity<Conversation>()
            .Property(c => c.Type)
            .HasConversion<string>();

        modelBuilder.Entity<Message>()
            .Property(m => m.Type)
            .HasConversion<string>();

        modelBuilder.Entity<ConversationMember>()
            .Property(cm => cm.Role)
            .HasConversion<string>();

        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Email)
                .HasMaxLength(320)
                .IsRequired();

            entity.HasIndex(e => e.Email).IsUnique();

            entity.Property(e => e.Name)
                .HasMaxLength(120)
                .IsRequired();

            entity.Property(e => e.FirstSurname)
                .HasMaxLength(120)
                .IsRequired();

            entity.Property(e => e.SecondSurname)
                .HasMaxLength(120);

            entity.Property(e => e.PhoneNumber)
                .HasMaxLength(15)
                .IsRequired();

            entity.HasIndex(e => e.PhoneNumber).IsUnique();

            entity.Property(e => e.AvatarUrl)
                .HasMaxLength(2048);

            entity.Property(e => e.HashedPassword)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.BirthDate)
                .HasConversion<DateOnlyConverter, DateOnlyComparer>();

            entity.ToTable(t => t.HasCheckConstraint(
                "user_email_format_chk",
                "position('@' in email) > 1"));

            entity.HasIndex(e => e.Status)
                .HasDatabaseName("idx_user_status");
        });

        modelBuilder.Entity<Conversation>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.Name)
                .HasMaxLength(160);

            entity.Property(e => e.IconUrl)
                .HasMaxLength(2048);

            entity.Property(e => e.Description)
                .HasColumnType("text");

            entity.HasOne(e => e.CreatedByUser)
                .WithMany(u => u.CreatedConversations)
                .HasForeignKey(e => e.CreatedByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.ToTable(t => t.HasCheckConstraint(
                "conversation_name_required_for_channels_chk",
                @"(
                    type IN ('channel', 'private_channel')
                    AND name IS NOT NULL
                    AND btrim(name) <> ''
                )
                OR
                (
                    type IN ('direct_message', 'group_message')
                )"));

            // Índices
            entity.HasIndex(e => e.Type)
                .HasDatabaseName("idx_conversation_type");

            entity.HasIndex(e => e.CreatedByUserId)
                .HasDatabaseName("idx_conversation_created_by_user_id");
        });

        modelBuilder.Entity<ConversationMember>(entity =>
        {
            entity.HasKey(e => new { e.ConversationId, e.UserId });

            entity.Property(e => e.Role)
                .HasDefaultValue(MemberRole.member);

            entity.Property(e => e.JoinedAt)
                .HasDefaultValueSql("now()");

            entity.HasOne(e => e.Conversation)
                .WithMany(c => c.Members)
                .HasForeignKey(e => e.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.User)
                .WithMany(u => u.ConversationMemberships)
                .HasForeignKey(e => e.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.LastReadMessage)
                .WithMany(m => m.MembersWhoRead)
                .HasForeignKey(e => new { e.ConversationId, e.LastReadMessageId })
                .HasPrincipalKey(m => new { m.ConversationId, m.Id })
                .OnDelete(DeleteBehavior.SetNull);

            entity.ToTable(t => t.HasCheckConstraint(
                "conversation_member_read_time_chk",
                "last_read_at IS NULL OR last_read_at >= joined_at"));

            entity.HasIndex(e => new { e.UserId, e.ConversationId })
                .HasDatabaseName("idx_conversation_member_user_conversation");

            entity.HasIndex(e => new { e.ConversationId, e.LeftAt })
                .HasDatabaseName("idx_conversation_member_conversation_left_at");
        });

        modelBuilder.Entity<Message>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.Conversation)
                .WithMany(c => c.Messages)
                .HasForeignKey(e => e.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.SenderUser)
                .WithMany(u => u.SentMessages)
                .HasForeignKey(e => e.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ParentMessage)
                .WithMany(m => m.Replies)
                .HasForeignKey(e => e.ParentMessageId)
                .OnDelete(DeleteBehavior.SetNull);

            entity.HasIndex(e => new { e.ConversationId, e.Id })
                .IsUnique()
                .HasDatabaseName("uq_message_conversation_id_id");

            entity.ToTable(t => t.HasCheckConstraint(
                "message_not_own_parent_chk",
                "parent_message_id IS NULL OR parent_message_id <> id"));

            entity.ToTable(t => t.HasCheckConstraint(
                "text_message_requires_body_chk",
                "type <> 'text' OR (body IS NOT NULL AND btrim(body) <> '')"));

            entity.HasIndex(e => new { e.ConversationId, e.CreatedAt })
                .IsDescending(false, true)
                .HasDatabaseName("idx_message_conversation_created_at");

            entity.HasIndex(e => e.ParentMessageId)
                .HasDatabaseName("idx_message_parent_message_id");

            entity.HasIndex(e => e.SenderUserId)
                .HasDatabaseName("idx_message_sender_user_id");
        });

        modelBuilder.Entity<MessageAttachment>(entity =>
        {
            entity.HasKey(e => e.Id);

            entity.Property(e => e.StorageUrl)
                .HasMaxLength(2048)
                .IsRequired();

            entity.Property(e => e.OriginalName)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.MimeType)
                .HasMaxLength(255)
                .IsRequired();

            entity.HasOne(e => e.Message)
                .WithMany(m => m.Attachments)
                .HasForeignKey(e => e.MessageId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.ToTable(t => t.HasCheckConstraint(
                "attachment_size_positive_chk",
                "size_bytes > 0"));

            entity.HasIndex(e => e.MessageId)
                .HasDatabaseName("idx_message_attachment_message_id");
        });

        modelBuilder.Entity<DirectMessageKey>(entity =>
        {
            entity.HasKey(e => e.ConversationId);

            entity.Property(e => e.UserPairKey)
                .HasMaxLength(255)
                .IsRequired();

            entity.HasIndex(e => e.UserPairKey).IsUnique();

            entity.HasOne(e => e.Conversation)
                .WithOne(c => c.DirectMessageKey)
                .HasForeignKey<DirectMessageKey>(d => d.ConversationId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.ToTable(t => t.HasCheckConstraint(
                "dm_pair_key_not_empty_chk",
                "btrim(user_pair_key) <> ''"));
        });

        modelBuilder.Entity<FriendRequest>(entity =>
        {
            entity.ToTable("friend_request", "chat");

            entity.HasKey(e => e.Id);

            entity.HasOne(e => e.SenderUser)
                .WithMany()
                .HasForeignKey(e => e.SenderUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(e => e.ReceiverUser)
                .WithMany()
                .HasForeignKey(e => e.ReceiverUserId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasIndex(e => new { e.SenderUserId, e.ReceiverUserId })
                .IsUnique()
                .HasDatabaseName("ix_friend_request_unique_pair");

            entity.HasIndex(e => e.Status)
                .HasDatabaseName("ix_friend_request_status");

            entity.Property(e => e.Message)
                .HasMaxLength(500);
        });
    }

    /// <summary>
    /// Actualiza automáticamente la propiedad <c>UpdatedAt</c> antes de guardar
    /// cambios en entidades que implementan timestamps de modificación.
    /// </summary>
    public override async Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
    {
        var entries = ChangeTracker.Entries()
            .Where(e => e.Entity is User or Conversation or ConversationMember or Message
                        && e.State == EntityState.Modified);

        foreach (var entry in entries)
        {
            if (entry.Property("UpdatedAt") != null)
            {
                entry.Property("UpdatedAt").CurrentValue = DateTime.UtcNow;
            }
        }

        return await base.SaveChangesAsync(cancellationToken);
    }
}

/// <summary>Convierte <c>DateOnly</c> a <c>DateTime</c> para almacenamiento en PostgreSQL.</summary>
public class DateOnlyConverter : Microsoft.EntityFrameworkCore.Storage.ValueConversion.ValueConverter<DateOnly, DateTime>
{
    public DateOnlyConverter() : base(
        d => DateTime.SpecifyKind(d.ToDateTime(TimeOnly.MinValue), DateTimeKind.Utc),
        dt => DateOnly.FromDateTime(dt))
    { }
}

/// <summary>Comparador personalizado para <c>DateOnly</c> en EF Core.</summary>
public class DateOnlyComparer : Microsoft.EntityFrameworkCore.ChangeTracking.ValueComparer<DateOnly>
{
    public DateOnlyComparer() : base(
        (d1, d2) => d1 == d2,
        d => d.GetHashCode())
    { }
}

/// <summary>Extensiones para configurar convenciones de nomenclatura snake_case en EF Core.</summary>
public static class ModelBuilderExtensions
{
    /// <summary>Convierte nombres de tablas, columnas y restricciones a snake_case.</summary>
    public static void UseSnakeCaseNaming(this ModelBuilder modelBuilder)
    {
        foreach (var entity in modelBuilder.Model.GetEntityTypes())
        {
            entity.SetTableName(ToSnakeCase(entity.GetTableName()));

            foreach (var property in entity.GetProperties())
            {
                property.SetColumnName(ToSnakeCase(property.GetColumnName()));
            }

            foreach (var key in entity.GetForeignKeys())
            {
                key.SetConstraintName(ToSnakeCase(key.GetConstraintName()));
            }
        }
    }

    /// <summary>Convierte un string PascalCase a snake_case.</summary>
    private static string ToSnakeCase(string input)
    {
        if (string.IsNullOrEmpty(input))
            return input;

        return string.Concat(
            input.Select((ch, i) =>
                i > 0 && char.IsUpper(ch) && !char.IsUpper(input[i - 1])
                    ? "_" + ch.ToString()
                    : ch.ToString())
            .Select(s => s.ToLower())
            .ToArray());
    }
}
