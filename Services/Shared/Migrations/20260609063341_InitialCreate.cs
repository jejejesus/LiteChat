using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Shared.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "chat");

            migrationBuilder.EnsureSchema(
                name: "auth");

            migrationBuilder.CreateTable(
                name: "user",
                schema: "auth",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    email = table.Column<string>(type: "character varying(320)", maxLength: 320, nullable: false),
                    name = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    first_surname = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: false),
                    second_surname = table.Column<string>(type: "character varying(120)", maxLength: 120, nullable: true),
                    surname_first = table.Column<bool>(type: "boolean", nullable: false),
                    birth_date = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    phone_number = table.Column<string>(type: "character varying(15)", maxLength: 15, nullable: false),
                    avatar_url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    status = table.Column<string>(type: "text", nullable: false),
                    hashed_password = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user", x => x.id);
                    table.CheckConstraint("user_email_format_chk", "position('@' in email) > 1");
                });

            migrationBuilder.CreateTable(
                name: "conversation",
                schema: "chat",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    type = table.Column<string>(type: "text", nullable: false),
                    name = table.Column<string>(type: "character varying(160)", maxLength: 160, nullable: true),
                    icon_url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: true),
                    description = table.Column<string>(type: "text", nullable: true),
                    created_by_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_conversation", x => x.id);
                    table.CheckConstraint("conversation_name_required_for_channels_chk", "(\r\n                    type IN ('channel', 'private_channel')\r\n                    AND name IS NOT NULL\r\n                    AND btrim(name) <> ''\r\n                )\r\n                OR\r\n                (\r\n                    type IN ('direct_message', 'group_message')\r\n                )");
                    table.ForeignKey(
                        name: "fk_conversations_users_created_by_user_id",
                        column: x => x.created_by_user_id,
                        principalSchema: "auth",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "direct_message_key",
                schema: "chat",
                columns: table => new
                {
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_pair_key = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_direct_message_key", x => x.conversation_id);
                    table.CheckConstraint("dm_pair_key_not_empty_chk", "btrim(user_pair_key) <> ''");
                    table.ForeignKey(
                        name: "fk_direct_message_keys_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalSchema: "chat",
                        principalTable: "conversation",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "message",
                schema: "chat",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    sender_user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    parent_message_id = table.Column<Guid>(type: "uuid", nullable: true),
                    type = table.Column<string>(type: "text", nullable: false),
                    body = table.Column<string>(type: "text", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    edited_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    deleted_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_message", x => x.id);
                    table.UniqueConstraint("AK_message_conversation_id_id", x => new { x.conversation_id, x.id });
                    table.CheckConstraint("message_not_own_parent_chk", "parent_message_id IS NULL OR parent_message_id <> id");
                    table.CheckConstraint("text_message_requires_body_chk", "type <> 'text' OR (body IS NOT NULL AND btrim(body) <> '')");
                    table.ForeignKey(
                        name: "fk_messages_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalSchema: "chat",
                        principalTable: "conversation",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_messages_messages_parent_message_id",
                        column: x => x.parent_message_id,
                        principalSchema: "chat",
                        principalTable: "message",
                        principalColumn: "id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_messages_users_sender_user_id",
                        column: x => x.sender_user_id,
                        principalSchema: "auth",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "conversation_member",
                schema: "chat",
                columns: table => new
                {
                    conversation_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    role = table.Column<string>(type: "text", nullable: false, defaultValue: "member"),
                    joined_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "now()"),
                    last_read_message_id = table.Column<Guid>(type: "uuid", nullable: true),
                    last_read_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    muted_until = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    left_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_conversation_member", x => new { x.conversation_id, x.user_id });
                    table.CheckConstraint("conversation_member_read_time_chk", "last_read_at IS NULL OR last_read_at >= joined_at");
                    table.ForeignKey(
                        name: "fk_conversation_members__messages_last_read_message_id",
                        columns: x => new { x.conversation_id, x.last_read_message_id },
                        principalSchema: "chat",
                        principalTable: "message",
                        principalColumns: new[] { "conversation_id", "id" },
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "fk_conversation_members_conversations_conversation_id",
                        column: x => x.conversation_id,
                        principalSchema: "chat",
                        principalTable: "conversation",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "fk_conversation_members_users_user_id",
                        column: x => x.user_id,
                        principalSchema: "auth",
                        principalTable: "user",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "message_attachment",
                schema: "chat",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    message_id = table.Column<Guid>(type: "uuid", nullable: false),
                    storage_url = table.Column<string>(type: "character varying(2048)", maxLength: 2048, nullable: false),
                    original_name = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    mime_type = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    size_bytes = table.Column<long>(type: "bigint", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_message_attachment", x => x.id);
                    table.CheckConstraint("attachment_size_positive_chk", "size_bytes > 0");
                    table.ForeignKey(
                        name: "fk_message_attachments_messages_message_id",
                        column: x => x.message_id,
                        principalSchema: "chat",
                        principalTable: "message",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "idx_conversation_created_by_user_id",
                schema: "chat",
                table: "conversation",
                column: "created_by_user_id");

            migrationBuilder.CreateIndex(
                name: "idx_conversation_type",
                schema: "chat",
                table: "conversation",
                column: "type");

            migrationBuilder.CreateIndex(
                name: "idx_conversation_member_conversation_left_at",
                schema: "chat",
                table: "conversation_member",
                columns: new[] { "conversation_id", "left_at" });

            migrationBuilder.CreateIndex(
                name: "idx_conversation_member_user_conversation",
                schema: "chat",
                table: "conversation_member",
                columns: new[] { "user_id", "conversation_id" });

            migrationBuilder.CreateIndex(
                name: "IX_conversation_member_conversation_id_last_read_message_id",
                schema: "chat",
                table: "conversation_member",
                columns: new[] { "conversation_id", "last_read_message_id" });

            migrationBuilder.CreateIndex(
                name: "IX_direct_message_key_user_pair_key",
                schema: "chat",
                table: "direct_message_key",
                column: "user_pair_key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_message_conversation_created_at",
                schema: "chat",
                table: "message",
                columns: new[] { "conversation_id", "created_at" },
                descending: new[] { false, true });

            migrationBuilder.CreateIndex(
                name: "idx_message_parent_message_id",
                schema: "chat",
                table: "message",
                column: "parent_message_id");

            migrationBuilder.CreateIndex(
                name: "idx_message_sender_user_id",
                schema: "chat",
                table: "message",
                column: "sender_user_id");

            migrationBuilder.CreateIndex(
                name: "uq_message_conversation_id_id",
                schema: "chat",
                table: "message",
                columns: new[] { "conversation_id", "id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "idx_message_attachment_message_id",
                schema: "chat",
                table: "message_attachment",
                column: "message_id");

            migrationBuilder.CreateIndex(
                name: "idx_user_status",
                schema: "auth",
                table: "user",
                column: "status");

            migrationBuilder.CreateIndex(
                name: "IX_user_email",
                schema: "auth",
                table: "user",
                column: "email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_user_phone_number",
                schema: "auth",
                table: "user",
                column: "phone_number",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "conversation_member",
                schema: "chat");

            migrationBuilder.DropTable(
                name: "direct_message_key",
                schema: "chat");

            migrationBuilder.DropTable(
                name: "message_attachment",
                schema: "chat");

            migrationBuilder.DropTable(
                name: "message",
                schema: "chat");

            migrationBuilder.DropTable(
                name: "conversation",
                schema: "chat");

            migrationBuilder.DropTable(
                name: "user",
                schema: "auth");
        }
    }
}
