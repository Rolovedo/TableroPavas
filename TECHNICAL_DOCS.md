# Documentación Técnica - Tablero Kanban

## 🔧 Configuración de Desarrollo

### Prerrequisitos
- Node.js 16.x o superior
- npm 7.x o superior
- Git

### Variables de Entorno

#### Desarrollo Local
Crear `.env` en `/client`:
```env
REACT_APP_API_URL=http://localhost:3001
REACT_APP_ENV=development
```

#### Producción (Vercel)
```env
DB_HOST=db.eukvsggruwdokftylssc.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=98631063ace
DB_NAME=postgres
REACT_APP_API_URL=https://tablero-pavas.vercel.app
```

## 📡 API Documentation

### Authentication Endpoints

#### POST /api/auth/login
Autenticación de usuario

**Request Body:**
```json
{
  "email": "admin@tablero.com",
  "password": "admin123"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login exitoso (modo testing)",
  "usuId": 1,
  "nombre": "Administrador",
  "correo": "admin@tablero.com",
  "token": "test-token-123",
  "user": {
    "id": 1,
    "email": "admin@tablero.com",
    "nombre": "Administrador"
  }
}
```

### Application Endpoints

#### GET /api/app/get_menu
Obtiene la estructura del menú lateral

**Response:**
```json
{
  "success": true,
  "padres": [
    {
      "id": 1,
      "label": "Dashboard",
      "icon": "pi pi-fw pi-home",
      "toa": "dashboard"
    }
  ],
  "hijos": [
    {
      "id": 21,
      "padre": 2,
      "label": "Ver Tablero",
      "icon": "pi pi-fw pi-eye",
      "toa": "tablero"
    }
  ]
}
```

#### GET /api/app/get_permissions_user?usuId=1
Obtiene permisos del usuario

**Response:**
```json
{
  "success": true,
  "usuId": 1,
  "permissions": [1, 2, 3, 21, 22, 31, 32],
  "windows": [
    {
      "id": 1,
      "nombre": "Dashboard",
      "ruta": "/dashboard",
      "activo": 1
    }
  ]
}
```

## 🎨 Estructura de Componentes

### Layout Components
- `Layout.jsx` - Wrapper principal con sidebar y topbar
- `AppMenu.js` - Menú lateral navegable
- `AppTopbar.js` - Barra superior con notificaciones

### Context Providers
- `AuthContext.jsx` - Manejo de autenticación y usuario
- `SocketContext.jsx` - WebSockets (temporalmente deshabilitado)
- `ToastContext.jsx` - Notificaciones toast

### Pages
- `Login.jsx` - Página de autenticación
- `tableroBoard.jsx` - Tablero Kanban principal

## 🔄 Estado y Navegación

### Flujo de Autenticación
1. Usuario accede a `/` → Redirect a `/login`
2. Login exitoso → Redirect a `/dashboard`
3. Token guardado en cookies (`tokenPONTO`)
4. Validación automática en cada carga

### Gestión de Estado
- **AuthContext:** Usuario, permisos, ventanas
- **Local State:** Estado específico de componentes
- **Cookies:** Persistencia de sesión

## 🚀 Deployment

### Vercel Configuration (`vercel.json`)
```json
{
  "builds": [
    {
      "src": "client/package.json",
      "use": "@vercel/static-build",
      "config": { "distDir": "build" }
    },
    {
      "src": "api/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    { "src": "/api/(.*)", "dest": "/api/index.js" },
    { "src": "/(.*)", "dest": "/client/$1" }
  ]
}
```

### Build Process
1. **Frontend:** `react-app-rewired build` → Static files
2. **Backend:** Node.js serverless function
3. **Deploy:** Automático desde GitHub push a `main`

## 🔍 Testing

### Credenciales de Prueba
```javascript
const testCredentials = [
  {
    email: "admin@tablero.com",
    password: "admin123",
    nombre: "Administrador"
  },
  {
    email: "test@test.com", 
    password: "test123",
    nombre: "Usuario Test"
  }
];
```

### Endpoints de Testing
- `/api/test-db` - Verificar conexión PostgreSQL
- `/api` - Health check de la API

## 🛠️ Troubleshooting

### Problemas Comunes

#### 1. Error 404 en API
- Verificar que Vercel esté desplegado
- Comprobar rutas en `vercel.json`

#### 2. Login no funciona
- Verificar credenciales exactas
- Revisar CORS configuration

#### 3. Sidebar no aparece
- Verificar estructura `padres/hijos` en get_menu
- Comprobar permisos de usuario

#### 4. Build falla
- Verificar versión de Node.js
- Limpiar `node_modules` y reinstalar

### Logs de Debug
```bash
# Ver logs de Vercel
npx vercel logs tablero-pavas.vercel.app

# Logs locales
npm start # Frontend
npm run dev # Backend (si está local)
```

## 📊 Performance

### Optimizaciones Implementadas
- ✅ Code splitting con React.lazy
- ✅ Minificación automática en build
- ✅ CDN global de Vercel
- ✅ Compresión gzip
- ✅ Lazy loading de componentes

### Métricas Objetivo
- **First Contentful Paint:** < 2s
- **Time to Interactive:** < 3s
- **Cumulative Layout Shift:** < 0.1

---
**Última actualización:** Enero 2025
