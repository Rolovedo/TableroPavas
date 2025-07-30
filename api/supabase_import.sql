-- Script SQL para crear las tablas esenciales en Supabase (PostgreSQL)
-- Ejecutar este script completo en el SQL Editor de Supabase

-- 1. Crear tabla de estados
CREATE TABLE IF NOT EXISTS tbl_estados (
  est_id SERIAL PRIMARY KEY,
  est_nombre VARCHAR(50) NOT NULL,
  est_descripcion VARCHAR(255),
  est_color VARCHAR(7) DEFAULT '#007bff'
);

-- Insertar estados
INSERT INTO tbl_estados (est_id, est_nombre, est_descripcion, est_color) VALUES
(1, 'Activo', 'Usuario activo en el sistema', '#28a745'),
(2, 'Inactivo', 'Usuario temporalmente inactivo', '#ffc107'),
(3, 'Eliminado', 'Usuario eliminado del sistema', '#dc3545'),
(4, 'Pendiente', 'Usuario pendiente de activación', '#17a2b8')
ON CONFLICT (est_id) DO NOTHING;

-- 2. Crear tabla de perfiles
CREATE TABLE IF NOT EXISTS tbl_perfil (
  prf_id SERIAL PRIMARY KEY,
  prf_nombre VARCHAR(50) NOT NULL,
  prf_descripcion VARCHAR(255),
  est_id INTEGER DEFAULT 1,
  FOREIGN KEY (est_id) REFERENCES tbl_estados(est_id)
);

-- Insertar perfiles
INSERT INTO tbl_perfil (prf_id, prf_nombre, prf_descripcion, est_id) VALUES
(1, 'Administrador', 'Acceso completo al sistema', 1),
(2, 'Supervisor', 'Supervisor de desarrolladores', 1),
(3, 'Desarrollador Senior', 'Desarrollador con experiencia avanzada', 1),
(4, 'Desarrollador', 'Desarrollador regular', 1),
(5, 'Desarrollador Junior', 'Desarrollador en formación', 1)
ON CONFLICT (prf_id) DO NOTHING;

-- 3. Crear tabla de usuarios
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

-- Insertar usuarios (las contraseñas ya están hasheadas con bcrypt)
INSERT INTO tbl_usuarios (usu_id, usu_foto, usu_nombre, usu_apellido, usu_correo, usu_usuario, usu_clave, usu_telefono, usu_documento, est_id, prf_id, usu_agenda, usu_instructor, usu_cambio, fecha_creacion, fecha_actualizacion) VALUES
(1, NULL, 'Administrador', 'Sistema', 'admin@tablero.com', 'admin', '$2b$10$iN5nL0ZH12EDEeP7LAgibeG6w1OsnkI/PHneTKdP3ZEgphrcAng.K', '1234567890', NULL, 1, 1, FALSE, FALSE, FALSE, '2025-07-23 19:38:58', '2025-07-23 19:38:58'),
(2, NULL, 'Juan', 'Pérez', 'juan.perez@empresa.com', 'jperez', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '0987654321', NULL, 1, 4, FALSE, FALSE, FALSE, '2025-07-23 19:38:58', '2025-07-23 19:38:58'),
(3, NULL, 'María', 'García', 'maria.garcia@empresa.com', 'mgarcia', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '1122334455', NULL, 1, 3, FALSE, FALSE, FALSE, '2025-07-23 19:38:58', '2025-07-23 19:38:58'),
(4, NULL, 'Carlos', 'López', 'carlos.lopez@empresa.com', 'clopez', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '2233445566', NULL, 1, 4, FALSE, FALSE, FALSE, '2025-07-23 19:38:58', '2025-07-23 19:38:58'),
(5, NULL, 'Ana', 'Rodríguez', 'ana.rodriguez@empresa.com', 'arodriguez', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '3344556677', NULL, 1, 5, FALSE, FALSE, FALSE, '2025-07-23 19:38:58', '2025-07-23 19:38:58')
ON CONFLICT (usu_correo) DO NOTHING;

-- 4. Crear tabla de ventanas
CREATE TABLE IF NOT EXISTS tbl_ventanas (
  ven_id SERIAL PRIMARY KEY,
  ven_nombre VARCHAR(100) NOT NULL,
  ven_descripcion VARCHAR(255),
  ven_ruta VARCHAR(255),
  ven_url VARCHAR(255),
  ven_icono VARCHAR(50),
  ven_orden INTEGER DEFAULT 0,
  ven_padre INTEGER DEFAULT 0,
  est_id INTEGER DEFAULT 1,
  FOREIGN KEY (est_id) REFERENCES tbl_estados(est_id)
);

