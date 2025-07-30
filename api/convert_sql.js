// Script para convertir tablero_pavas.sql de MySQL a PostgreSQL
import fs from 'fs';
import path from 'path';

function convertMySQLToPostgreSQL() {
    console.log('🔄 Convirtiendo tablero_pavas.sql de MySQL a PostgreSQL...');
    
    // Leer el archivo SQL original
    const sqlFilePath = path.join('..', 'database', 'tablero_pavas.sql');
    
    if (!fs.existsSync(sqlFilePath)) {
        console.error('❌ No se encuentra el archivo tablero_pavas.sql');
        return;
    }
    
    let sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    console.log('✅ Archivo SQL leído correctamente');
    
    // 1. Remover comandos específicos de MySQL/phpMyAdmin
    sqlContent = sqlContent.replace(/-- phpMyAdmin.*?\n/gi, '');
    sqlContent = sqlContent.replace(/-- version.*?\n/gi, '');
    sqlContent = sqlContent.replace(/-- https:\/\/www\.phpmyadmin\.net\/.*?\n/gi, '');
    sqlContent = sqlContent.replace(/-- Servidor:.*?\n/gi, '');
    sqlContent = sqlContent.replace(/-- Tiempo de generación:.*?\n/gi, '');
    sqlContent = sqlContent.replace(/-- Versión del servidor:.*?\n/gi, '');
    sqlContent = sqlContent.replace(/-- Versión de PHP:.*?\n/gi, '');
    sqlContent = sqlContent.replace(/SET SQL_MODE.*?;/gi, '');
    sqlContent = sqlContent.replace(/START TRANSACTION;/gi, '');
    sqlContent = sqlContent.replace(/COMMIT;/gi, '');
    sqlContent = sqlContent.replace(/SET time_zone.*?;/gi, '');
    sqlContent = sqlContent.replace(/\/\*!.*?\*\//gs, '');
    
    // 2. Cambiar tipos de datos MySQL a PostgreSQL
    sqlContent = sqlContent.replace(/int\(\d+\)/gi, 'INTEGER');
    sqlContent = sqlContent.replace(/tinyint\(1\)/gi, 'BOOLEAN');
    sqlContent = sqlContent.replace(/tinyint\(\d+\)/gi, 'SMALLINT');
    sqlContent = sqlContent.replace(/varchar\((\d+)\)/gi, 'VARCHAR($1)');
    sqlContent = sqlContent.replace(/longtext/gi, 'TEXT');
    sqlContent = sqlContent.replace(/mediumtext/gi, 'TEXT');
    sqlContent = sqlContent.replace(/text/gi, 'TEXT');
    sqlContent = sqlContent.replace(/decimal\((\d+),(\d+)\)/gi, 'DECIMAL($1,$2)');
    sqlContent = sqlContent.replace(/datetime/gi, 'TIMESTAMP');
    
    // 3. Cambiar timestamp con funciones MySQL
    sqlContent = sqlContent.replace(/timestamp NOT NULL DEFAULT current_timestamp\(\)/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    sqlContent = sqlContent.replace(/timestamp NOT NULL DEFAULT current_timestamp\(\) ON UPDATE current_timestamp\(\)/gi, 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
    sqlContent = sqlContent.replace(/DEFAULT current_timestamp\(\)/gi, 'DEFAULT CURRENT_TIMESTAMP');
    sqlContent = sqlContent.replace(/ON UPDATE current_timestamp\(\)/gi, '');
    
    // 4. Cambiar AUTO_INCREMENT a SERIAL
    sqlContent = sqlContent.replace(/(\w+)\s+INTEGER\s+NOT\s+NULL\s+AUTO_INCREMENT/gi, '$1 SERIAL PRIMARY KEY');
    sqlContent = sqlContent.replace(/AUTO_INCREMENT=\d+/gi, '');
    sqlContent = sqlContent.replace(/AUTO_INCREMENT/gi, '');
    
    // 5. Remover ENGINE y CHARSET (no soportados en PostgreSQL)
    sqlContent = sqlContent.replace(/\)\s*ENGINE=\w+.*?;/gi, ');');
    sqlContent = sqlContent.replace(/CHARACTER SET \w+/gi, '');
    sqlContent = sqlContent.replace(/COLLATE \w+/gi, '');
    
    // 6. Cambiar comillas invertidas por comillas dobles
    sqlContent = sqlContent.replace(/`([^`]+)`/g, '"$1"');
    
    // 7. Remover CHECK constraints específicos de MySQL/MariaDB
    sqlContent = sqlContent.replace(/CHECK \(json_valid\([^)]+\)\)/gi, '');
    
    // 8. Cambiar ENUM para PostgreSQL (simplificado)
    sqlContent = sqlContent.replace(/enum\('([^']+)'(?:,'([^']+)')*\)/gi, 'VARCHAR(50)');
    
    // 9. Remover triggers MySQL (incompatibles)
    sqlContent = sqlContent.replace(/DELIMITER \$\$.*?\$\$\s*DELIMITER\s*;/gs, '');
    
    // 10. Remover comandos de índices y modificaciones de AUTO_INCREMENT
    sqlContent = sqlContent.replace(/ALTER TABLE.*?MODIFY.*?AUTO_INCREMENT.*?;/gi, '');
    
    // 11. Simplificar views (crear tablas temporales en su lugar)
    sqlContent = sqlContent.replace(/DROP TABLE IF EXISTS.*?;/gi, '');
    sqlContent = sqlContent.replace(/CREATE ALGORITHM=.*?VIEW.*?AS SELECT.*?;/gs, '');
    
    // 12. Remover foreign key constraints al final (las crearemos después)
    const foreignKeySection = sqlContent.match(/--\s*Restricciones para tablas volcadas.*$/s);
    if (foreignKeySection) {
        sqlContent = sqlContent.replace(/--\s*Restricciones para tablas volcadas.*$/s, '');
    }
    
    // 13. Limpiar múltiples saltos de línea
    sqlContent = sqlContent.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Guardar el archivo convertido
    const outputPath = path.join('tablero_pavas_postgresql.sql');
    fs.writeFileSync(outputPath, sqlContent);
    
    console.log('✅ Archivo convertido guardado como: tablero_pavas_postgresql.sql');
    console.log('\n📋 Siguiente paso:');
    console.log('1. Abre Supabase Dashboard');
    console.log('2. Ve a SQL Editor');
    console.log('3. Copia y pega el contenido del archivo tablero_pavas_postgresql.sql');
    console.log('4. Ejecuta el SQL');
    
    // También crear un archivo con solo las tablas principales para importar por partes
    const mainTables = [
        'tbl_estados',
        'tbl_perfil', 
        'tbl_usuarios',
        'tbl_ventanas',
        'tbl_usuarios_ventanas',
        'tbl_perfil_ventanas'
    ];
    
    let essentialSQL = '';
    
    // Extraer solo las tablas esenciales
    mainTables.forEach(tableName => {
        const tableRegex = new RegExp(`CREATE TABLE "${tableName}".*?;`, 'gs');
        const tableMatch = sqlContent.match(tableRegex);
        if (tableMatch) {
            essentialSQL += tableMatch[0] + '\n\n';
        }
        
        // Extraer los INSERT correspondientes
        const insertRegex = new RegExp(`INSERT INTO "${tableName}".*?;`, 'gs');
        const insertMatches = sqlContent.match(insertRegex);
        if (insertMatches) {
            insertMatches.forEach(insert => {
                essentialSQL += insert + '\n';
            });
            essentialSQL += '\n';
        }
    });
    
    fs.writeFileSync(path.join('tablero_pavas_essential.sql'), essentialSQL);
    console.log('✅ Archivo esencial creado: tablero_pavas_essential.sql (solo tablas principales)');
}

// Ejecutar la conversión
convertMySQLToPostgreSQL();
