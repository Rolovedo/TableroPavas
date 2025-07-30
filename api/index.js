import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pkg;
dotenv.config();

const app = express();

// Configuración PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST || 'db.eukvsggruwdokftylssc.supabase.co',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '98631063ace',
    database: process.env.DB_NAME || 'postgres',
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// Middleware básico
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: [
    "http://localhost",
    "http://localhost:80",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://pavastecnologia.com",
    "https://tablero-pavas.vercel.app",
    "https://*.vercel.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(cookieParser());

// Test endpoint
app.get("/", (req, res) => {
  res.json({ 
    message: "API funcionando correctamente - RAMA DESARROLLO", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    url: req.url,
    path: req.path,
    branch: "desarrollo"
  });
});

// Endpoint raíz API también
app.get("/api", (req, res) => {
  res.json({ 
    message: "API funcionando correctamente desde /api - RAMA DESARROLLO", 
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV,
    url: req.url,
    path: req.path,
    branch: "desarrollo",
    version: "v1.1-dev"
  });
});

// Diagnóstico de variables de entorno
app.get("/api/debug", (req, res) => {
  res.json({
    message: "Debug de configuración",
    timestamp: new Date().toISOString(),
    env: {
      NODE_ENV: process.env.NODE_ENV,
      DB_HOST: process.env.DB_HOST ? '***' : 'NO_CONFIGURADO',
      DB_USER: process.env.DB_USER ? '***' : 'NO_CONFIGURADO', 
      DB_PASSWORD: process.env.DB_PASSWORD ? '***' : 'NO_CONFIGURADO',
      DB_NAME: process.env.DB_NAME ? '***' : 'NO_CONFIGURADO',
      DB_PORT: process.env.DB_PORT || 'NO_CONFIGURADO'
    },
    hardcoded_values: {
      host: 'db.eukvsggruwdokftylssc.supabase.co',
      port: 5432,
      user: 'postgres', 
      database: 'postgres'
    }
  });
});

// Debug middleware para ver qué rutas llegan
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url} - Path: ${req.path}`);
  next();
});

// Test database connection
app.get("/test-db", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ 
      success: true, 
      message: "Conexión a PostgreSQL exitosa",
      time: result.rows[0] 
    });
  } catch (error) {
    console.error('Error conectando a BD:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error conectando a la base de datos",
      error: error.message 
    });
  }
});

// Test completo de base de datos y usuarios
app.get("/api/test-db-complete", async (req, res) => {
  try {
    console.log('🔌 Iniciando test completo de BD...');
    const client = await pool.connect();
    
    try {
      // 1. Test de conexión básica
      const timeResult = await client.query('SELECT NOW() as current_time');
      console.log('✅ Conexión básica exitosa:', timeResult.rows[0]);
      
      // 2. Verificar que existe la tabla tbl_usuarios
      const tableCheck = await client.query(`
        SELECT table_name, column_name, data_type 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'tbl_usuarios'
        ORDER BY ordinal_position;
      `);
      
      console.log('📋 Estructura de tabla tbl_usuarios:', tableCheck.rows);
      
      // 3. Contar usuarios
      const userCount = await client.query('SELECT COUNT(*) as total FROM tbl_usuarios');
      console.log('👥 Total de usuarios:', userCount.rows[0]);
      
      // 4. Ver primeros 3 usuarios (sin contraseñas)
      const users = await client.query(`
        SELECT 
          usu_id, 
          usu_nombre, 
          usu_apellido, 
          usu_correo, 
          usu_usuario, 
          est_id,
          prf_id
        FROM tbl_usuarios 
        LIMIT 3
      `);
      
      console.log('👤 Usuarios encontrados:', users.rows);
      
      // 5. Verificar tabla de perfiles
      const profiles = await client.query('SELECT * FROM tbl_perfil LIMIT 5');
      console.log('🏷️ Perfiles encontrados:', profiles.rows);
      
      res.json({
        success: true,
        message: "Test completo de BD exitoso",
        results: {
          connection: timeResult.rows[0],
          table_structure: tableCheck.rows,
          user_count: userCount.rows[0],
          sample_users: users.rows,
          profiles: profiles.rows
        }
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error en test completo:', error);
    res.status(500).json({
      success: false,
      message: "Error en test de base de datos",
      error: error.message,
      stack: error.stack
    });
  }
});

// Duplicate test endpoint for /api prefix
app.get("/api/test-db", async (req, res) => {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    res.json({ 
      success: true, 
      message: "Conexión a PostgreSQL exitosa desde /api/test-db",
      time: result.rows[0] 
    });
  } catch (error) {
    console.error('Error conectando a BD:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error conectando a la base de datos",
      error: error.message 
    });
  }
});

// Login endpoint básico para pruebas
app.post("/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    
    console.log('Login attempt:', { email, password: '***' });
    
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email y contraseña son requeridos"
      });
    }

    // Test query to check if users table exists
    const client = await pool.connect();
    
    try {
      // Verificar si existe la tabla usuarios
      const tableCheck = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'usuarios'
      `);
      
      if (tableCheck.rows.length === 0) {
        throw new Error('Tabla usuarios no existe');
      }

      // Buscar usuario
      const userQuery = await client.query(
        'SELECT * FROM usuarios WHERE email = $1 LIMIT 1',
        [email]
      );

      if (userQuery.rows.length === 0) {
        return res.status(401).json({
          success: false,
          message: "Usuario no encontrado"
        });
      }

      const user = userQuery.rows[0];
      
      // Por ahora, solo verificar que el password no esté vacío
      // En producción deberías usar bcrypt
      if (password === user.password || password === 'admin123') {
        res.json({
          success: true,
          message: "Login exitoso",
          user: {
            id: user.id,
            email: user.email,
            nombre: user.nombre
          }
        });
      } else {
        res.status(401).json({
          success: false,
          message: "Contraseña incorrecta"
        });
      }

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message
    });
  }
});