-- Insertar ventanas
INSERT INTO tbl_ventanas (ven_id, ven_nombre, ven_descripcion, ven_ruta, ven_url, ven_icono, ven_orden, ven_padre, est_id) VALUES
(1, 'Dashboard', 'Panel principal del sistema', 'dashboard', 'dashboard', 'pi pi-home', 1, 0, 1),
(2, 'Tablero', 'Tablero visual de tareas estilo Kanban', 'tablero/board', 'tablero/board', 'pi pi-th-large', 2, 0, 1),
(3, 'Gestión de Tareas', 'Administración y gestión de tareas', 'tablero/tasks', 'tablero/tasks', 'pi pi-list', 3, 0, 1),
(4, 'Asignación de Tareas', 'Asignación de tareas a desarrolladores', 'tablero/assignment', 'tablero/assignment', 'pi pi-users', 4, 0, 1),
(5, 'Desarrolladores', 'Gestión de desarrolladores', 'tablero/developers', 'tablero/developers', 'pi pi-user', 5, 0, 1),
(6, 'Guía de Uso', 'Reportes y estadísticas', 'tablero/guide', 'tablero/guide', 'pi pi-question-circle', 6, 0, 1),
(7, 'Usuarios', 'Configuración del sistema', 'security/users', 'security/users', 'pi pi-user-edit', 7, 0, 1),
(8, 'Configuración', 'Administración de usuarios', 'admin/settings', 'admin/settings', 'pi pi-cog', 8, 0, 1)
ON CONFLICT (ven_id) DO NOTHING;

-- 5. Crear tabla de relación usuarios-ventanas
CREATE TABLE IF NOT EXISTS tbl_usuarios_ventanas (
  uv_id SERIAL PRIMARY KEY,
  usu_id INTEGER NOT NULL,
  ven_id INTEGER NOT NULL,
  FOREIGN KEY (usu_id) REFERENCES tbl_usuarios(usu_id),
  FOREIGN KEY (ven_id) REFERENCES tbl_ventanas(ven_id)
);

-- Insertar relaciones usuarios-ventanas
INSERT INTO tbl_usuarios_ventanas (uv_id, usu_id, ven_id) VALUES
(1, 1, 1), (2, 1, 2), (3, 1, 3), (4, 1, 4), (5, 1, 5), (6, 1, 6), (7, 1, 7), (8, 1, 8),
(17, 2, 1), (21, 2, 2), (25, 2, 3), (29, 2, 4), (33, 2, 5), (37, 2, 6),
(16, 3, 1), (20, 3, 2), (24, 3, 3), (28, 3, 4), (32, 3, 5), (36, 3, 6),
(18, 4, 1), (22, 4, 2), (26, 4, 3), (30, 4, 4), (34, 4, 5), (38, 4, 6),
(19, 5, 1), (23, 5, 2), (27, 5, 3), (31, 5, 4), (35, 5, 5), (39, 5, 6)
ON CONFLICT (uv_id) DO NOTHING;

-- 6. Crear tabla de relación perfil-ventanas
CREATE TABLE IF NOT EXISTS tbl_perfil_ventanas (
  pv_id SERIAL PRIMARY KEY,
  prf_id INTEGER NOT NULL,
  ven_id INTEGER NOT NULL,
  pv_activo BOOLEAN DEFAULT TRUE,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (prf_id) REFERENCES tbl_perfil(prf_id),
  FOREIGN KEY (ven_id) REFERENCES tbl_ventanas(ven_id)
);

-- Insertar relaciones perfil-ventanas
INSERT INTO tbl_perfil_ventanas (pv_id, prf_id, ven_id, pv_activo, fecha_creacion) VALUES
(1, 1, 1, TRUE, '2025-07-23 20:16:01'),
(2, 1, 2, TRUE, '2025-07-23 20:16:01'),
(3, 1, 3, TRUE, '2025-07-23 20:16:01'),
(4, 1, 4, TRUE, '2025-07-23 20:16:01'),
(5, 1, 5, TRUE, '2025-07-23 20:16:01'),
(6, 1, 6, TRUE, '2025-07-23 20:16:01'),
(7, 1, 7, TRUE, '2025-07-23 20:16:01'),
(8, 1, 8, TRUE, '2025-07-23 20:16:01'),
(16, 3, 1, TRUE, '2025-07-23 20:16:01'),
(17, 3, 2, TRUE, '2025-07-23 20:16:01'),
(18, 3, 3, TRUE, '2025-07-23 20:16:01'),
(19, 4, 1, TRUE, '2025-07-23 20:16:01'),
(20, 4, 2, TRUE, '2025-07-23 20:16:01'),
(21, 5, 1, TRUE, '2025-07-23 20:16:01'),
(22, 5, 2, TRUE, '2025-07-23 20:16:01')
ON CONFLICT (pv_id) DO NOTHING;

-- Función para actualizar fecha_actualizacion automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.fecha_actualizacion = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar fecha_actualizacion en tbl_usuarios
CREATE TRIGGER update_tbl_usuarios_updated_at 
    BEFORE UPDATE ON tbl_usuarios 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
