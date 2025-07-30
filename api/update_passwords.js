// Script para actualizar las contraseñas de los usuarios de prueba
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

async function updatePasswords() {
    const client = await pool.connect();
    
    try {
        console.log('🔐 Actualizando contraseñas de usuarios...');
        
        const bcrypt = await import('bcrypt');
        
        // Hashear la nueva contraseña
        const newPassword = await bcrypt.hash('test123', 10);
        console.log('✅ Nueva contraseña hasheada generada');
        
        // Actualizar usuarios que no sean el administrador
        const updateResult = await client.query(`
            UPDATE tbl_usuarios 
            SET usu_clave = $1, fecha_actualizacion = CURRENT_TIMESTAMP
            WHERE usu_correo != 'admin@tablero.com'
        `, [newPassword]);
        
        console.log(`✅ ${updateResult.rowCount} usuarios actualizados`);
        
        console.log('\n🧪 Verificando nuevas contraseñas:');
        
        // Verificar las contraseñas actualizadas
        const users = await client.query(`
            SELECT usu_correo, usu_clave, usu_nombre 
            FROM tbl_usuarios 
            ORDER BY usu_id
        `);
        
        for (const user of users.rows) {
            console.log(`\n👤 ${user.usu_nombre} (${user.usu_correo}):`);
            
            // Probar admin123 para el admin y test123 para los demás
            const testPass = user.usu_correo === 'admin@tablero.com' ? 'admin123' : 'test123';
            
            try {
                const isMatch = await bcrypt.compare(testPass, user.usu_clave);
                if (isMatch) {
                    console.log(`   ✅ Contraseña: ${testPass}`);
                } else {
                    console.log(`   ❌ Contraseña no coincide`);
                }
            } catch (error) {
                console.log(`   ❌ Error verificando contraseña: ${error.message}`);
            }
        }
        
        console.log('\n🎉 Credenciales finales para login:');
        console.log('   📧 admin@tablero.com → 🔑 admin123');
        console.log('   📧 juan.perez@empresa.com → 🔑 test123');
        console.log('   📧 maria.garcia@empresa.com → 🔑 test123');
        console.log('   📧 carlos.lopez@empresa.com → 🔑 test123');
        console.log('   📧 ana.rodriguez@empresa.com → 🔑 test123');
        
    } catch (error) {
        console.error('❌ Error:', error);
    } finally {
        client.release();
        await pool.end();
    }
}

updatePasswords();
