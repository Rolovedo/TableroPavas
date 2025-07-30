// Script para crear las tablas en la base de datos de Supabase
import dotenv from "dotenv";
import pkg from 'pg';

const { Pool } = pkg;
dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || 'db.eukvsggruwdokftylssc.supabase.co',
    port: process.env.DB_PORT || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '98631063ace',
    database: process.env.DB_NAME || 'postgres',
    ssl: {
        rejectUnauthorized: false
    }
});

async function createTables() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Conectando a la base de datos Supabase...');
        
        // Verificar conexión
        const testQuery = await client.query('SELECT NOW()');
        console.log('✅ Conexión exitosa:', testQuery.rows[0].now);
        
        console.log('\n📋 Creando tablas necesarias...');
        
        // 1. Crear tabla de estados si no existe
        console.log('1️⃣ Creando tabla tbl_estados...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS tbl_estados (
                est_id SERIAL PRIMARY KEY,
                est_nombre VARCHAR(50) NOT NULL,
                est_descripcion VARCHAR(255),
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        
        // Insertar estados básicos
        await client.query(`
            INSERT INTO tbl_estados (est_id, est_nombre, est_descripcion) 
            VALUES (1, 'Activo', 'Estado activo') 
            ON CONFLICT (est_id) DO NOTHING;
        `);
        
        // 2. Crear tabla de perfiles
        console.log('2️⃣ Creando tabla tbl_perfil...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS tbl_perfil (
                prf_id SERIAL PRIMARY KEY,
                prf_nombre VARCHAR(50) NOT NULL,
                prf_descripcion VARCHAR(255),
                est_id INTEGER DEFAULT 1,
                FOREIGN KEY (est_id) REFERENCES tbl_estados(est_id)
            );
        `);
        
        // Insertar perfiles básicos
        await client.query(`
            INSERT INTO tbl_perfil (prf_id, prf_nombre, prf_descripcion, est_id) VALUES 
            (1, 'Administrador', 'Acceso completo al sistema', 1),
            (2, 'Supervisor', 'Supervisor de desarrolladores', 1),
            (3, 'Desarrollador Senior', 'Desarrollador con experiencia avanzada', 1),
            (4, 'Desarrollador', 'Desarrollador regular', 1),
            (5, 'Desarrollador Junior', 'Desarrollador en formación', 1)
            ON CONFLICT (prf_id) DO NOTHING;
        `);
        
        // 3. Crear tabla de usuarios
        console.log('3️⃣ Creando tabla tbl_usuarios...');
        await client.query(`
            CREATE TABLE IF NOT EXISTS tbl_usuarios (
                usu_id SERIAL PRIMARY KEY,
                usu_foto VARCHAR(255),
                usu_nombre VARCHAR(100) NOT NULL,
                usu_apellido VARCHAR(100),
                usu_correo VARCHAR(150) NOT NULL UNIQUE,
                usu_usuario VARCHAR(50),
                usu_clave VARCHAR(255) NOT NULL,
                usu_telefono VARCHAR(20),
                usu_documento VARCHAR(20),
                est_id INTEGER DEFAULT 1,
                prf_id INTEGER NOT NULL,
                usu_agenda BOOLEAN DEFAULT FALSE,
                usu_instructor BOOLEAN DEFAULT FALSE,
                usu_cambio BOOLEAN DEFAULT FALSE,
                fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (est_id) REFERENCES tbl_estados(est_id),
                FOREIGN KEY (prf_id) REFERENCES tbl_perfil(prf_id)
            );
        `);
        
        // Crear función para actualizar timestamp
        await client.query(`
            CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS $$
            BEGIN
                NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
                RETURN NEW;
            END;
            $$ language 'plpgsql';
        `);
        
        // Crear trigger para auto-actualizar fecha_actualizacion
        await client.query(`
            DROP TRIGGER IF EXISTS update_tbl_usuarios_updated_at ON tbl_usuarios;
            CREATE TRIGGER update_tbl_usuarios_updated_at
                BEFORE UPDATE ON tbl_usuarios
                FOR EACH ROW
                EXECUTE FUNCTION update_updated_at_column();
        `);
        
        // 4. Insertar usuario administrador por defecto
        console.log('4️⃣ Creando usuario administrador por defecto...');
        
        // Importar bcrypt para hashear la contraseña
        const bcrypt = await import('bcrypt');
        const hashedPassword = await bcrypt.hash('admin123', 10);
        
        await client.query(`
            INSERT INTO tbl_usuarios (
                usu_nombre, usu_apellido, usu_correo, usu_usuario, 
                usu_clave, usu_telefono, est_id, prf_id, usu_agenda, 
                usu_instructor, usu_cambio
            ) VALUES (
                'Administrador', 'Sistema', 'admin@tablero.com', 'admin',
                $1, '1234567890', 1, 1, false, false, false
            ) ON CONFLICT (usu_correo) DO UPDATE SET
                usu_clave = $1,
                fecha_actualizacion = CURRENT_TIMESTAMP;
        `, [hashedPassword]);
        
        // 5. Crear algunos usuarios de prueba adicionales
        console.log('5️⃣ Creando usuarios de prueba...');
        
        const testPassword = await bcrypt.hash('test123', 10);
        
        await client.query(`
            INSERT INTO tbl_usuarios (
                usu_nombre, usu_apellido, usu_correo, usu_usuario, 
                usu_clave, usu_telefono, est_id, prf_id
            ) VALUES 
            ('Juan', 'Pérez', 'juan.perez@empresa.com', 'jperez', $1, '0987654321', 1, 4),
            ('María', 'García', 'maria.garcia@empresa.com', 'mgarcia', $1, '1122334455', 1, 3),
            ('Carlos', 'López', 'carlos.lopez@empresa.com', 'clopez', $1, '2233445566', 1, 4),
            ('Ana', 'Rodríguez', 'ana.rodriguez@empresa.com', 'arodriguez', $1, '3344556677', 1, 5)
            ON CONFLICT (usu_correo) DO NOTHING;
        `, [testPassword]);
        
        console.log('\n✅ Tablas creadas exitosamente!');
        
        // Verificar que todo se creó correctamente
        console.log('\n📊 Verificando usuarios creados:');
        const users = await client.query(`
            SELECT u.usu_id, u.usu_nombre, u.usu_apellido, u.usu_correo, 
                   u.usu_usuario, p.prf_nombre, u.est_id
            FROM tbl_usuarios u
            LEFT JOIN tbl_perfil p ON u.prf_id = p.prf_id
            ORDER BY u.usu_id
        `);
        
        users.rows.forEach(user => {
            console.log(`🧑 ID: ${user.usu_id} | ${user.usu_nombre} ${user.usu_apellido || ''} | Email: ${user.usu_correo} | Usuario: ${user.usu_usuario} | Perfil: ${user.prf_nombre}`);
        });
        
        console.log('\n🎉 Base de datos configurada correctamente!');
        console.log('\n🔐 Credenciales de acceso:');
        console.log('Email: admin@tablero.com');
        console.log('Contraseña: admin123');
        
    } catch (error) {
        console.error('❌ Error creando tablas:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar el script
createTables()
    .then(() => {
        console.log('\n✅ Script completado exitosamente');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error ejecutando script:', error);
        process.exit(1);
    });
