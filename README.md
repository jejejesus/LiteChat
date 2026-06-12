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
- [ ] Chats en tiempo real (en desarrollo)
- [ ] Conversaciones grupales
- [ ] Mensajes con diferentes tipos (texto, imágenes, etc.)
- [ ] Roles de miembros en conversaciones

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

Crea una base de datos PostgreSQL y configura la cadena de conexión en `Services/Auth/appsettings.json`:

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

### 3. Ejecutar migraciones

```bash
cd Services/Auth
dotnet ef database update
```

### 4. Iniciar el backend

```bash
cd Services/Auth
dotnet run
```

La API estará disponible en `http://localhost:5004` y la documentación Swagger en `/swagger`.

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

## Estructura del proyecto

```
LiteChat/
├── Apps/
│   └── Web/                      # Frontend Next.js
│       ├── app/
│       │   ├── (chat)/           # Páginas del chat
│       │   └── auth/             # Páginas de autenticación
│       ├── components/
│           └── UI/               # Componentes reutilizables
│       ├── .env.local            # Variables de entorno (URL de la API)
│       ├── lib/
│       │   └── api.ts            # Cliente HTTP para la API de autenticación
│       ├── contexts/
│       │   └── AuthContext.tsx   # Contexto global de autenticación
│       └── middleware.ts         # Protección de rutas del lado del servidor
├── Services/
│   ├── Auth/                     # Microservicio de autenticación
│   │   ├── Endpoints/            # Endpoints de la API
│   │   ├── Services/             # Lógica de negocio
│   │   ├── DTOs/                 # Objetos de transferencia de datos
│   │   └── Middleware/           # Middleware personalizado
│   └── Shared/                   # Librería compartida
│       ├── Data/                 # DbContext y configuraciones
│       ├── Entities/             # Entidades del dominio
│       └── Enums/                # Enumeraciones
├── Packages/                     # Paquetes compartidos (pendiente)
├── package.json                  # Configuración del monorepo
├── pnpm-workspace.yaml           # Workspace de pnpm
```

## Licencia

Distribuido bajo la licencia Apache 2.0. Ver `LICENSE.md` para más información.
