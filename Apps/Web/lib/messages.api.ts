const MESSAGES_API_URL =
  process.env.NEXT_PUBLIC_MESSAGES_API_URL ?? "http://localhost:5005";

export interface Conversation {
  id: string;
  type: "channel" | "private_channel" | "direct_message" | "group_message";
  name: string | null;
  iconUrl: string | null;
  description: string | null;
  lastMessage: Message | null;
  unreadCount: number;
  updatedAt: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  type: "text" | "system" | "file" | "comment";
  body: string | null;
  createdAt: string;
  editedAt: string | null;
  isEdited: boolean;
  attachments: Attachment[];
}

export interface Attachment {
  id: string;
  storageUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${MESSAGES_API_URL}/api/chat${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(body);
      message = parsed.error || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as unknown as T);
}

export async function getUserConversations(): Promise<Conversation[]> {
  return apiFetch<Conversation[]>("/conversations");
}

export async function getConversationMessages(
  conversationId: string,
  page: number = 1,
  pageSize: number = 50,
): Promise<Message[]> {
  return apiFetch<Message[]>(
    `/conversations/${conversationId}/messages?page=${page}&pageSize=${pageSize}`,
  );
}

export async function sendMessage(
  conversationId: string,
  body: string,
  type: "text" | "system" | "file" | "comment" = "text",
): Promise<Message> {
  return apiFetch<Message>("/messages", {
    method: "POST",
    body: JSON.stringify({ conversationId, body, type }),
  });
}

export async function markAsRead(conversationId: string): Promise<void> {
  await apiFetch(`/conversations/${conversationId}/read`, {
    method: "POST",
  });
}