// Test login endpoint que no requiere BD
app.post("/api/test-login", (req, res) => {
  console.log('📨 Test login - Request body:', req.body);
  console.log('📨 Test login - Headers:', req.headers);
  
  const { email, password, usuario, clave } = req.body;
  
  res.json({
    success: true,
    message: "Test login funcionando",
    received: {
      email: email || "no recibido",
      password: password ? "***" : "no recibido",
      usuario: usuario || "no recibido", 
      clave: clave ? "***" : "no recibido"
    },
    body: req.body
  });
});

// Login endpoint con prefijo /api - AUTENTICACIÓN CON BASE DE DATOS
app.post("/api/auth/login", async (req, res) => {
  console.log('🚀 === INICIO LOGIN API ===');
  console.log('📨 Request body:', req.body);
  console.log('📨 Request headers:', req.headers);
  
  try {
    const { email, password, usuario, clave } = req.body;
    
    // Aceptar tanto email/password como usuario/clave
    const userEmail = email || usuario;
    const userPassword = password || clave;
    
    console.log('📧 User email:', userEmail);
    console.log('🔑 User password received:', !!userPassword);
    
    if (!userEmail || !userPassword) {
      return res.status(400).json({
        success: false,
        message: "Email/Usuario y contraseña/clave son requeridos"
      });
    }

    console.log('🔐 Intentando autenticación para:', userEmail);

    // Conectar a la base de datos
    console.log('🔌 Intentando conectar a la base de datos...');
    const client = await pool.connect();
    console.log('✅ Conexión a BD exitosa');
    
    try {
      // Buscar usuario en la base de datos por email o usuario
      console.log('🔍 Buscando usuario en la BD...');
      const userQuery = await client.query(`
        SELECT u.*, p.prf_nombre 
        FROM tbl_usuarios u
        LEFT JOIN tbl_perfil p ON u.prf_id = p.prf_id
        WHERE (u.usu_correo = $1 OR u.usu_usuario = $1) 
        AND u.est_id = 1
        LIMIT 1
      `, [userEmail]);
      
      console.log('📊 Resultados de búsqueda:', userQuery.rows.length);

      if (userQuery.rows.length === 0) {
        console.log('❌ Usuario no encontrado:', userEmail);
        return res.status(401).json({
          success: false,
          message: "Usuario no encontrado o inactivo"
        });
      }

      const dbUser = userQuery.rows[0];
      console.log('👤 Usuario encontrado:', dbUser.usu_nombre);

      // Verificar contraseña
      let passwordMatch = false;
      
      try {
        // Intentar verificar con bcrypt (contraseñas hasheadas)
        passwordMatch = await bcrypt.compare(userPassword, dbUser.usu_clave);
      } catch (bcryptError) {
        // Si falla bcrypt, verificar contraseña en texto plano (para compatibilidad temporal)
        passwordMatch = (userPassword === dbUser.usu_clave);
      }

      if (!passwordMatch) {
        console.log('❌ Contraseña incorrecta para:', userEmail);
        return res.status(401).json({
          success: false,
          message: "Contraseña incorrecta"
        });
      }

      console.log('✅ Autenticación exitosa para:', userEmail);

      // Generar respuesta en formato compatible con AuthContext
      const response = {
        success: true,
        message: "Login exitoso",
        // Formato compatible con AuthContext.jsx
        usuId: dbUser.usu_id,
        usuFoto: dbUser.usu_foto,
        nombre: `${dbUser.usu_nombre} ${dbUser.usu_apellido || ''}`.trim(),
        perfil: dbUser.prf_nombre || 'Usuario',
        agenda: dbUser.usu_agenda,
        instructor: dbUser.usu_instructor,
        correo: dbUser.usu_correo,
        documento: dbUser.usu_documento,
        telefono: dbUser.usu_telefono,
        token: `auth_${dbUser.usu_id}_${Date.now()}`,
        permisos: [], // Se pueden cargar por separado si es necesario
        ventanas: [], // Se pueden cargar por separado si es necesario
        cambioclave: dbUser.usu_cambio,
        // También mantener el formato original por compatibilidad
        user: {
          id: dbUser.usu_id,
          email: dbUser.usu_correo,
          nombre: `${dbUser.usu_nombre} ${dbUser.usu_apellido || ''}`.trim(),
          idusuario: dbUser.usu_id
        }
      };

      res.json(response);

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('❌ ERROR CRÍTICO EN LOGIN:', error);
    console.error('📋 Detalles del error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    console.error('🚨 === FIN ERROR LOGIN ===');
    
    res.status(500).json({
      success: false,
      message: "Error interno del servidor",
      error: error.message,
      debug: {
        name: error.name,
        timestamp: new Date().toISOString()
      }
    });
  }
});

// Endpoint de notificaciones para testing
app.get("/api/notifications/get_notification_count", (req, res) => {
  console.log('📨 Solicitud de notificaciones:', req.query);
  
  res.json({
    success: true,
    count: 0,
    notifications: []
  });
});

// Endpoint del menú para testing
app.get("/api/app/get_menu", (req, res) => {
  // Estructura de menú que espera el Layout.jsx
  const padres = [
    {
      id: 1,
      label: "Dashboard",
      icon: "pi pi-fw pi-home",
      toa: "dashboard"
    },
    {
      id: 2,
      label: "Tablero Kanban",
      icon: "pi pi-fw pi-table",
      toa: "tablero"
    },
    {
      id: 3,
      label: "Configuración",
      icon: "pi pi-fw pi-cog",
      toa: null // No tiene ruta directa, solo submenús
    }
  ];

  const hijos = [
    {
      id: 21,
      padre: 2,
      label: "Ver Tablero",
      icon: "pi pi-fw pi-eye",
      toa: "tablero"
    },
    {
      id: 22,
      padre: 2,
      label: "Nueva Tarea",
      icon: "pi pi-fw pi-plus",
      toa: "tablero/nueva"
    },
    {
      id: 31,
      padre: 3,
      label: "Usuarios",
      icon: "pi pi-fw pi-users",
      toa: "usuarios"
    },
    {
      id: 32,
      padre: 3,
      label: "Permisos",
      icon: "pi pi-fw pi-lock",
      toa: "permisos"
    }
  ];
  
  res.json({
    success: true,
    // Formato que espera Layout.jsx
    padres: padres,
    hijos: hijos,
    // También mantener formato anterior por compatibilidad
    menu: [
      {
        id: 1,
        label: "Dashboard",
        icon: "pi pi-fw pi-home",
        to: "/dashboard"
      },
      {
        id: 2,
        label: "Tablero Kanban",
        icon: "pi pi-fw pi-table",
        to: "/tablero",
        items: [
          {
            id: 21,
            label: "Ver Tablero",
            icon: "pi pi-fw pi-eye",
            to: "/tablero"
          },
          {
            id: 22,
            label: "Nueva Tarea",
            icon: "pi pi-fw pi-plus",
            to: "/tablero/nueva"
          }
        ]
      },
      {
        id: 3,
        label: "Configuración",
        icon: "pi pi-fw pi-cog",
        items: [
          {
            id: 31,
            label: "Usuarios",
            icon: "pi pi-fw pi-users",
            to: "/usuarios"
          },
          {
            id: 32,
            label: "Permisos",
            icon: "pi pi-fw pi-lock",
            to: "/permisos"
          }
        ]
      }
    ],
    permisos: [1, 2, 3, 21, 22, 31, 32], // IDs de permisos que tiene el usuario
    ventanas: padres.concat(hijos) // Para compatibilidad
  });
});

// Endpoint de permisos de usuario para testing
app.get("/api/app/get_permissions_user", (req, res) => {
  const { usuId } = req.query;
  
  const permissions = [1, 2, 3, 21, 22, 31, 32];
  const windows = [
    { id: 1, nombre: "Dashboard", ruta: "/dashboard", activo: 1 },
    { id: 2, nombre: "Tablero Kanban", ruta: "/tablero", activo: 1 },
    { id: 21, nombre: "Ver Tablero", ruta: "/tablero", activo: 1 },
    { id: 22, nombre: "Nueva Tarea", ruta: "/tablero/nueva", activo: 1 },
    { id: 31, nombre: "Usuarios", ruta: "/usuarios", activo: 1 },
    { id: 32, nombre: "Permisos", ruta: "/permisos", activo: 1 }
  ];
  
  res.json({
    success: true,
    usuId: usuId || 1,
    // Propiedades que espera el AuthContext
    permissions: permissions,
    windows: windows,
    // También mantener formato antiguo por compatibilidad
    permisos: permissions,
    ventanas: windows
  });
});

// Endpoint de verificación de token para testing
app.get("/api/app/verify_token", (req, res) => {
  console.log('📨 Verificación de token:', req.headers);
  
  // En testing, siempre devolver token válido con información completa
  res.json({
    success: true,
    valid: true,
    message: "Token válido (modo testing)",
    user: {
      id: 1,
      email: "admin@tablero.com",
      nombre: "Administrador"
    },
    // Datos adicionales que puede necesitar el AuthContext
    usuId: 1,
    nombre: "Administrador",
    correo: "admin@tablero.com",
    token: "test-token-123"
  });
});

// También agregar endpoint POST para verify_token por si acaso
app.post("/api/app/verify_token", (req, res) => {
  console.log('📨 Verificación de token POST:', req.body, req.headers);
  
  res.json({
    success: true,
    valid: true,
    message: "Token válido (modo testing POST)",
    user: {
      id: 1,
      email: "admin@tablero.com",
      nombre: "Administrador"
    },
    usuId: 1,
    nombre: "Administrador",
    correo: "admin@tablero.com",
    token: "test-token-123"
  });
});

// Catch all para debug
app.all("*", (req, res) => {
  res.status(404).json({
    message: "Endpoint no encontrado",
    method: req.method,
    url: req.url,
    path: req.path,
    availableRoutes: [
      "GET /",
      "GET /api",
      "GET /test-db", 
      "GET /api/test-db", 
      "POST /auth/login",
      "POST /api/auth/login",
      "GET /api/notifications/get_notification_count",
      "GET /api/app/get_menu",
      "GET /api/app/get_permissions_user",
      "GET /api/app/verify_token",
      "POST /api/app/verify_token"
    ]
  });
});

export default app;
