// Script para ejecutar el SQL de tablero_pavas.sql en PostgreSQL
import dotenv from "dotenv";
import pkg from 'pg';
import fs from 'fs';
import path from 'path';

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

// Función para convertir sintaxis MySQL a PostgreSQL
function convertMySQLToPostgreSQL(sqlContent) {
    console.log('🔄 Convirtiendo sintaxis MySQL a PostgreSQL...');
    
    let converted = sqlContent;
    
    // 1. Remover comandos específicos de MySQL
    converted = converted.replace(/SET SQL_MODE.*?;/gi, '');
    converted = converted.replace(/START TRANSACTION;/gi, '');
    converted = converted.replace(/SET time_zone.*?;/gi, '');
    converted = converted.replace(/\/\*!.*?\*\//gs, '');
    converted = converted.replace(/-- phpMyAdmin.*?\n/gi, '');
    converted = converted.replace(/-- Servidor:.*?\n/gi, '');
    converted = converted.replace(/-- Tiempo de generación:.*?\n/gi, '');
    converted = converted.replace(/-- Versión del servidor:.*?\n/gi, '');
    converted = converted.replace(/-- Versión de PHP:.*?\n/gi, '');
    
    // 2. Cambiar tipos de datos MySQL a PostgreSQL
    converted = converted.replace(/int\((\d+)\)/gi, 'INTEGER');
    converted = converted.replace(/tinyint\(1\)/gi, 'BOOLEAN');
    converted = converted.replace(/tinyint\((\d+)\)/gi, 'SMALLINT');
    converted = converted.replace(/varchar\((\d+)\)/gi, 'VARCHAR($1)');
    converted = converted.replace(/text/gi, 'TEXT');
    converted = converted.replace(/longtext/gi, 'TEXT');
    converted = converted.replace(/decimal\((\d+),(\d+)\)/gi, 'DECIMAL($1,$2)');
    converted = converted.replace(/timestamp/gi, 'TIMESTAMP');
    converted = converted.replace(/datetime/gi, 'TIMESTAMP');
    
    // 3. Cambiar AUTO_INCREMENT a SERIAL
    converted = converted.replace(/(\w+)\s+INTEGER\s+NOT\s+NULL\s+AUTO_INCREMENT/gi, '$1 SERIAL PRIMARY KEY');
    converted = converted.replace(/AUTO_INCREMENT/gi, '');
    
    // 4. Cambiar ENGINE y CHARSET (no soportados en PostgreSQL)
    converted = converted.replace(/\)\s*ENGINE=\w+.*?;/gi, ');');
    
    // 5. Cambiar DEFAULT current_timestamp() a DEFAULT CURRENT_TIMESTAMP
    converted = converted.replace(/DEFAULT current_timestamp\(\)/gi, 'DEFAULT CURRENT_TIMESTAMP');
    converted = converted.replace(/ON UPDATE current_timestamp\(\)/gi, '');
    
    // 6. Cambiar comillas invertidas por comillas dobles (para nombres de tablas/columnas)
    converted = converted.replace(/`([^`]+)`/g, '"$1"');
    
    // 7. Cambiar CHECK constraints de MySQL/MariaDB
    converted = converted.replace(/CHECK \(json_valid\(`(\w+)`\)\)/gi, '');
    
    // 8. Remover especificaciones de CHARACTER SET y COLLATE
    converted = converted.replace(/CHARACTER SET \w+/gi, '');
    converted = converted.replace(/COLLATE \w+/gi, '');
    
    return converted;
}

// Función para dividir el SQL en statements individuales
function splitSQLStatements(sqlContent) {
    // Dividir por punto y coma, pero ignorar los que están dentro de strings
    const statements = [];
    let current = '';
    let inString = false;
    let stringChar = '';
    
    for (let i = 0; i < sqlContent.length; i++) {
        const char = sqlContent[i];
        const prevChar = i > 0 ? sqlContent[i - 1] : '';
        
        if (!inString && (char === '"' || char === "'")) {
            inString = true;
            stringChar = char;
        } else if (inString && char === stringChar && prevChar !== '\\') {
            inString = false;
            stringChar = '';
        }
        
        if (!inString && char === ';') {
            current = current.trim();
            if (current.length > 0 && !current.startsWith('--') && current !== 'COMMIT') {
                statements.push(current);
            }
            current = '';
        } else {
            current += char;
        }
    }
    
    // Agregar el último statement si no termina en ;
    current = current.trim();
    if (current.length > 0 && !current.startsWith('--')) {
        statements.push(current);
    }
    
    return statements;
}

async function createDatabaseFromSQL() {
    const client = await pool.connect();
    
    try {
        console.log('🔍 Conectando a la base de datos Supabase...');
        
        // Verificar conexión
        const testQuery = await client.query('SELECT NOW()');
        console.log('✅ Conexión exitosa:', testQuery.rows[0].now);
        
        // Leer el archivo SQL
        const sqlFilePath = path.join('..', 'database', 'tablero_pavas.sql');
        console.log('📖 Leyendo archivo SQL desde:', sqlFilePath);
        
        if (!fs.existsSync(sqlFilePath)) {
            throw new Error(`Archivo SQL no encontrado: ${sqlFilePath}`);
        }
        
        const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
        console.log('✅ Archivo SQL leído correctamente');
        
        // Convertir sintaxis MySQL a PostgreSQL
        const convertedSQL = convertMySQLToPostgreSQL(sqlContent);
        
        // Dividir en statements individuales
        const statements = splitSQLStatements(convertedSQL);
        console.log(`📋 Encontrados ${statements.length} statements SQL para ejecutar`);
        
        // Ejecutar cada statement
        let successCount = 0;
        let errorCount = 0;
        
        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i].trim();
            
            if (statement.length === 0 || statement.startsWith('--')) {
                continue;
            }
            
            try {
                console.log(`⚡ Ejecutando statement ${i + 1}/${statements.length}...`);
                await client.query(statement);
                successCount++;
            } catch (error) {
                console.log(`⚠️ Error en statement ${i + 1}: ${error.message}`);
                console.log(`   Statement: ${statement.substring(0, 100)}...`);
                errorCount++;
                
                // Continuar con los siguientes statements en lugar de abortar
                continue;
            }
        }
        
        console.log(`\n📊 Resumen de ejecución:`);
        console.log(`✅ Statements ejecutados exitosamente: ${successCount}`);
        console.log(`❌ Statements con errores: ${errorCount}`);
        
        // Verificar que se crearon las tablas principales
        console.log('\n🔍 Verificando tablas creadas...');
        const tablesQuery = await client.query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name LIKE '%tbl_%' OR table_name LIKE '%tablero_%'
            ORDER BY table_name
        `);
        
        console.log('📋 Tablas encontradas:');
        tablesQuery.rows.forEach(row => {
            console.log(`  📄 ${row.table_name}`);
        });
        
        // Verificar usuarios
        try {
            const usersQuery = await client.query(`
                SELECT u.usu_id, u.usu_nombre, u.usu_apellido, u.usu_correo, 
                       u.usu_usuario, p.prf_nombre
                FROM tbl_usuarios u
                LEFT JOIN tbl_perfil p ON u.prf_id = p.prf_id
                ORDER BY u.usu_id
                LIMIT 10
            `);
            
            console.log('\n👥 Usuarios encontrados:');
            usersQuery.rows.forEach(user => {
                console.log(`  🧑 ${user.usu_nombre} ${user.usu_apellido || ''} (${user.usu_correo}) - ${user.prf_nombre}`);
            });
            
            if (usersQuery.rows.length > 0) {
                console.log('\n🎉 Base de datos configurada correctamente!');
                console.log('\n🔐 Puedes usar las credenciales que estén en la base de datos,');
                console.log('    o crear nuevas usando el hash bcrypt para las contraseñas.');
            }
            
        } catch (userError) {
            console.log('\n⚠️ No se pudieron verificar los usuarios:', userError.message);
        }
        
    } catch (error) {
        console.error('❌ Error ejecutando SQL:', error);
        throw error;
    } finally {
        client.release();
        await pool.end();
    }
}

// Ejecutar el script
createDatabaseFromSQL()
    .then(() => {
        console.log('\n✅ Script completado');
        process.exit(0);
    })
    .catch(error => {
        console.error('❌ Error ejecutando script:', error);
        process.exit(1);
    });
