# LiteChat

Una aplicación de chat en tiempo real construida como proyecto de práctica, utilizando una arquitectura de monorepo con frontend web y microservicios backend.

## Stack Tecnológico

- **Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4
- **Backend:** .NET 9, ASP.NET Core Minimal APIs
- **Base de datos:** PostgreSQL con Entity Framework Core
- **Autenticación:** JWT (JSON Web Tokens)
- **Tiempo real:** SignalR (WebSockets)
- **Monorepo:** pnpm workspaces

## Características

- [x] Autenticación de usuarios (registro e inicio de sesión)
- [x] JWT con soporte para SignalR
- [x] Protección de rutas (redirección a login si no hay sesión)
- [x] Envío de solicitudes de amistad y gestión de amigos
- [x] Conversaciones individuales y grupales
- [x] Mensajes con diferentes tipos (texto, imágenes, archivos adjuntos)
- [x] Roles de miembros en conversaciones (owner, admin, member)
- [x] Chats en tiempo real con SignalR
- [x] Indicador de escritura ("escribiendo...")
- [x] Notificaciones en tiempo real de solicitudes de amistad
- [x] Marcado de mensajes como leídos
- [x] Reconexión automática de WebSocket

## Requisitos

- Node.js >= 20
- pnpm >= 11
- .NET 9 SDK
- PostgreSQL

## Primeros pasos

### 1. Clonar el repositorio

```bash
git clone https://github.com/tuusuario/litechat.git
cd litechat
```

### 2. Configurar la base de datos

Ejecuta PostgreSQL y crea las bases de datos necesarias. Configura las cadenas de conexión en los archivos `appsettings.Development.json` de cada servicio.

Ejemplo para `Services/Auth/appsettings.Development.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=LiteChat;Username=postgres;Password=tu_password"
  },
  "Jwt": {
    "Key": "tu_clave_secreta_super_segura",
    "Issuer": "LiteChatAuthAPI",
    "Audience": "LiteChatClient",
    "ExpiryHours": 24
  }
}
```

Todos los servicios comparten la misma base de datos, la misma clave JWT y los mismos valores de issuer/audience.

### 3. Ejecutar migraciones

Todos los servicios comparten el mismo `AppDbContext` desde `Services/Shared`, por lo que las migraciones se administran desde Auth:

```bash
cd Services/Auth
dotnet ef database update
```

### 4. Iniciar los servicios backend

Cada servicio debe ejecutarse en una terminal separada:

```bash
# Terminal 1 — Auth Service
cd Services/Auth
dotnet run
```

```bash
# Terminal 2 — Messages Service
cd Services/Messages
dotnet run
```

```bash
# Terminal 3 — Realtime Service (SignalR)
cd Services/Realtime
dotnet run
```

Puertos:
| Servicio   | HTTP    | HTTPS   | Swagger              |
|------------|---------|---------|----------------------|
| Auth       | `5189`  | `7189`  | `/swagger`           |
| Messages   | `5190`  | `7190`  | `/swagger`           |
| Realtime   | `5191`  | `7191`  | — (SignalR hub)      |

### 5. Iniciar el frontend

```bash
cd Apps/Web
pnpm install
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Autenticación

El flujo de autenticación conecta el frontend (Next.js) con el backend (.NET) mediante JWT:

1. **Registro / Login** — El frontend envía las credenciales a `POST /api/auth/register` o `POST /api/auth/login`
2. **Token** — El backend responde con un JWT que se almacena en `localStorage` y en una cookie (`auth_token`)
3. **Verificación** — Al cargar la app, se verifica el token contra `GET /api/auth/verify`
4. **Protección de rutas** — Un `middleware.ts` de Next.js lee la cookie y redirige a `/auth/login` si no hay sesión, o a `/` si ya hay sesión activa
5. **Logout** — Elimina el token de `localStorage` y la cookie, y redirige al login

## Tiempo real con SignalR

El servicio **Realtime** (`/hubs/chat`) maneja toda la comunicación en tiempo real vía WebSocket.

### Eventos del hub

**Cliente → Servidor:**
| Método              | Parámetros                                    | Descripción                         |
|---------------------|-----------------------------------------------|-------------------------------------|
| `JoinConversation`  | `conversationId`                              | Unirse al grupo de una conversación |
| `LeaveConversation` | `conversationId`                              | Abandonar el grupo                  |
| `SendMessage`       | `{ conversationId, body, type?, parentMessageId? }` | Enviar un mensaje            |
| `Typing`            | `{ conversationId, isTyping }`                | Indicar que se está escribiendo     |
| `MarkAsRead`        | `{ conversationId }`                          | Marcar mensajes como leídos         |

**Servidor → Cliente:**
| Evento                  | Payload                                            | Descripción                         |
|-------------------------|----------------------------------------------------|-------------------------------------|
| `MessageReceived`       | `MessagePayload`                                   | Nuevo mensaje en una conversación   |
| `UserTyping`            | `{ conversationId, userId, isTyping }`             | Usuario está escribiendo            |
| `MessagesRead`          | `{ conversationId, userId }`                       | Mensajes leídos por un usuario      |
| `FriendRequestReceived` | `FriendRequestPayload`                             | Nueva solicitud de amistad          |
| `FriendRequestAccepted` | `FriendRequestPayload`                             | Solicitud de amistad aceptada       |

### Reconexión automática

El cliente SignalR se reconecta automáticamente con intervalos progresivos: 0s, 2s, 5s, 10s, 30s. El token JWT se envía vía `access_token` en la query string de la conexión WebSocket.

## API Endpoints

### Auth Service (`https://localhost:7189`)

