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
- [ ] Chats en tiempo real (en desarrollo)

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

Ejecuta PostgreSQL y crea las bases de datos necesarias. Configura las cadenas de conexión en los archivos `appsettings.json` de cada servicio.

Ejemplo para `Services/Auth/appsettings.json`:

```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Database=litechat;Username=postgres;Password=tu_password"
  },
  "Jwt": {
    "Key": "tu_clave_secreta_super_segura",
    "Issuer": "LiteChat",
    "Audience": "LiteChat"
  }
}
```

El servicio de Messages usa la misma base de datos compartida y la misma configuración JWT (clave, issuer, audience deben coincidir para validar los tokens).

### 3. Ejecutar migraciones

Ambos servicios comparten el mismo `AppDbContext` desde `Services/Shared`, por lo que las migraciones se administran desde Auth:

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

Puertos:
| Servicio   | HTTP    | HTTPS   | Swagger              |
|------------|---------|---------|----------------------|
| Auth       | `5004`  | `5005`  | `/swagger`           |
| Messages   | `5006`  | `5007`  | `/swagger`           |

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

## API Endpoints

### Auth Service (`http://localhost:5004`)

| Método   | Ruta                    | Descripción                     | Auth |
|----------|-------------------------|---------------------------------|------|
| POST     | `/api/auth/register`    | Registrar un nuevo usuario      | ❌   |
| POST     | `/api/auth/login`       | Iniciar sesión                  | ❌   |
| POST     | `/api/auth/verify`      | Verificar validez del token JWT | ✅   |
| GET      | `/api/users/me`         | Obtener perfil del usuario actual | ✅   |
| GET      | `/api/users/search?q=`  | Buscar usuarios por nombre/email | ✅   |

### Messages Service (`http://localhost:5006`)

| Método | Ruta                                 | Descripción                          | Auth |
|--------|--------------------------------------|--------------------------------------|------|
| POST   | `/api/friends/request`               | Enviar solicitud de amistad          | ✅   |
| POST   | `/api/friends/request/{id}/accept`   | Aceptar solicitud de amistad         | ✅   |
| POST   | `/api/friends/request/{id}/reject`   | Rechazar solicitud de amistad        | ✅   |
| GET    | `/api/friends/requests/pending`      | Listar solicitudes de amistad pendientes | ✅ |
| GET    | `/api/friends/list`                  | Listar amigos aceptados              | ✅   |
| POST   | `/api/chat/conversations`            | Crear o recuperar conversación individual | ✅ |
| POST   | `/api/chat/conversations/group`      | Crear conversación grupal            | ✅   |
| GET    | `/api/chat/conversations`            | Listar conversaciones del usuario    | ✅   |
| GET    | `/api/chat/conversations/{id}/messages` | Obtener mensajes de una conversación | ✅ |
| POST   | `/api/chat/conversations/{id}/messages` | Enviar mensaje                    | ✅   |
| POST   | `/api/chat/conversations/{id}/members` | Agregar miembro a conversación     | ✅   |

## Estructura del proyecto

```
LiteChat/
├── Apps/
│   └── Web/                      # Frontend Next.js
│       ├── app/
│       │   ├── (chat)/           # Páginas del chat
│       │   └── auth/             # Páginas de autenticación
│       ├── components/
│       │   └── UI/               # Componentes reutilizables
│       ├── .env.local            # Variables de entorno (URL de la API)
│       ├── lib/
│       │   └── api.ts            # Cliente HTTP para la API de autenticación
│       ├── contexts/
│       │   └── AuthContext.tsx   # Contexto global de autenticación
│       └── middleware.ts         # Protección de rutas del lado del servidor
├── Services/
│   ├── Auth/                     # Servicio de autenticación (puerto 5004)
│   │   ├── Endpoints/            # Endpoints de la API
│   │   │   ├── AuthEndpoints.cs
│   │   │   └── UserEndpoints.cs
│   │   ├── Services/             # Lógica de negocio
│   │   │   └── AuthService.cs
│   │   ├── DTOs/                 # Objetos de transferencia de datos
│   │   │   └── AuthDtos.cs
│   │   ├── Middleware/           # Middleware personalizado
│   │   │   └── ErrorHandlingMiddleware.cs
│   │   └── Program.cs
│   ├── Messages/                 # Servicio de mensajería (puerto 5006)
│   │   ├── Endpoints/            # Endpoints de la API
│   │   │   └── ChatEndpoints.cs
│   │   ├── Services/             # Lógica de negocio
│   │   │   ├── ChatService.cs
│   │   │   └── IChatService.cs
│   │   ├── DTOs/                 # Objetos de transferencia de datos
│   │   │   ├── ConversationDTO.cs
│   │   │   ├── FriendRequestDTO.cs
│   │   │   ├── MessageAttachmentDTO.cs
│   │   │   └── MessageDTO.cs
│   │   ├── Middleware/           # Middleware personalizado
│   │   │   ├── ErrorHandlingMiddleware.cs
│   │   │   └── ExceptionHandlingMiddleware.cs
│   │   └── Program.cs
│   └── Shared/                   # Librería compartida entre servicios
│       ├── Data/
│       │   ├── AppDbContext.cs               # DbContext compartido
│       │   └── ModelBuilderExtensions.cs     # Configuración Fluent API
│       ├── Entities/             # Entidades del dominio
│       │   ├── User.cs
│       │   ├── FriendRequest.cs
│       │   ├── Conversation.cs
│       │   ├── ConversationMember.cs
│       │   ├── Message.cs
│       │   ├── MessageAttachment.cs
│       │   └── DirectMessageKey.cs
│       └── Enums/                # Enumeraciones
│           ├── UserStatus.cs
│           ├── ConversationType.cs
│           ├── FriendRequestStatus.cs
│           ├── MemberRole.cs
│           └── MessageType.cs
├── Packages/                     # Paquetes compartidos (pendiente)
├── package.json                  # Configuración del monorepo
├── pnpm-workspace.yaml           # Workspace de pnpm
└── README.md                     # Este archivo
```

## Middleware

Cada servicio implementa un pipeline de middleware para el manejo de errores:

### Auth Service
1. **ErrorHandlingMiddleware** — Captura todas las excepciones no controladas y retorna una respuesta JSON genérica con código 500 (oculta detalles del error en producción).

### Messages Service
1. **ErrorHandlingMiddleware** — Manejo genérico de excepciones (misma lógica que Auth).
2. **ExceptionHandlingMiddleware** — Manejo específico de `NotFoundException` (404) y otras excepciones conocidas.

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
