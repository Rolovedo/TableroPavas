// Script para probar las contraseñas de la base de datos
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

async function testPasswords() {
    const client = await pool.connect();
    
    try {
        console.log('🔐 Probando contraseñas de usuarios...');
        
        const bcrypt = await import('bcrypt');
        
        // Obtener usuarios
        const users = await client.query(`
            SELECT usu_correo, usu_clave, usu_nombre 
            FROM tbl_usuarios 
            ORDER BY usu_id
        `);
        
        console.log('\n🧪 Verificando contraseñas:');
        
        // Probar contraseñas conocidas
        const testPasswords = ['admin123', 'test123', '123456', 'password'];
        
        for (const user of users.rows) {
            console.log(`\n👤 ${user.usu_nombre} (${user.usu_correo}):`);
            
            for (const testPass of testPasswords) {
                try {
                    const isMatch = await bcrypt.compare(testPass, user.usu_clave);
                    if (isMatch) {
                        console.log(`   ✅ Contraseña: ${testPass}`);
                        break;
                    }
                } catch (error) {
                    // Si falla bcrypt, puede ser texto plano
                    if (testPass === user.usu_clave) {
                        console.log(`   ✅ Contraseña (texto plano): ${testPass}`);
                        break;
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

testPasswords();