| Método   | Ruta                    | Descripción                     | Auth |
|----------|-------------------------|---------------------------------|------|
| POST     | `/api/auth/register`    | Registrar un nuevo usuario      | ❌   |
| POST     | `/api/auth/login`       | Iniciar sesión                  | ❌   |
| POST     | `/api/auth/verify`      | Verificar validez del token JWT | ✅   |
| GET      | `/api/users/me`         | Obtener perfil del usuario actual | ✅   |
| GET      | `/api/users/search?q=`  | Buscar usuarios por nombre/email | ✅   |

### Messages Service (`https://localhost:7190`)

| Método | Ruta                                         | Descripción                              | Auth |
|--------|----------------------------------------------|------------------------------------------|------|
| POST   | `/api/chat/messages`                         | Enviar mensaje (fallback vía REST)        | ✅   |
| GET    | `/api/chat/conversations`                    | Listar conversaciones del usuario        | ✅   |
| GET    | `/api/chat/conversations/{id}/messages`      | Obtener mensajes históricos              | ✅   |
| POST   | `/api/chat/conversations/{id}/read`          | Marcar mensajes como leídos              | ✅   |
| POST   | `/api/friends/requests`                      | Enviar solicitud de amistad              | ✅   |
| GET    | `/api/friends/requests/pending`              | Listar solicitudes pendientes            | ✅   |
| PUT    | `/api/friends/requests/{id}/respond`         | Responder solicitud (aceptar/rechazar)   | ✅   |
| GET    | `/api/friends/list`                          | Listar amigos aceptados                  | ✅   |
| POST   | `/api/friends/search`                        | Buscar usuarios por nombre o email       | ✅   |

### Realtime Service — Endpoints internos (`http://localhost:5191`)

| Método | Ruta                                        | Descripción                                      |
|--------|---------------------------------------------|--------------------------------------------------|
| POST   | `/api/internal/notify/friend-request`        | Messages notifica nueva solicitud para broadcast |
| POST   | `/api/internal/notify/friend-request-accepted` | Messages notifica solicitud aceptada           |

## Estructura del proyecto

```
LiteChat/
├── Apps/
│   └── Web/                      # Frontend Next.js
│       ├── app/
│       │   ├── (chat)/           # Páginas del chat
│       │   └── auth/             # Páginas de autenticación
│       ├── components/
│       │   ├── Chat/             # ChatList, ChatView
│       │   ├── Friends/          # FriendsPanel
│       │   └── UI/               # Componentes reutilizables
│       ├── contexts/
│       │   ├── AuthContext.tsx    # Estado de autenticación
│       │   ├── SignalRContext.tsx # Conexión y métodos SignalR
│       │   └── NavContext.tsx     # Navegación (chats/amigos)
│       ├── lib/
│       │   ├── auth.api.ts       # Cliente HTTP para Auth API
│       │   ├── messages.api.ts   # Cliente HTTP para Messages API
│       │   └── signalr.ts        # Servicio singleton SignalR
│       ├── .env.local            # Variables de entorno
│       └── middleware.ts         # Protección de rutas SSR
├── Services/
│   ├── Auth/                     # Servicio de autenticación (puerto 7189)
│   │   ├── Endpoints/
│   │   ├── Services/
│   │   ├── DTOs/
│   │   ├── Middleware/
│   │   └── Program.cs
│   ├── Messages/                 # Servicio de mensajería (puerto 7190)
│   │   ├── Endpoints/
│   │   ├── Services/
│   │   ├── DTOs/
│   │   ├── Middleware/
│   │   └── Program.cs
│   ├── Realtime/                 # Servicio SignalR (puerto 7191)
│   │   ├── Hubs/
│   │   │   └── ChatHub.cs        # Hub principal de SignalR
│   │   ├── Models/               # DTOs para comunicación del hub
│   │   ├── Endpoints/            # Endpoints internos de notificación
│   │   └── Program.cs
│   └── Shared/                   # Librería compartida entre servicios
│       ├── Data/                 # AppDbContext, migraciones
│       ├── Entities/             # User, Conversation, Message, etc.
│       └── Enums/                # Enumeraciones del dominio
├── package.json
├── pnpm-workspace.yaml
└── README.md
```

## Middleware

### Auth Service
1. **ErrorHandlingMiddleware** — Captura todas las excepciones no controladas y retorna una respuesta JSON genérica con código 500 (oculta detalles del error en producción).

### Messages Service
1. **ErrorHandlingMiddleware** — Manejo genérico de excepciones.
2. **ExceptionHandlingMiddleware** — Manejo específico de `NotFoundException` (404).

## Entidades del Dominio (Shared)

| Entidad             | Descripción                                       |
|---------------------|---------------------------------------------------|
| `User`              | Usuario de la plataforma                          |
| `FriendRequest`     | Solicitud de amistad entre usuarios               |
| `Conversation`      | Conversación (individual o grupal)                |
| `ConversationMember`| Miembro de una conversación con su rol            |
| `Message`           | Mensaje dentro de una conversación                |
| `MessageAttachment` | Archivo adjunto a un mensaje                      |
| `DirectMessageKey`  | Clave compuesta para identificar conversaciones DM |

## Licencia

Distribuido bajo la licencia Apache 2.0. Ver `LICENSE.md` para más información.
