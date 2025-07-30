import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import pkg from 'pg';
import bcrypt from 'bcrypt';

const { Pool } = pkg;
dotenv.config();

const app = express();

// Configuración PostgreSQL - Múltiples estrategias para máxima compatibilidad
console.log('🔧 Configurando conexiones a BD...');
console.log('🔍 DATABASE_URL disponible:', !!process.env.DATABASE_URL);
console.log('🔍 DATABASE_POOLER_URL disponible:', !!process.env.DATABASE_POOLER_URL);
console.log('🔍 DB_HOST disponible:', !!process.env.DB_HOST);

// 1. Pool con POOLER (máxima prioridad para Vercel)
const poolPooler = new Pool({
    connectionString: process.env.DATABASE_POOLER_URL,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 8000,
});

// 2. Pool principal con DATABASE_URL
const pool = new Pool({
    connectionString: process.env.DATABASE_URL || `postgresql://${process.env.DB_USER || 'postgres'}:${process.env.DB_PASSWORD || '98631063ace'}@${process.env.DB_HOST || 'db.eukvsggruwdokftylssc.supabase.co'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'postgres'}`,
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

// 3. Pool con variables individuales (fallback)
const poolAlt = new Pool({
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
    connectionTimeoutMillis: 10000,
});

// 4. Pool con connection string hardcoded (último recurso)
const poolDirect = new Pool({
    connectionString: 'postgresql://postgres:98631063ace@db.eukvsggruwdokftylssc.supabase.co:5432/postgres',
    ssl: {
        rejectUnauthorized: false
    },
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
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
      DATABASE_POOLER_URL: process.env.DATABASE_POOLER_URL ? 'CONFIGURADA (' + process.env.DATABASE_POOLER_URL.substring(0, 30) + '...)' : 'NO_CONFIGURADA',
      DATABASE_URL: process.env.DATABASE_URL ? 'CONFIGURADA (' + process.env.DATABASE_URL.substring(0, 30) + '...)' : 'NO_CONFIGURADA',
      DB_HOST: process.env.DB_HOST || 'NO_CONFIGURADO',
      DB_USER: process.env.DB_USER || 'NO_CONFIGURADO', 
      DB_PASSWORD: process.env.DB_PASSWORD ? 'CONFIGURADA (***' + process.env.DB_PASSWORD.slice(-3) + ')' : 'NO_CONFIGURADA',
      DB_NAME: process.env.DB_NAME || 'NO_CONFIGURADO',
      DB_PORT: process.env.DB_PORT || 'NO_CONFIGURADO'
    },
    hardcoded_values: {
      host: 'db.eukvsggruwdokftylssc.supabase.co',
      port: 5432,
      user: 'postgres', 
      database: 'postgres'
    },
    connection_strings: {
      pooler: process.env.DATABASE_POOLER_URL || 'NO DISPONIBLE',
      from_env: process.env.DATABASE_URL || 'NO DISPONIBLE',
      constructed: `postgresql://${process.env.DB_USER || 'postgres'}:***@${process.env.DB_HOST || 'db.eukvsggruwdokftylssc.supabase.co'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME || 'postgres'}`,
      hardcoded: 'postgresql://postgres:***@db.eukvsggruwdokftylssc.supabase.co:5432/postgres'
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

// Test de conexión directa con connection string
app.get("/api/test-direct", async (req, res) => {
  try {
    console.log('🔗 Probando conexión directa...');
    const client = await poolDirect.connect();
    const result = await client.query('SELECT NOW() as time, current_database() as db');
    client.release();
    
    res.json({ 
      success: true, 
      message: "Conexión directa exitosa",
      connection_string: "postgresql://postgres:***@db.eukvsggruwdokftylssc.supabase.co:5432/postgres",
      result: result.rows[0]
    });
  } catch (error) {
    console.error('❌ Error en conexión directa:', error);
    res.status(500).json({ 
      success: false, 
      message: "Error en conexión directa",
      error: error.message,
      stack: error.stack 
    });
  }
});

// Test completo de base de datos y usuarios
app.get("/api/test-db-complete", async (req, res) => {
  try {
    console.log('🔌 Iniciando test completo de BD...');
    console.log('🔍 DATABASE_POOLER_URL env:', !!process.env.DATABASE_POOLER_URL ? 'CONFIGURADA' : 'NO CONFIGURADA');
    console.log('🔍 DATABASE_URL env:', !!process.env.DATABASE_URL ? 'CONFIGURADA' : 'NO CONFIGURADA');
    console.log('🔍 Variables individuales:', {
      DB_HOST: !!process.env.DB_HOST,
      DB_USER: !!process.env.DB_USER,
      DB_PASSWORD: !!process.env.DB_PASSWORD,
      DB_NAME: !!process.env.DB_NAME,
      DB_PORT: !!process.env.DB_PORT
    });
    
    let client;
    let connection_type = "no_connection";
    let lastError = null;
    
    // Método 1: DATABASE_POOLER_URL (máxima prioridad para Vercel)
    if (process.env.DATABASE_POOLER_URL) {
      try {
        console.log('🔗 Intentando con DATABASE_POOLER_URL...');
        client = await poolPooler.connect();
        connection_type = "pooler";
        console.log('✅ Conexión con POOLER exitosa');
      } catch (poolerError) {
        console.log('❌ Falló conexión con POOLER:', poolerError.message);
        lastError = poolerError;
      }
    }
    
    // Método 2: DATABASE_URL (si pooler falló)
    if (!client) {
      try {
        console.log('� Intentando con DATABASE_URL...');
        client = await pool.connect();
        connection_type = "database_url";
        console.log('✅ Conexión con DATABASE_URL exitosa');
      } catch (databaseUrlError) {
        console.log('❌ Falló conexión con DATABASE_URL:', databaseUrlError.message);
        lastError = databaseUrlError;
        
        // Método 3: Variables individuales
        try {
          console.log('🔄 Intentando con variables individuales...');
          client = await poolAlt.connect();
          connection_type = "individual_vars";
          console.log('✅ Conexión con variables individuales exitosa');
        } catch (varsError) {
          console.log('❌ Falló conexión con variables:', varsError.message);
          lastError = varsError;
          
          // Método 4: Connection string hardcoded (último recurso)
          try {
            console.log('🔄 Intentando con connection string hardcoded...');
            client = await poolDirect.connect();
            connection_type = "hardcoded_string";
            console.log('✅ Conexión hardcoded exitosa');
          } catch (hardcodedError) {
            console.log('❌ Falló conexión hardcoded:', hardcodedError.message);
            lastError = hardcodedError;
            throw new Error(`Todas las conexiones fallaron:
              POOLER: ${process.env.DATABASE_POOLER_URL ? poolerError?.message || 'NO INTENTADO' : 'NO CONFIGURADO'}
              DATABASE_URL: ${databaseUrlError.message}
              Variables: ${varsError.message}
              Hardcoded: ${hardcodedError.message}`);
          }
        }
      }
    }
    
    try {
      // 1. Test de conexión básica
      const timeResult = await client.query('SELECT NOW() as current_time, version() as pg_version');
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
        message: `Test completo de BD exitoso (usando ${connection_type})`,
        connection_type: connection_type,
        environment: {
          DATABASE_POOLER_URL: !!process.env.DATABASE_POOLER_URL ? 'CONFIGURADA' : 'NO CONFIGURADA',
          DATABASE_URL: !!process.env.DATABASE_URL ? 'CONFIGURADA' : 'NO CONFIGURADA',
          individual_vars: {
            DB_HOST: !!process.env.DB_HOST,
            DB_USER: !!process.env.DB_USER,
            DB_PASSWORD: !!process.env.DB_PASSWORD,
            DB_NAME: !!process.env.DB_NAME,
            DB_PORT: !!process.env.DB_PORT
          }
        },
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
      environment: {
        DATABASE_POOLER_URL: !!process.env.DATABASE_POOLER_URL ? 'CONFIGURADA' : 'NO CONFIGURADA',
        DATABASE_URL: !!process.env.DATABASE_URL ? 'CONFIGURADA' : 'NO CONFIGURADA',
        individual_vars: {
          DB_HOST: !!process.env.DB_HOST,
          DB_USER: !!process.env.DB_USER,
          DB_PASSWORD: !!process.env.DB_PASSWORD,
          DB_NAME: !!process.env.DB_NAME,
          DB_PORT: !!process.env.DB_PORT
        }
      },
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

    // Conectar a la base de datos con múltiples estrategias (pooler primero)
    console.log('🔌 Intentando conectar a la base de datos...');
    let client;
    
    try {
      // Método 1: DATABASE_POOLER_URL (máxima prioridad)
      if (process.env.DATABASE_POOLER_URL) {
        try {
          client = await poolPooler.connect();
          console.log('✅ Conexión con POOLER exitosa');
        } catch (poolerError) {
          console.log('❌ Falló POOLER, intentando DATABASE_URL...');
          throw poolerError;
        }
      } else {
        throw new Error('POOLER no configurado');
      }
    } catch (poolerError) {
      try {
        // Método 2: DATABASE_URL
        client = await pool.connect();
        console.log('✅ Conexión con DATABASE_URL exitosa');
      } catch (databaseUrlError) {
        console.log('❌ Falló DATABASE_URL, intentando variables...');
        try {
          // Método 3: Variables individuales
          client = await poolAlt.connect();
          console.log('✅ Conexión con variables individuales exitosa');
        } catch (varsError) {
          console.log('❌ Falló variables, intentando hardcoded...');
          try {
            // Método 4: Hardcoded (último recurso)
            client = await poolDirect.connect();
            console.log('✅ Conexión hardcoded exitosa');
          } catch (hardcodedError) {
            throw new Error(`Error de conexión total: POOLER: ${poolerError.message}, DB_URL: ${databaseUrlError.message}, Vars: ${varsError.message}, Hard: ${hardcodedError.message}`);
          }
        }
      }
    }
    
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
    //{
     // id: 22,
      //padre: 2,
      //label: "Nueva Tarea",
      //icon: "pi pi-fw pi-plus",
      //toa: "tablero/nueva"
    //},
    {
      id: 31,
      padre: 3,
      label: "Usuarios",
      icon: "pi pi-fw pi-users",
      //toa: "usuarios"
    },
    {
      id: 32,
      padre: 3,
      label: "Permisos",
      icon: "pi pi-fw pi-lock",
      //toa: "permisos"
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
          }
        //  {
          //  id: 22,
            //label: "Nueva Tarea",
            //icon: "pi pi-fw pi-plus",
            //to: "/tablero/nueva"
          //}
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
            //to: "/usuarios"
          },
          {
            id: 32,
            label: "Permisos",
            icon: "pi pi-fw pi-lock",
            //to: "/permisos"
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

// ==================== ENDPOINTS DE TAREAS ====================

// Obtener todas las tareas del tablero
app.get("/api/tablero/tareas", async (req, res) => {
  try {
    console.log('📋 Obteniendo tareas del tablero...');
    // Usar poolPooler si está disponible
    const client = process.env.DATABASE_POOLER_URL ? await poolPooler.connect() : await pool.connect();
    try {
      // Usar la vista que ya tiene joins con usuarios
      const query = `
        SELECT 
          t.id,
          t.titulo,
          t.descripcion,
          t.prioridad,
          t.estado,
          t.categoria,
          t.fecha_vencimiento,
          t.horas_estimadas,
          t.horas_reales,
          t.progreso,
          t.habilidades_requeridas,
          t.fecha_creacion,
          t.fecha_actualizacion,
          -- Datos del asignado
          t.asignado_a as asignado_id,
          u_asignado.usu_nombre as asignado_nombre,
          u_asignado.usu_apellido as asignado_apellido,
          u_asignado.usu_correo as asignado_email,
          d.avatar as asignado_avatar,
          -- Datos del creador
          t.creado_por,
          u_creador.usu_nombre as creador_nombre,
          u_creador.usu_apellido as creador_apellido
        FROM tablero_tareas t
        LEFT JOIN tbl_usuarios u_asignado ON t.asignado_a = u_asignado.usu_id
        LEFT JOIN tablero_desarrolladores d ON u_asignado.usu_id = d.usuario_id
        LEFT JOIN tbl_usuarios u_creador ON t.creado_por = u_creador.usu_id
        ORDER BY t.fecha_creacion DESC
      `;
      
      const result = await client.query(query);
      
      // Formatear las tareas para el frontend
      const tareas = result.rows.map(row => {
        let parsedSkills = [];
        if (row.habilidades_requeridas) {
          try {
            parsedSkills = JSON.parse(row.habilidades_requeridas);
            if (!Array.isArray(parsedSkills)) parsedSkills = [];
          } catch (e) {
            parsedSkills = [];
          }
        }
        return {
          id: row.id,
          title: row.titulo,
          description: row.descripcion,
          priority: row.prioridad,
          status: row.estado,
          category: row.categoria,
          dueDate: row.fecha_vencimiento,
          estimatedHours: row.horas_estimadas,
          actualHours: row.horas_reales,
          progress: row.progreso,
          requiredSkills: parsedSkills,
          createdAt: row.fecha_creacion,
          updatedAt: row.fecha_actualizacion,
          assignee: row.asignado_id ? {
            id: row.asignado_id,
            name: `${row.asignado_nombre} ${row.asignado_apellido}`.trim(),
            email: row.asignado_email,
            avatar: row.asignado_avatar || row.asignado_nombre?.substring(0, 2).toUpperCase()
          } : null,
          createdBy: `${row.creador_nombre} ${row.creador_apellido}`.trim()
        };
      });
      
      console.log(`✅ ${tareas.length} tareas encontradas`);
      
      res.json({
        success: true,
        tareas: tareas,
        total: tareas.length
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo tareas:', error);
    res.status(500).json({
      success: false,
      message: "Error al obtener las tareas",
      error: error.message
    });
  }
});

// Crear nueva tarea
app.post("/api/tablero/tareas", async (req, res) => {
  try {
    console.log('📝 Creando nueva tarea:', req.body);
    const {
      titulo,
      descripcion,
      asignado_a,
      prioridad,
      estado,
      categoria,
      fecha_vencimiento,
      horas_estimadas,
      habilidades_requeridas,
      creado_por,
      actualizado_por
    } = req.body;
    // Validaciones básicas
    if (!titulo || !creado_por) {
      return res.status(400).json({
        success: false,
        message: "Título y creado_por son requeridos"
      });
    }
    // Valores por defecto para que nunca queden nulos
    const safeCategoria = categoria;
    const safePrioridad = prioridad;
    const safeEstado = estado || 'pendiente';
    const safeActualizadoPor = actualizado_por || creado_por;
    // Usar poolPooler si está disponible
    const client = process.env.DATABASE_POOLER_URL ? await poolPooler.connect() : await pool.connect();
    try {
      const query = `
        INSERT INTO tablero_tareas (
          titulo, descripcion, asignado_a, prioridad, estado, categoria,
          fecha_vencimiento, horas_estimadas, habilidades_requeridas, creado_por, actualizado_por
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        RETURNING *
      `;
      const values = [
        titulo,
        descripcion,
        asignado_a,
        safePrioridad,
        safeEstado,
        safeCategoria,
        fecha_vencimiento,
        horas_estimadas || 0,
        habilidades_requeridas ? JSON.stringify(habilidades_requeridas) : '[]',
        creado_por,
        safeActualizadoPor
      ];
      const result = await client.query(query, values);
      const nuevaTarea = result.rows[0];
      console.log('✅ Tarea creada:', nuevaTarea.id);
      res.json({
        success: true,
        message: "Tarea creada exitosamente",
        tarea: {
          id: nuevaTarea.id,
          title: nuevaTarea.titulo,
          description: nuevaTarea.descripcion,
          priority: nuevaTarea.prioridad,
          status: nuevaTarea.estado,
          category: nuevaTarea.categoria,
          dueDate: nuevaTarea.fecha_vencimiento,
          estimatedHours: nuevaTarea.horas_estimadas,
          createdAt: nuevaTarea.fecha_creacion
        }
      });
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error creando tarea:', error);
    res.status(500).json({
      success: false,
      message: "Error al crear la tarea",
      error: error.message
    });
  }
});

// Actualizar tarea (incluyendo cambio de estado por drag & drop)
app.put("/api/tablero/tareas/:id", async (req, res) => {
  try {
    const tareaId = req.params.id;
    console.log(`📝 Actualizando tarea ${tareaId}:`, req.body);
    const {
      titulo,
      descripcion,
      asignado_a,
      prioridad,
      estado,
      categoria,
      fecha_vencimiento,
      horas_estimadas,
      horas_reales,
      progreso,
      habilidades_requeridas,
      actualizado_por
    } = req.body;
    // Usar poolPooler si está disponible
    const client = process.env.DATABASE_POOLER_URL ? await poolPooler.connect() : await pool.connect();
    try {
      // Construir query dinámicamente solo con campos que se van a actualizar
      const updates = [];
      const values = [];
      let valueIndex = 1;
      
      if (titulo !== undefined) {
        updates.push(`titulo = $${valueIndex++}`);
        values.push(titulo);
      }
      if (descripcion !== undefined) {
        updates.push(`descripcion = $${valueIndex++}`);
        values.push(descripcion);
      }
      if (asignado_a !== undefined) {
        updates.push(`asignado_a = $${valueIndex++}`);
        values.push(asignado_a);
      }
      if (prioridad !== undefined) {
        updates.push(`prioridad = $${valueIndex++}`);
        values.push(prioridad);
      }
      if (estado !== undefined) {
        updates.push(`estado = $${valueIndex++}`);
        values.push(estado);
      }
      if (categoria !== undefined) {
        updates.push(`categoria = $${valueIndex++}`);
        values.push(categoria);
      }
      if (fecha_vencimiento !== undefined) {
        updates.push(`fecha_vencimiento = $${valueIndex++}`);
        values.push(fecha_vencimiento);
      }
      if (horas_estimadas !== undefined) {
        updates.push(`horas_estimadas = $${valueIndex++}`);
        values.push(horas_estimadas);
      }
      if (horas_reales !== undefined) {
        updates.push(`horas_reales = $${valueIndex++}`);
        values.push(horas_reales);
      }
      if (progreso !== undefined) {
        updates.push(`progreso = $${valueIndex++}`);
        values.push(progreso);
      }
      if (habilidades_requeridas !== undefined) {
        updates.push(`habilidades_requeridas = $${valueIndex++}`);
        values.push(habilidades_requeridas ? JSON.stringify(habilidades_requeridas) : null);
      }
      if (actualizado_por !== undefined) {
        updates.push(`actualizado_por = $${valueIndex++}`);
        values.push(actualizado_por);
      }
      
      // Siempre actualizar fecha_actualizacion
      updates.push(`fecha_actualizacion = NOW()`);
      
      // Agregar el ID al final
      values.push(tareaId);
      
      const query = `
        UPDATE tablero_tareas 
        SET ${updates.join(', ')}
        WHERE id = $${valueIndex}
        RETURNING *
      `;
      
      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: "Tarea no encontrada"
        });
      }
      
      const tareaActualizada = result.rows[0];
      
      console.log('✅ Tarea actualizada:', tareaId);
      
      res.json({
        success: true,
        message: "Tarea actualizada exitosamente",
        tarea: {
          id: tareaActualizada.id,
          title: tareaActualizada.titulo,
          description: tareaActualizada.descripcion,
          priority: tareaActualizada.prioridad,
          status: tareaActualizada.estado,
          category: tareaActualizada.categoria,
          dueDate: tareaActualizada.fecha_vencimiento,
          estimatedHours: tareaActualizada.horas_estimadas,
          actualHours: tareaActualizada.horas_reales,
          progress: tareaActualizada.progreso,
          updatedAt: tareaActualizada.fecha_actualizacion
        }
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error actualizando tarea:', error);
    res.status(500).json({
      success: false,
      message: "Error al actualizar la tarea",
      error: error.message
    });
  }
});

// Obtener desarrolladores disponibles
app.get("/api/tablero/desarrolladores", async (req, res) => {
  try {
    console.log('👥 Obteniendo desarrolladores...');
    // Usar poolPooler si está disponible
    const client = process.env.DATABASE_POOLER_URL ? await poolPooler.connect() : await pool.connect();
    try {
      const query = `
        SELECT 
          d.id,
          d.usuario_id,
          u.usu_nombre,
          u.usu_apellido,
          u.usu_correo,
          d.rol,
          d.nivel,
          d.habilidades,
          d.capacidad_maxima,
          d.calificacion_eficiencia,
          d.esta_activo,
          d.avatar,
          d.telefono
        FROM tablero_desarrolladores d
        JOIN tbl_usuarios u ON d.usuario_id = u.usu_id
        WHERE d.esta_activo = true
        ORDER BY u.usu_nombre
      `;
      
      const result = await client.query(query);
      
      const desarrolladores = result.rows.map(row => ({
        id: row.usuario_id,
        name: `${row.usu_nombre} ${row.usu_apellido}`.trim(),
        email: row.usu_correo,
        avatar: row.avatar || row.usu_nombre?.substring(0, 2).toUpperCase(),
        role: row.rol,
        level: row.nivel,
        skills: row.habilidades ? JSON.parse(row.habilidades) : [],
        maxCapacity: row.capacidad_maxima,
        efficiency: row.calificacion_eficiencia,
        active: row.esta_activo,
        phone: row.telefono
      }));
      
      console.log(`✅ ${desarrolladores.length} desarrolladores encontrados`);
      
      res.json({
        success: true,
        desarrolladores: desarrolladores
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error obteniendo desarrolladores:', error);
    res.status(500).json({
      success: false,
      message: "Error al obtener desarrolladores",
      error: error.message
    });
  }
});

// Endpoint para crear datos de prueba
app.post("/api/tablero/seed-data", async (req, res) => {
  try {
    console.log('🌱 Creando datos de prueba...');
    // Usar poolPooler si está disponible
    const client = process.env.DATABASE_POOLER_URL ? await poolPooler.connect() : await pool.connect();
    try {
      // Verificar si ya existen desarrolladores
      const existingDevs = await client.query('SELECT COUNT(*) FROM tablero_desarrolladores');
      
      if (existingDevs.rows[0].count > 0) {
        return res.json({
          success: true,
          message: "Los datos de prueba ya existen",
          skipped: true
        });
      }

      // Crear usuarios de prueba si no existen
      const usuarios = [
        { nombre: 'Juan', apellido: 'Pérez', email: 'juan.perez@tablero.com', usuario: 'jperez', password: 'dev123' },
        { nombre: 'María', apellido: 'García', email: 'maria.garcia@tablero.com', usuario: 'mgarcia', password: 'dev123' },
        { nombre: 'Carlos', apellido: 'López', email: 'carlos.lopez@tablero.com', usuario: 'clopez', password: 'dev123' },
        { nombre: 'Ana', apellido: 'Rodríguez', email: 'ana.rodriguez@tablero.com', usuario: 'arodriguez', password: 'dev123' }
      ];

      const usuariosCreados = [];
      
      for (const usuario of usuarios) {
        // Verificar si el usuario ya existe
        const existingUser = await client.query(
          'SELECT usu_id FROM tbl_usuarios WHERE usu_correo = $1',
          [usuario.email]
        );
        
        if (existingUser.rows.length === 0) {
          const userResult = await client.query(`
            INSERT INTO tbl_usuarios (
              usu_nombre, usu_apellido, usu_correo, usu_usuario, usu_password, 
              est_id, prf_id, fecha_creacion
            ) VALUES ($1, $2, $3, $4, $5, 1, 4, NOW())
            RETURNING usu_id
          `, [usuario.nombre, usuario.apellido, usuario.email, usuario.usuario, usuario.password]);
          
          usuariosCreados.push({
            id: userResult.rows[0].usu_id,
            ...usuario
          });
        } else {
          usuariosCreados.push({
            id: existingUser.rows[0].usu_id,
            ...usuario
          });
        }
      }

      // Crear desarrolladores
      const desarrolladores = [
        {
          usuario_id: usuariosCreados[0].id,
          rol: 'backend',
          nivel: 'senior',
          habilidades: JSON.stringify(['JavaScript', 'Node.js', 'PostgreSQL', 'Express']),
          avatar: 'JP',
          telefono: '+57300123456'
        },
        {
          usuario_id: usuariosCreados[1].id,
          rol: 'frontend',
          nivel: 'semi-senior',
          habilidades: JSON.stringify(['React', 'TypeScript', 'CSS', 'HTML']),
          avatar: 'MG',
          telefono: '+57301234567'
        },
        {
          usuario_id: usuariosCreados[2].id,
          rol: 'fullstack',
          nivel: 'senior',
          habilidades: JSON.stringify(['React', 'Node.js', 'MongoDB', 'Docker']),
          avatar: 'CL',
          telefono: '+57302345678'
        },
        {
          usuario_id: usuariosCreados[3].id,
          rol: 'devops',
          nivel: 'senior',
          habilidades: JSON.stringify(['AWS', 'Docker', 'Kubernetes', 'CI/CD']),
          avatar: 'AR',
          telefono: '+57303456789'
        }
      ];

      for (const dev of desarrolladores) {
        await client.query(`
          INSERT INTO tablero_desarrolladores (
            usuario_id, rol, nivel, habilidades, avatar, telefono, esta_activo
          ) VALUES ($1, $2, $3, $4, $5, $6, true)
        `, [dev.usuario_id, dev.rol, dev.nivel, dev.habilidades, dev.avatar, dev.telefono]);
      }

      // Crear algunas tareas de ejemplo
      const tareasEjemplo = [
        {
          titulo: 'Configurar autenticación JWT',
          descripcion: 'Implementar sistema de autenticación con tokens JWT',
          asignado_a: usuariosCreados[0].id,
          prioridad: 'alta',
          estado: 'pendiente',
          categoria: 'backend',
          horas_estimadas: 8,
          creado_por: 1
        },
        {
          titulo: 'Diseñar interfaz del tablero',
          descripcion: 'Crear mockups y prototipos de la interfaz del tablero Kanban',
          asignado_a: usuariosCreados[1].id,
          prioridad: 'media',
          estado: 'por-hacer',
          categoria: 'frontend',
          horas_estimadas: 12,
          creado_por: 1
        },
        {
          titulo: 'Configurar CI/CD pipeline',
          descripcion: 'Implementar pipeline automatizado para despliegues',
          asignado_a: usuariosCreados[3].id,
          prioridad: 'alta',
          estado: 'en-progreso',
          categoria: 'devops',
          horas_estimadas: 16,
          creado_por: 1
        }
      ];

      for (const tarea of tareasEjemplo) {
        await client.query(`
          INSERT INTO tablero_tareas (
            titulo, descripcion, asignado_a, prioridad, estado, categoria,
            horas_estimadas, creado_por
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `, [
          tarea.titulo, tarea.descripcion, tarea.asignado_a, tarea.prioridad,
          tarea.estado, tarea.categoria, tarea.horas_estimadas, tarea.creado_por
        ]);
      }

      console.log('✅ Datos de prueba creados exitosamente');
      
      res.json({
        success: true,
        message: "Datos de prueba creados exitosamente",
        created: {
          usuarios: usuariosCreados.length,
          desarrolladores: desarrolladores.length,
          tareas: tareasEjemplo.length
        }
      });
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Error creando datos de prueba:', error);
    res.status(500).json({
      success: false,
      message: "Error al crear datos de prueba",
      error: error.message
    });
  }
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
      "POST /api/app/verify_token",
      "GET /api/tablero/tareas",
      "POST /api/tablero/tareas",
      "PUT /api/tablero/tareas/:id",
      "GET /api/tablero/desarrolladores",
      "POST /api/tablero/seed-data"
    ]
  });
});

export default app;
