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
  seenAt: string | null;
}

export interface Attachment {
  id: string;
  storageUrl: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
}

export interface UserDTO {
  id: string;
  name: string;
  firstSurname: string;
  secondSurname: string | null;
  surnameFirst: boolean;
  avatarUrl: string | null;
  status: string;
  fullName: string;
}

export interface FriendRequestDTO {
  id: string;
  senderUserId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  receiverUserId: string;
  receiverName: string;
  receiverAvatarUrl: string | null;
  status: "Pending" | "Accepted" | "Rejected" | "Blocked" | "Cancelled";
  message: string | null;
  createdAt: string;
  respondedAt: string | null;
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
      message = parsed.error || parsed.detail || parsed.title || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const text = await res.text();
  return text ? JSON.parse(text) : (undefined as unknown as T);
}

async function friendsFetch<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${MESSAGES_API_URL}/api/friends${endpoint}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let message = `HTTP ${res.status}`;
    try {
      const parsed = JSON.parse(body);
      message = parsed.error || parsed.detail || parsed.title || message;
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

export async function searchUsers(query: string): Promise<UserDTO[]> {
  return friendsFetch<UserDTO[]>("/search", {
    method: "POST",
    body: JSON.stringify({ query }),
  });
}

export async function sendFriendRequest(
  receiverUserId: string,
  message?: string,
): Promise<FriendRequestDTO> {
  return friendsFetch<FriendRequestDTO>("/requests", {
    method: "POST",
    body: JSON.stringify({ receiverUserId, message: message ?? null }),
  });
}

export async function getPendingFriendRequests(): Promise<FriendRequestDTO[]> {
  return friendsFetch<FriendRequestDTO[]>("/requests/pending");
}

export async function respondToFriendRequest(
  requestId: string,
  status: "Accepted" | "Rejected",
): Promise<FriendRequestDTO> {
  return friendsFetch<FriendRequestDTO>(`/requests/${requestId}/respond`, {
    method: "PUT",
    body: JSON.stringify({ requestId, status }),
  });
}

export async function getFriendsList(): Promise<UserDTO[]> {
  return friendsFetch<UserDTO[]>("/list");
}
