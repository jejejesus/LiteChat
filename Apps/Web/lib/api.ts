const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5004";

interface AuthResponse {
  userId: string;
  email: string;
  fullName: string;
  token: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  name: string;
  firstSurname: string;
  secondSurname?: string;
  surnameFirst: boolean;
  birthDate: string;
  phoneNumber: string;
  password: string;
}

interface LoginRequest {
  email: string;
  password: string;
}

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    localStorage.setItem("auth_token", token);
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  } else {
    localStorage.removeItem("auth_token");
    document.cookie = "auth_token=; path=/; max-age=0";
  }
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

  const res = await fetch(`${API_URL}/api/auth${endpoint}`, {
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

export async function register(data: RegisterRequest): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(res.token);
  return res;
}

export async function login(data: LoginRequest): Promise<AuthResponse> {
  const res = await apiFetch<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(res.token);
  return res;
}

export async function logout(): Promise<void> {
  try {
    await apiFetch("/logout", { method: "POST" });
  } finally {
    setToken(null);
  }
}

export async function verifyToken(): Promise<boolean> {
  try {
    await apiFetch<{ valid: boolean }>("/verify");
    return true;
  } catch {
    setToken(null);
    return false;
  }
}

export { getToken, setToken };
