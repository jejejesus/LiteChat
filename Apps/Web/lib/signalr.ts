import {
  HubConnectionBuilder,
  HubConnection,
  LogLevel,
  HttpTransportType,
} from "@microsoft/signalr";

const HUB_URL = process.env.NEXT_PUBLIC_REALTIME_HUB_URL ?? "http://localhost:5191/hubs/chat";

export interface MessagePayload {
  id: string;
  conversationId: string;
  senderUserId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  body: string;
  type: string;
  createdAt: string;
  parentMessageId: string | null;
}

export interface TypingInfo {
  conversationId: string;
  userId: string;
  isTyping: boolean;
}

export interface MessagesReadInfo {
  conversationId: string;
  userId: string;
}

export interface FriendRequestPayload {
  requestId: string;
  senderUserId: string;
  senderName: string;
  senderAvatarUrl: string | null;
  createdAt: string;
}

let connection: HubConnection | null = null;
let currentToken: string | null = null;
let startPromise: Promise<void> | null = null;

type EventHandler = (...args: any[]) => void;

const listeners = new Map<string, Set<EventHandler>>();

function notify(event: string, ...args: any[]) {
  listeners.get(event)?.forEach((h) => h(...args));
}

export function on(event: string, handler: EventHandler) {
  if (!listeners.has(event)) listeners.set(event, new Set());
  listeners.get(event)!.add(handler);
}

export function off(event: string, handler: EventHandler) {
  listeners.get(event)?.delete(handler);
}

export function getConnection(): HubConnection | null {
  return connection;
}

export function isConnected(): boolean {
  return connection?.state === "Connected";
}

export async function connect(token: string): Promise<void> {
  if (connection && connection.state === "Connected") return;
  if (startPromise) return startPromise;

  currentToken = token;

  connection = new HubConnectionBuilder()
    .withUrl(HUB_URL, {
      accessTokenFactory: () => currentToken ?? "",
      transport: HttpTransportType.WebSockets,
    })
    .withAutomaticReconnect([0, 2000, 5000, 10000, 30000])
    .configureLogging(LogLevel.Warning)
    .build();

  // ── Registrar handlers de eventos entrantes ──
  connection.on("MessageReceived", (payload: MessagePayload) => {
    notify("MessageReceived", payload);
  });

  connection.on("UserTyping", (info: TypingInfo) => {
    notify("UserTyping", info);
  });

  connection.on("MessagesRead", (info: MessagesReadInfo) => {
    notify("MessagesRead", info);
  });

  connection.on("FriendRequestReceived", (payload: FriendRequestPayload) => {
    notify("FriendRequestReceived", payload);
  });

  connection.on("FriendRequestAccepted", (payload: FriendRequestPayload) => {
    notify("FriendRequestAccepted", payload);
  });

  connection.onreconnecting(() => {
    notify("ConnectionState", "reconnecting");
  });

  connection.onreconnected(() => {
    notify("ConnectionState", "connected");
  });

  connection.onclose(() => {
    notify("ConnectionState", "disconnected");
  });

  startPromise = connection.start();
  await startPromise;
  startPromise = null;
  notify("ConnectionState", "connected");
}

export async function disconnect(): Promise<void> {
  if (connection) {
    try {
      await connection.stop();
    } catch { /* ignore */ }
    connection = null;
  }
  startPromise = null;
  currentToken = null;
}

// ── Métodos del hub (cliente → servidor) ──

export async function joinConversation(conversationId: string): Promise<void> {
  await connection?.invoke("JoinConversation", conversationId);
}

export async function leaveConversation(conversationId: string): Promise<void> {
  await connection?.invoke("LeaveConversation", conversationId);
}

export async function sendMessage(
  conversationId: string,
  body: string,
  type?: string,
  parentMessageId?: string | null,
): Promise<void> {
  await connection?.invoke("SendMessage", {
    conversationId,
    body,
    type: type ?? "text",
    parentMessageId: parentMessageId ?? null,
  });
}

export async function sendTyping(conversationId: string, isTyping: boolean): Promise<void> {
  await connection?.invoke("Typing", { conversationId, isTyping });
}

export async function markAsRead(conversationId: string): Promise<void> {
  await connection?.invoke("MarkAsRead", { conversationId });
}
