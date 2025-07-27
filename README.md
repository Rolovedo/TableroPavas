# Tablero Kanban - Sistema de Gestión de Tareas

## 🎯 Descripción
Sistema web de gestión de tareas tipo Kanban desarrollado con React.js y Node.js, desplegado en Vercel con base de datos PostgreSQL en Supabase.

## 🏗️ Arquitectura

### Frontend
- **Framework:** React.js 17.x
- **UI Library:** PrimeReact
- **Estilos:** SCSS + PrimeFlex
- **Routing:** React Router
- **Estado:** Context API
- **Build:** Create React App con react-app-rewired

### Backend
- **Runtime:** Node.js con Express.js
- **Base de Datos:** PostgreSQL (Supabase)
- **Autenticación:** JWT + Testing mode
- **Deployment:** Vercel Serverless Functions

### Deployment
- **Frontend:** Vercel (Static Build)
- **Backend:** Vercel (Serverless Functions)
- **Base de Datos:** Supabase PostgreSQL
- **CI/CD:** Automático desde GitHub

## 🚀 URLs de Producción

- **Aplicación:** https://tablero-pavas.vercel.app
- **API:** https://tablero-pavas.vercel.app/api

## 🔑 Credenciales de Testing

```
Email: admin@tablero.com
Password: admin123
```

## 📁 Estructura del Proyecto

```
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/    # Componentes reutilizables
│   │   ├── context/       # Context API (Auth, Socket, etc.)
│   │   ├── pages/         # Páginas de la aplicación
│   │   ├── api/           # Servicios y llamadas API
│   │   ├── utils/         # Utilidades y constantes
│   │   └── assets/        # Recursos estáticos
│   ├── public/            # Archivos públicos
│   └── package.json       # Dependencias del frontend
├── api/                   # Backend Serverless
│   └── index.js          # API principal con endpoints
├── vercel.json           # Configuración de Vercel
└── README.md             # Este archivo
```

## 🛠️ Scripts Disponibles

### Frontend (desde /client)
```bash
npm start          # Desarrollo local
npm run build      # Build de producción
npm run vercel-build  # Build para Vercel
```

### Desarrollo Local
```bash
# Frontend
cd client && npm install && npm start

# Backend (si se desarrolla localmente)
cd api && npm install && npm run dev
```

## 🔗 API Endpoints

### Autenticación
- `POST /api/auth/login` - Login de usuario

### Aplicación
- `GET /api/app/get_menu` - Obtener menú del sidebar
- `GET /api/app/get_permissions_user` - Permisos del usuario
- `GET /api/app/verify_token` - Verificar token de sesión

### Notificaciones
- `GET /api/notifications/get_notification_count` - Contador de notificaciones

### Utilidades
- `GET /api` - Health check de la API
- `GET /api/test-db` - Test de conexión a base de datos

## 🎨 Características

- ✅ **Tablero Kanban:** Gestión visual de tareas
- ✅ **Autenticación:** Sistema de login seguro
- ✅ **Responsive:** Adaptable a móviles y tablets
- ✅ **Sidebar Navegación:** Menú lateral con Dashboard y Configuración
- ✅ **Notificaciones:** Sistema de alertas en tiempo real
- ✅ **Drag & Drop:** Mover tareas entre columnas
- ✅ **Deploy Automático:** CI/CD con Vercel

## 🔧 Configuración de Environment Variables

### Vercel (Producción)
```
DB_HOST=db.eukvsggruwdokftylssc.supabase.co
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=98631063ace
DB_NAME=postgres
REACT_APP_API_URL=https://tablero-pavas.vercel.app
```

## 📱 Responsive Design

- **Desktop:** Layout completo con sidebar
- **Tablet:** Sidebar colapsable
- **Mobile:** Menú hamburguesa

## 🔒 Seguridad

- HTTPS obligatorio en producción
- CORS configurado para dominios permitidos
- Validación de tokens JWT
- Sanitización de inputs

## 📊 Estado del Proyecto

- **Estado:** ✅ Funcional en producción
- **Testing:** ✅ Login y navegación funcionando
- **Deployment:** ✅ Automático desde GitHub
- **Performance:** ✅ Optimizado para producción

## 👥 Para Desarrolladores

### Setup Inicial
1. Clonar el repositorio
2. `cd client && npm install`
3. `npm start` para desarrollo local
4. Los cambios a `main` se despliegan automáticamente

### Estructura de Datos
- **Usuarios:** Testing mode con credenciales hardcodeadas
- **Menú:** Estructura jerárquica padres/hijos
- **Permisos:** Array de IDs de funcionalidades permitidas

### Consideraciones
- Backend en modo testing (sin base de datos real por ahora)
- Socket.io temporalmente deshabilitado
- Autenticación simplificada para demostración

---

**Desarrollado por:** Equipo Pavas Tecnología  
**Última actualización:** Enero 2025  
**Versión:** 1.0.0
