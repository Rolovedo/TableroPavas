// Script para verificar la conexión a la base de datos y los usuarios existentes
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

async function testDatabaseAndUsers() {
    try {
        console.log('🔍 Conectando a la base de datos...');
        const client = await pool.connect();
        
        console.log('✅ Conexión exitosa!');
        
        // Verificar si existe la tabla tbl_usuarios
        console.log('\n📋 Verificando estructura de tablas...');
        const tableCheck = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name IN ('tbl_usuarios', 'tbl_perfil')
            ORDER BY table_name
        `);
        
        console.log('Tablas encontradas:', tableCheck.rows.map(row => row.table_name));
        
        // Verificar usuarios existentes
        console.log('\n👥 Usuarios en la base de datos:');
        const usersQuery = await client.query(`
            SELECT u.usu_id, u.usu_nombre, u.usu_apellido, u.usu_correo, u.usu_usuario, 
                   u.est_id, u.prf_id, p.prf_nombre
            FROM tbl_usuarios u
            LEFT JOIN tbl_perfil p ON u.prf_id = p.prf_id
            ORDER BY u.usu_id
        `);
        
        if (usersQuery.rows.length === 0) {
            console.log('❌ No se encontraron usuarios en la base de datos');
        } else {
            usersQuery.rows.forEach(user => {
                console.log(`ID: ${user.usu_id} | ${user.usu_nombre} ${user.usu_apellido || ''} | Email: ${user.usu_correo} | Usuario: ${user.usu_usuario} | Perfil: ${user.prf_nombre} | Estado: ${user.est_id === 1 ? 'Activo' : 'Inactivo'}`);
            });
        }
        
        // Verificar perfiles
        console.log('\n📊 Perfiles disponibles:');
        const profilesQuery = await client.query(`
            SELECT prf_id, prf_nombre, prf_descripcion, est_id
            FROM tbl_perfil
            ORDER BY prf_id
        `);
        
        profilesQuery.rows.forEach(profile => {
            console.log(`ID: ${profile.prf_id} | ${profile.prf_nombre} | ${profile.prf_descripcion} | Estado: ${profile.est_id === 1 ? 'Activo' : 'Inactivo'}`);
        });
        
        client.release();
        console.log('\n✅ Verificación completada');
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    } finally {
        await pool.end();
    }
}

testDatabaseAndUsers();
