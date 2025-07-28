-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 25-07-2025 a las 17:22:01
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `tablero_pavas`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tablero_archivos_adjuntos_tarea`
--

CREATE TABLE `tablero_archivos_adjuntos_tarea` (
  `id` int(11) NOT NULL,
  `tarea_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `nombre_archivo` varchar(255) NOT NULL,
  `ruta_archivo` varchar(500) NOT NULL,
  `tamaño_archivo` int(11) DEFAULT NULL,
  `tipo_archivo` varchar(100) DEFAULT NULL,
  `fecha_subida` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tablero_comentarios_tarea`
--

CREATE TABLE `tablero_comentarios_tarea` (
  `id` int(11) NOT NULL,
  `tarea_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `comentario` text NOT NULL,
  `es_interno` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tablero_configuraciones`
--

CREATE TABLE `tablero_configuraciones` (
  `id` int(11) NOT NULL,
  `clave_configuracion` varchar(100) NOT NULL,
  `valor_configuracion` text DEFAULT NULL,
  `descripcion` text DEFAULT NULL,
  `actualizado_por` int(11) DEFAULT NULL,
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tablero_configuraciones`
--

INSERT INTO `tablero_configuraciones` (`id`, `clave_configuracion`, `valor_configuracion`, `descripcion`, `actualizado_por`, `fecha_actualizacion`) VALUES
(1, 'telefono_supervisor', '+57300123456', 'Teléfono del jefe de programadores para notificaciones', NULL, '2025-07-23 19:40:47'),
(2, 'max_solicitudes_cambio_por_dia', '3', 'Máximo número de solicitudes de cambio por desarrollador por día', NULL, '2025-07-23 19:40:47'),
(3, 'asignacion_automatica_habilitada', 'true', 'Habilitar asignación automática basada en algoritmo', NULL, '2025-07-23 19:40:47'),
(4, 'notificaciones_habilitadas', 'true', 'Habilitar notificaciones de WhatsApp', NULL, '2025-07-23 19:40:47'),
(5, 'horas_notificacion_vencimiento', '24', 'Horas antes del vencimiento para notificar', NULL, '2025-07-23 19:40:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tablero_desarrolladores`
--

CREATE TABLE `tablero_desarrolladores` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `rol` varchar(50) NOT NULL DEFAULT 'desarrollador',
  `nivel` varchar(50) NOT NULL DEFAULT 'junior',
  `habilidades` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`habilidades`)),
  `capacidad_maxima` int(11) NOT NULL DEFAULT 40,
  `calificacion_eficiencia` decimal(3,2) DEFAULT 0.85,
  `esta_activo` tinyint(1) DEFAULT 1,
  `avatar` varchar(10) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `tablero_estadisticas_desarrolladores`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `tablero_estadisticas_desarrolladores` (
`usuario_id` int(11)
,`nombre_desarrollador` varchar(201)
,`email` varchar(150)
,`rol` varchar(50)
,`nivel` varchar(50)
,`capacidad_maxima` int(11)
,`calificacion_eficiencia` decimal(3,2)
,`total_tareas` bigint(21)
,`tareas_completadas` decimal(22,0)
,`tareas_en_progreso` decimal(22,0)
,`carga_trabajo_actual` decimal(32,0)
,`tiempo_promedio_completar` decimal(14,4)
,`porcentaje_carga_trabajo` decimal(38,2)
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tablero_historial_tareas`
--

CREATE TABLE `tablero_historial_tareas` (
  `id` int(11) NOT NULL,
  `tarea_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `accion` varchar(50) NOT NULL,
  `valor_anterior` text DEFAULT NULL,
  `valor_nuevo` text DEFAULT NULL,
  `notas` text DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tablero_notificaciones_whatsapp`
--

CREATE TABLE `tablero_notificaciones_whatsapp` (
  `id` int(11) NOT NULL,
  `tarea_id` int(11) DEFAULT NULL,
  `solicitud_cambio_id` int(11) DEFAULT NULL,
  `telefono_destinatario` varchar(20) NOT NULL,
  `mensaje` text NOT NULL,
  `tipo` varchar(50) DEFAULT NULL,
  `estado` enum('pendiente','enviado','fallido') DEFAULT 'pendiente',
  `fecha_envio` timestamp NULL DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tablero_solicitudes_cambio_tarea`
--

CREATE TABLE `tablero_solicitudes_cambio_tarea` (
  `id` int(11) NOT NULL,
  `tarea_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `estado_anterior` varchar(20) DEFAULT NULL,
  `estado_solicitado` varchar(20) DEFAULT NULL,
  `motivo` text DEFAULT NULL,
  `estado` enum('pendiente','aprobado','rechazado') DEFAULT 'pendiente',
  `fecha_solicitud` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_revision` timestamp NULL DEFAULT NULL,
  `revisado_por` int(11) DEFAULT NULL,
  `notas_revisor` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tablero_tareas`
--

CREATE TABLE `tablero_tareas` (
  `id` int(11) NOT NULL,
  `titulo` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `asignado_a` int(11) DEFAULT NULL,
  `prioridad` enum('baja','media','alta','muy-alta') DEFAULT 'media',
  `estado` enum('pendiente','por-hacer','en-progreso','revision','completada') DEFAULT 'pendiente',
  `categoria` varchar(50) DEFAULT NULL,
  `fecha_vencimiento` date DEFAULT NULL,
  `horas_estimadas` int(11) DEFAULT 0,
  `horas_reales` int(11) DEFAULT 0,
  `progreso` int(11) DEFAULT 0,
  `habilidades_requeridas` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`habilidades_requeridas`)),
  `creado_por` int(11) NOT NULL,
  `actualizado_por` int(11) DEFAULT NULL,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Disparadores `tablero_tareas`
--
DELIMITER $$
CREATE TRIGGER `tablero_auditoria_asignacion_tarea` AFTER UPDATE ON `tablero_tareas` FOR EACH ROW BEGIN
    IF OLD.asignado_a != NEW.asignado_a THEN
        INSERT INTO tablero_historial_tareas (
            tarea_id, usuario_id, accion, valor_anterior, valor_nuevo, fecha_creacion
        ) VALUES (
            NEW.id, 
            NEW.actualizado_por, 
            'asignada', 
            COALESCE(OLD.asignado_a, 'sin_asignar'), 
            COALESCE(NEW.asignado_a, 'sin_asignar'), 
            NOW()
        );
    END IF;
END
$$
DELIMITER ;
DELIMITER $$
CREATE TRIGGER `tablero_auditoria_cambio_estado_tarea` AFTER UPDATE ON `tablero_tareas` FOR EACH ROW BEGIN
    IF OLD.estado != NEW.estado THEN
        INSERT INTO tablero_historial_tareas (
            tarea_id, usuario_id, accion, valor_anterior, valor_nuevo, fecha_creacion
        ) VALUES (
            NEW.id, 
            NEW.actualizado_por, 
            'estado_cambiado', 
            OLD.estado, 
            NEW.estado, 
            NOW()
        );
    END IF;
END
$$
DELIMITER ;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tablero_tarea_colaboradores`
--

CREATE TABLE `tablero_tarea_colaboradores` (
  `id` int(11) NOT NULL,
  `tarea_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `fecha_agregado` timestamp NOT NULL DEFAULT current_timestamp(),
  `agregado_por` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `tablero_vista_tablero`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `tablero_vista_tablero` (
`id` int(11)
,`titulo` varchar(255)
,`descripcion` text
,`prioridad` enum('baja','media','alta','muy-alta')
,`estado` enum('pendiente','por-hacer','en-progreso','revision','completada')
,`categoria` varchar(50)
,`fecha_vencimiento` date
,`horas_estimadas` int(11)
,`horas_reales` int(11)
,`progreso` int(11)
,`habilidades_requeridas` longtext
,`fecha_creacion` timestamp
,`fecha_actualizacion` timestamp
,`esta_vencida` int(1)
,`asignado_a_id` int(11)
,`nombre_asignado` varchar(201)
,`email_asignado` varchar(150)
,`avatar_asignado` varchar(10)
,`nombre_creador` varchar(201)
,`colaboradores` mediumtext
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_estados`
--

CREATE TABLE `tbl_estados` (
  `est_id` int(11) NOT NULL,
  `est_nombre` varchar(50) NOT NULL,
  `est_descripcion` varchar(255) DEFAULT NULL,
  `est_color` varchar(7) DEFAULT '#007bff'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_estados`
--

INSERT INTO `tbl_estados` (`est_id`, `est_nombre`, `est_descripcion`, `est_color`) VALUES
(1, 'Activo', 'Usuario activo en el sistema', '#28a745'),
(2, 'Inactivo', 'Usuario temporalmente inactivo', '#ffc107'),
(3, 'Eliminado', 'Usuario eliminado del sistema', '#dc3545'),
(4, 'Pendiente', 'Usuario pendiente de activación', '#17a2b8');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_notificaciones`
--

CREATE TABLE `tbl_notificaciones` (
  `not_id` int(11) NOT NULL,
  `usu_id` int(11) NOT NULL,
  `not_titulo` varchar(255) NOT NULL,
  `not_mensaje` text NOT NULL,
  `not_tipo` enum('info','warning','error','success') DEFAULT 'info',
  `not_visto` tinyint(1) DEFAULT 0,
  `not_fec_env` timestamp NOT NULL DEFAULT current_timestamp(),
  `not_fec_visto` timestamp NULL DEFAULT NULL,
  `not_datos_extra` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`not_datos_extra`))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_notificaciones`
--

INSERT INTO `tbl_notificaciones` (`not_id`, `usu_id`, `not_titulo`, `not_mensaje`, `not_tipo`, `not_visto`, `not_fec_env`, `not_fec_visto`, `not_datos_extra`) VALUES
(1, 1, 'Bienvenido al sistema tablero', 'Hola Administrador Sistema, bienvenido al sistema de gestión de tareas.', 'success', 0, '2025-07-23 20:17:20', NULL, NULL),
(2, 2, 'Bienvenido al sistema tablero', 'Hola Juan Pérez, bienvenido al sistema de gestión de tareas.', 'success', 0, '2025-07-23 20:17:20', NULL, NULL),
(3, 3, 'Bienvenido al sistema tablero', 'Hola María García, bienvenido al sistema de gestión de tareas.', 'success', 0, '2025-07-23 20:17:20', NULL, NULL),
(4, 4, 'Bienvenido al sistema tablero', 'Hola Carlos López, bienvenido al sistema de gestión de tareas.', 'success', 0, '2025-07-23 20:17:20', NULL, NULL),
(5, 5, 'Bienvenido al sistema tablero', 'Hola Ana Rodríguez, bienvenido al sistema de gestión de tareas.', 'success', 0, '2025-07-23 20:17:20', NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_perfil`
--

CREATE TABLE `tbl_perfil` (
  `prf_id` int(11) NOT NULL,
  `prf_nombre` varchar(50) NOT NULL,
  `prf_descripcion` varchar(255) DEFAULT NULL,
  `est_id` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_perfil`
--

INSERT INTO `tbl_perfil` (`prf_id`, `prf_nombre`, `prf_descripcion`, `est_id`) VALUES
(1, 'Administrador', 'Acceso completo al sistema', 1),
(2, 'Supervisor', 'Supervisor de desarrolladores', 1),
(3, 'Desarrollador Senior', 'Desarrollador con experiencia avanzada', 1),
(4, 'Desarrollador', 'Desarrollador regular', 1),
(5, 'Desarrollador Junior', 'Desarrollador en formación', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_perfil_ventanas`
--

CREATE TABLE `tbl_perfil_ventanas` (
  `pv_id` int(11) NOT NULL,
  `prf_id` int(11) NOT NULL,
  `ven_id` int(11) NOT NULL,
  `pv_activo` tinyint(1) DEFAULT 1,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_perfil_ventanas`
--

INSERT INTO `tbl_perfil_ventanas` (`pv_id`, `prf_id`, `ven_id`, `pv_activo`, `fecha_creacion`) VALUES
(1, 1, 1, 1, '2025-07-23 20:16:01'),
(2, 1, 2, 1, '2025-07-23 20:16:01'),
(3, 1, 3, 1, '2025-07-23 20:16:01'),
(4, 1, 4, 1, '2025-07-23 20:16:01'),
(5, 1, 5, 1, '2025-07-23 20:16:01'),
(6, 1, 6, 1, '2025-07-23 20:16:01'),
(7, 1, 7, 1, '2025-07-23 20:16:01'),
(8, 1, 8, 1, '2025-07-23 20:16:01'),
(16, 3, 1, 1, '2025-07-23 20:16:01'),
(17, 3, 2, 1, '2025-07-23 20:16:01'),
(18, 3, 3, 1, '2025-07-23 20:16:01'),
(19, 4, 1, 1, '2025-07-23 20:16:01'),
(20, 4, 2, 1, '2025-07-23 20:16:01'),
(21, 5, 1, 1, '2025-07-23 20:16:01'),
(22, 5, 2, 1, '2025-07-23 20:16:01');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_permisos_usuarios`
--

CREATE TABLE `tbl_permisos_usuarios` (
  `pu_id` int(11) NOT NULL,
  `usu_id` int(11) NOT NULL,
  `per_id` int(11) NOT NULL,
  `fecha_asignacion` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_permisos_usuarios`
--

INSERT INTO `tbl_permisos_usuarios` (`pu_id`, `usu_id`, `per_id`, `fecha_asignacion`) VALUES
(1, 1, 1, '2025-07-23 20:04:21'),
(2, 2, 1, '2025-07-23 20:04:21'),
(3, 3, 1, '2025-07-23 20:04:21'),
(4, 4, 1, '2025-07-23 20:04:21'),
(5, 5, 1, '2025-07-23 20:04:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_usuarios`
--

CREATE TABLE `tbl_usuarios` (
  `usu_id` int(11) NOT NULL,
  `usu_foto` varchar(255) DEFAULT NULL,
  `usu_nombre` varchar(100) NOT NULL,
  `usu_apellido` varchar(100) DEFAULT NULL,
  `usu_correo` varchar(150) NOT NULL,
  `usu_usuario` varchar(50) DEFAULT NULL,
  `usu_clave` varchar(255) NOT NULL,
  `usu_telefono` varchar(20) DEFAULT NULL,
  `usu_documento` varchar(20) DEFAULT NULL,
  `est_id` int(11) DEFAULT 1,
  `prf_id` int(11) NOT NULL,
  `usu_agenda` tinyint(1) DEFAULT 0,
  `usu_instructor` tinyint(1) DEFAULT 0,
  `usu_cambio` tinyint(1) DEFAULT 0,
  `fecha_creacion` timestamp NOT NULL DEFAULT current_timestamp(),
  `fecha_actualizacion` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_usuarios`
--

INSERT INTO `tbl_usuarios` (`usu_id`, `usu_foto`, `usu_nombre`, `usu_apellido`, `usu_correo`, `usu_usuario`, `usu_clave`, `usu_telefono`, `usu_documento`, `est_id`, `prf_id`, `usu_agenda`, `usu_instructor`, `usu_cambio`, `fecha_creacion`, `fecha_actualizacion`) VALUES
(1, NULL, 'Administrador', 'Sistema', 'admin@tablero.com', 'admin', '$2b$10$iN5nL0ZH12EDEeP7LAgibeG6w1OsnkI/PHneTKdP3ZEgphrcAng.K', '1234567890', NULL, 1, 1, 0, 0, 0, '2025-07-23 19:38:58', '2025-07-23 19:38:58'),
(2, NULL, 'Juan', 'Pérez', 'juan.perez@empresa.com', 'jperez', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '0987654321', NULL, 1, 4, 0, 0, 0, '2025-07-23 19:38:58', '2025-07-23 19:38:58'),
(3, NULL, 'María', 'García', 'maria.garcia@empresa.com', 'mgarcia', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '1122334455', NULL, 1, 3, 0, 0, 0, '2025-07-23 19:38:58', '2025-07-23 19:38:58'),
(4, NULL, 'Carlos', 'López', 'carlos.lopez@empresa.com', 'clopez', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '2233445566', NULL, 1, 4, 0, 0, 0, '2025-07-23 19:38:58', '2025-07-23 19:38:58'),
(5, NULL, 'Ana', 'Rodríguez', 'ana.rodriguez@empresa.com', 'arodriguez', '$2b$10$V5Z1BaVEqRywWllKEA2dzechXJiaxzuLtoLIo0pahXHl1aiOFhCBO', '3344556677', NULL, 1, 5, 0, 0, 0, '2025-07-23 19:38:58', '2025-07-23 19:38:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_usuarios_ventanas`
--

CREATE TABLE `tbl_usuarios_ventanas` (
  `uv_id` int(11) NOT NULL,
  `usu_id` int(11) NOT NULL,
  `ven_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_usuarios_ventanas`
--

INSERT INTO `tbl_usuarios_ventanas` (`uv_id`, `usu_id`, `ven_id`) VALUES
(1, 1, 1),
(2, 1, 2),
(3, 1, 3),
(4, 1, 4),
(5, 1, 5),
(6, 1, 6),
(7, 1, 7),
(8, 1, 8),
(17, 2, 1),
(21, 2, 2),
(25, 2, 3),
(29, 2, 4),
(33, 2, 5),
(37, 2, 6),
(16, 3, 1),
(20, 3, 2),
(24, 3, 3),
(28, 3, 4),
(32, 3, 5),
(36, 3, 6),
(18, 4, 1),
(22, 4, 2),
(26, 4, 3),
(30, 4, 4),
(34, 4, 5),
(38, 4, 6),
(19, 5, 1),
(23, 5, 2),
(27, 5, 3),
(31, 5, 4),
(35, 5, 5),
(39, 5, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_ventanas`
--

CREATE TABLE `tbl_ventanas` (
  `ven_id` int(11) NOT NULL,
  `ven_nombre` varchar(100) NOT NULL,
  `ven_descripcion` varchar(255) DEFAULT NULL,
  `ven_ruta` varchar(255) DEFAULT NULL,
  `ven_url` varchar(255) DEFAULT NULL,
  `ven_icono` varchar(50) DEFAULT NULL,
  `ven_orden` int(11) DEFAULT 0,
  `ven_padre` int(11) DEFAULT 0,
  `est_id` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_ventanas`
--

INSERT INTO `tbl_ventanas` (`ven_id`, `ven_nombre`, `ven_descripcion`, `ven_ruta`, `ven_url`, `ven_icono`, `ven_orden`, `ven_padre`, `est_id`) VALUES
(1, 'Dashboard', 'Panel principal del sistema', 'dashboard', 'dashboard', 'pi pi-home', 1, 0, 1),
(2, 'Tablero', 'Tablero visual de tareas estilo Kanban', 'tablero/board', 'tablero/board', 'pi pi-th-large', 2, 0, 1),
(3, 'Gestión de Tareas', 'Administración y gestión de tareas', 'tablero/tasks', 'tablero/tasks', 'pi pi-list', 3, 0, 1),
(4, 'Asignación de Tareas', 'Asignación de tareas a desarrolladores', 'tablero/assignment', 'tablero/assignment', 'pi pi-users', 4, 0, 1),
(5, 'Desarrolladores', 'Gestión de desarrolladores', 'tablero/developers', 'tablero/developers', 'pi pi-user', 5, 0, 1),
(6, 'Guía de Uso', 'Reportes y estadísticas', 'tablero/guide', 'tablero/guide', 'pi pi-question-circle', 6, 0, 1),
(7, 'Usuarios', 'Configuración del sistema', 'security/users', 'security/users', 'pi pi-user-edit', 7, 0, 1),
(8, 'Configuración', 'Administración de usuarios', 'admin/settings', 'admin/settings', 'pi pi-cog', 8, 0, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_ventanas_backup_20250724`
--

CREATE TABLE `tbl_ventanas_backup_20250724` (
  `ven_id` int(11) NOT NULL DEFAULT 0,
  `ven_nombre` varchar(100) NOT NULL,
  `ven_descripcion` varchar(255) DEFAULT NULL,
  `ven_ruta` varchar(255) DEFAULT NULL,
  `ven_url` varchar(255) DEFAULT NULL,
  `ven_icono` varchar(50) DEFAULT NULL,
  `ven_orden` int(11) DEFAULT 0,
  `ven_padre` int(11) DEFAULT 0,
  `est_id` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tbl_ventanas_backup_20250724`
--

INSERT INTO `tbl_ventanas_backup_20250724` (`ven_id`, `ven_nombre`, `ven_descripcion`, `ven_ruta`, `ven_url`, `ven_icono`, `ven_orden`, `ven_padre`, `est_id`) VALUES
(1, 'Dashboard', 'Panel principal del sistema', '/dashboard', '/dashboard', 'pi pi-home', 1, 0, 1),
(2, 'Tablero', 'Tablero visual de tareas estilo Kanban', '/tablero/board', '/tablero/board', 'pi pi-th-large', 2, 0, 1),
(3, 'Gestión de Tareas', 'Administración y gestión de tareas', '/tablero/tasks', '/tablero/tasks', 'pi pi-list', 3, 0, 1),
(4, 'Asignación de Tareas', 'Asignación de tareas a desarrolladores', '/tablero/assignment', '/tablero/assignment', 'pi pi-users', 4, 0, 1),
(5, 'Desarrolladores', 'Gestión de desarrolladores', '/tablero/developers', '/tablero/developers', 'pi pi-user', 5, 0, 1),
(6, 'Guía de Uso', 'Reportes y estadísticas', '/tablero/guide', '/tablero/guide', 'pi pi-question-circle', 6, 0, 1),
(7, 'Usuarios', 'Configuración del sistema', '/security/users', '/security/users', 'pi pi-user-edit', 7, 0, 1),
(8, 'Configuración', 'Administración de usuarios', '/admin/settings', '/admin/settings', 'pi pi-cog', 8, 0, 1);

-- --------------------------------------------------------

--
-- Estructura Stand-in para la vista `users`
-- (Véase abajo para la vista actual)
--
CREATE TABLE `users` (
`id` int(11)
,`name` varchar(201)
,`email` varchar(150)
,`password` varchar(255)
,`created_at` timestamp
,`updated_at` timestamp
);

-- --------------------------------------------------------

--
-- Estructura para la vista `tablero_estadisticas_desarrolladores`
--
DROP TABLE IF EXISTS `tablero_estadisticas_desarrolladores`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tablero_estadisticas_desarrolladores`  AS SELECT `d`.`usuario_id` AS `usuario_id`, concat(`u`.`usu_nombre`,' ',ifnull(`u`.`usu_apellido`,'')) AS `nombre_desarrollador`, `u`.`usu_correo` AS `email`, `d`.`rol` AS `rol`, `d`.`nivel` AS `nivel`, `d`.`capacidad_maxima` AS `capacidad_maxima`, `d`.`calificacion_eficiencia` AS `calificacion_eficiencia`, coalesce(`estadisticas_tareas`.`total_tareas`,0) AS `total_tareas`, coalesce(`estadisticas_tareas`.`tareas_completadas`,0) AS `tareas_completadas`, coalesce(`estadisticas_tareas`.`tareas_en_progreso`,0) AS `tareas_en_progreso`, coalesce(`estadisticas_tareas`.`carga_trabajo_actual`,0) AS `carga_trabajo_actual`, coalesce(`estadisticas_tareas`.`tiempo_promedio_completar`,0) AS `tiempo_promedio_completar`, round(coalesce(`estadisticas_tareas`.`carga_trabajo_actual`,0) / `d`.`capacidad_maxima` * 100,2) AS `porcentaje_carga_trabajo` FROM ((`tablero_desarrolladores` `d` join `tbl_usuarios` `u` on(`d`.`usuario_id` = `u`.`usu_id`)) left join (select `tablero_tareas`.`asignado_a` AS `asignado_a`,count(0) AS `total_tareas`,sum(case when `tablero_tareas`.`estado` = 'completada' then 1 else 0 end) AS `tareas_completadas`,sum(case when `tablero_tareas`.`estado` = 'en-progreso' then 1 else 0 end) AS `tareas_en_progreso`,sum(case when `tablero_tareas`.`estado` in ('por-hacer','en-progreso','revision') then `tablero_tareas`.`horas_estimadas` else 0 end) AS `carga_trabajo_actual`,avg(case when `tablero_tareas`.`estado` = 'completada' and `tablero_tareas`.`horas_reales` > 0 then `tablero_tareas`.`horas_reales` else NULL end) AS `tiempo_promedio_completar` from `tablero_tareas` where `tablero_tareas`.`asignado_a` is not null group by `tablero_tareas`.`asignado_a`) `estadisticas_tareas` on(`d`.`usuario_id` = `estadisticas_tareas`.`asignado_a`)) WHERE `d`.`esta_activo` = 1 ;

-- --------------------------------------------------------

--
-- Estructura para la vista `tablero_vista_tablero`
--
DROP TABLE IF EXISTS `tablero_vista_tablero`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `tablero_vista_tablero`  AS SELECT `t`.`id` AS `id`, `t`.`titulo` AS `titulo`, `t`.`descripcion` AS `descripcion`, `t`.`prioridad` AS `prioridad`, `t`.`estado` AS `estado`, `t`.`categoria` AS `categoria`, `t`.`fecha_vencimiento` AS `fecha_vencimiento`, `t`.`horas_estimadas` AS `horas_estimadas`, `t`.`horas_reales` AS `horas_reales`, `t`.`progreso` AS `progreso`, `t`.`habilidades_requeridas` AS `habilidades_requeridas`, `t`.`fecha_creacion` AS `fecha_creacion`, `t`.`fecha_actualizacion` AS `fecha_actualizacion`, CASE WHEN `t`.`fecha_vencimiento` < curdate() AND `t`.`estado` <> 'completada' THEN 1 ELSE 0 END AS `esta_vencida`, `asignado`.`usu_id` AS `asignado_a_id`, concat(`asignado`.`usu_nombre`,' ',ifnull(`asignado`.`usu_apellido`,'')) AS `nombre_asignado`, `asignado`.`usu_correo` AS `email_asignado`, `jd`.`avatar` AS `avatar_asignado`, concat(`creador`.`usu_nombre`,' ',ifnull(`creador`.`usu_apellido`,'')) AS `nombre_creador`, group_concat(concat(`colaborador`.`usu_id`,':',concat(`colaborador`.`usu_nombre`,' ',ifnull(`colaborador`.`usu_apellido`,'')),':',`jd_colaborador`.`avatar`) order by concat(`colaborador`.`usu_nombre`,' ',ifnull(`colaborador`.`usu_apellido`,'')) ASC separator ',') AS `colaboradores` FROM ((((((`tablero_tareas` `t` left join `tbl_usuarios` `asignado` on(`t`.`asignado_a` = `asignado`.`usu_id`)) left join `tablero_desarrolladores` `jd` on(`asignado`.`usu_id` = `jd`.`usuario_id`)) left join `tbl_usuarios` `creador` on(`t`.`creado_por` = `creador`.`usu_id`)) left join `tablero_tarea_colaboradores` `tc` on(`t`.`id` = `tc`.`tarea_id`)) left join `tbl_usuarios` `colaborador` on(`tc`.`usuario_id` = `colaborador`.`usu_id`)) left join `tablero_desarrolladores` `jd_colaborador` on(`colaborador`.`usu_id` = `jd_colaborador`.`usuario_id`)) GROUP BY `t`.`id` ORDER BY field(`t`.`prioridad`,'muy-alta','alta','media','baja') ASC, `t`.`fecha_creacion` DESC ;

-- --------------------------------------------------------

--
-- Estructura para la vista `users`
--
DROP TABLE IF EXISTS `users`;

CREATE ALGORITHM=UNDEFINED DEFINER=`root`@`localhost` SQL SECURITY DEFINER VIEW `users`  AS SELECT `tbl_usuarios`.`usu_id` AS `id`, concat(`tbl_usuarios`.`usu_nombre`,' ',ifnull(`tbl_usuarios`.`usu_apellido`,'')) AS `name`, `tbl_usuarios`.`usu_correo` AS `email`, `tbl_usuarios`.`usu_clave` AS `password`, `tbl_usuarios`.`fecha_creacion` AS `created_at`, `tbl_usuarios`.`fecha_actualizacion` AS `updated_at` FROM `tbl_usuarios` WHERE `tbl_usuarios`.`est_id` in (1,4) ;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tablero_archivos_adjuntos_tarea`
--
ALTER TABLE `tablero_archivos_adjuntos_tarea`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tarea_id` (`tarea_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `tablero_comentarios_tarea`
--
ALTER TABLE `tablero_comentarios_tarea`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_tarea_id` (`tarea_id`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`);

--
-- Indices de la tabla `tablero_configuraciones`
--
ALTER TABLE `tablero_configuraciones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `clave_configuracion` (`clave_configuracion`),
  ADD KEY `actualizado_por` (`actualizado_por`);

--
-- Indices de la tabla `tablero_desarrolladores`
--
ALTER TABLE `tablero_desarrolladores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_usuario_desarrollador` (`usuario_id`),
  ADD KEY `idx_tablero_desarrolladores_activos` (`esta_activo`,`usuario_id`);

--
-- Indices de la tabla `tablero_historial_tareas`
--
ALTER TABLE `tablero_historial_tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `idx_tarea_id` (`tarea_id`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`),
  ADD KEY `idx_tablero_historial_tareas_compuesto` (`tarea_id`,`fecha_creacion`);

--
-- Indices de la tabla `tablero_notificaciones_whatsapp`
--
ALTER TABLE `tablero_notificaciones_whatsapp`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tarea_id` (`tarea_id`),
  ADD KEY `solicitud_cambio_id` (`solicitud_cambio_id`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_tipo` (`tipo`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`);

--
-- Indices de la tabla `tablero_solicitudes_cambio_tarea`
--
ALTER TABLE `tablero_solicitudes_cambio_tarea`
  ADD PRIMARY KEY (`id`),
  ADD KEY `tarea_id` (`tarea_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `revisado_por` (`revisado_por`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_fecha_solicitud` (`fecha_solicitud`);

--
-- Indices de la tabla `tablero_tareas`
--
ALTER TABLE `tablero_tareas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `creado_por` (`creado_por`),
  ADD KEY `actualizado_por` (`actualizado_por`),
  ADD KEY `idx_asignado_a` (`asignado_a`),
  ADD KEY `idx_estado` (`estado`),
  ADD KEY `idx_prioridad` (`prioridad`),
  ADD KEY `idx_categoria` (`categoria`),
  ADD KEY `idx_fecha_vencimiento` (`fecha_vencimiento`),
  ADD KEY `idx_fecha_creacion` (`fecha_creacion`),
  ADD KEY `idx_tablero_tareas_compuesto` (`estado`,`prioridad`,`asignado_a`);

--
-- Indices de la tabla `tablero_tarea_colaboradores`
--
ALTER TABLE `tablero_tarea_colaboradores`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_tarea_colaborador` (`tarea_id`,`usuario_id`),
  ADD KEY `usuario_id` (`usuario_id`),
  ADD KEY `agregado_por` (`agregado_por`);

--
-- Indices de la tabla `tbl_estados`
--
ALTER TABLE `tbl_estados`
  ADD PRIMARY KEY (`est_id`);

--
-- Indices de la tabla `tbl_notificaciones`
--
ALTER TABLE `tbl_notificaciones`
  ADD PRIMARY KEY (`not_id`),
  ADD KEY `idx_usuario_visto` (`usu_id`,`not_visto`),
  ADD KEY `idx_fecha` (`not_fec_env`);

--
-- Indices de la tabla `tbl_perfil`
--
ALTER TABLE `tbl_perfil`
  ADD PRIMARY KEY (`prf_id`),
  ADD KEY `est_id` (`est_id`);

--
-- Indices de la tabla `tbl_perfil_ventanas`
--
ALTER TABLE `tbl_perfil_ventanas`
  ADD PRIMARY KEY (`pv_id`),
  ADD UNIQUE KEY `unique_perfil_ventana` (`prf_id`,`ven_id`),
  ADD KEY `ven_id` (`ven_id`);

--
-- Indices de la tabla `tbl_permisos_usuarios`
--
ALTER TABLE `tbl_permisos_usuarios`
  ADD PRIMARY KEY (`pu_id`),
  ADD UNIQUE KEY `unique_usuario_permiso` (`usu_id`,`per_id`);

--
-- Indices de la tabla `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  ADD PRIMARY KEY (`usu_id`),
  ADD UNIQUE KEY `usu_correo` (`usu_correo`),
  ADD UNIQUE KEY `usu_usuario` (`usu_usuario`),
  ADD KEY `prf_id` (`prf_id`),
  ADD KEY `idx_correo` (`usu_correo`),
  ADD KEY `idx_usuario` (`usu_usuario`),
  ADD KEY `idx_estado` (`est_id`);

--
-- Indices de la tabla `tbl_usuarios_ventanas`
--
ALTER TABLE `tbl_usuarios_ventanas`
  ADD PRIMARY KEY (`uv_id`),
  ADD UNIQUE KEY `unique_usuario_ventana` (`usu_id`,`ven_id`),
  ADD KEY `ven_id` (`ven_id`);

--
-- Indices de la tabla `tbl_ventanas`
--
ALTER TABLE `tbl_ventanas`
  ADD PRIMARY KEY (`ven_id`),
  ADD KEY `est_id` (`est_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tablero_archivos_adjuntos_tarea`
--
ALTER TABLE `tablero_archivos_adjuntos_tarea`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tablero_comentarios_tarea`
--
ALTER TABLE `tablero_comentarios_tarea`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tablero_configuraciones`
--
ALTER TABLE `tablero_configuraciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tablero_desarrolladores`
--
ALTER TABLE `tablero_desarrolladores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tablero_historial_tareas`
--
ALTER TABLE `tablero_historial_tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tablero_notificaciones_whatsapp`
--
ALTER TABLE `tablero_notificaciones_whatsapp`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tablero_solicitudes_cambio_tarea`
--
ALTER TABLE `tablero_solicitudes_cambio_tarea`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tablero_tareas`
--
ALTER TABLE `tablero_tareas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tablero_tarea_colaboradores`
--
ALTER TABLE `tablero_tarea_colaboradores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_estados`
--
ALTER TABLE `tbl_estados`
  MODIFY `est_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `tbl_notificaciones`
--
ALTER TABLE `tbl_notificaciones`
  MODIFY `not_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tbl_perfil`
--
ALTER TABLE `tbl_perfil`
  MODIFY `prf_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tbl_perfil_ventanas`
--
ALTER TABLE `tbl_perfil_ventanas`
  MODIFY `pv_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `tbl_permisos_usuarios`
--
ALTER TABLE `tbl_permisos_usuarios`
  MODIFY `pu_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  MODIFY `usu_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `tbl_usuarios_ventanas`
--
ALTER TABLE `tbl_usuarios_ventanas`
  MODIFY `uv_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=40;

--
-- AUTO_INCREMENT de la tabla `tbl_ventanas`
--
ALTER TABLE `tbl_ventanas`
  MODIFY `ven_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tablero_archivos_adjuntos_tarea`
--
ALTER TABLE `tablero_archivos_adjuntos_tarea`
  ADD CONSTRAINT `tablero_archivos_adjuntos_tarea_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tablero_tareas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tablero_archivos_adjuntos_tarea_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tablero_comentarios_tarea`
--
ALTER TABLE `tablero_comentarios_tarea`
  ADD CONSTRAINT `tablero_comentarios_tarea_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tablero_tareas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tablero_comentarios_tarea_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tablero_configuraciones`
--
ALTER TABLE `tablero_configuraciones`
  ADD CONSTRAINT `tablero_configuraciones_ibfk_1` FOREIGN KEY (`actualizado_por`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tablero_desarrolladores`
--
ALTER TABLE `tablero_desarrolladores`
  ADD CONSTRAINT `tablero_desarrolladores_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tablero_historial_tareas`
--
ALTER TABLE `tablero_historial_tareas`
  ADD CONSTRAINT `tablero_historial_tareas_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tablero_tareas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tablero_historial_tareas_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tablero_notificaciones_whatsapp`
--
ALTER TABLE `tablero_notificaciones_whatsapp`
  ADD CONSTRAINT `tablero_notificaciones_whatsapp_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tablero_tareas` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tablero_notificaciones_whatsapp_ibfk_2` FOREIGN KEY (`solicitud_cambio_id`) REFERENCES `tablero_solicitudes_cambio_tarea` (`id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tablero_solicitudes_cambio_tarea`
--
ALTER TABLE `tablero_solicitudes_cambio_tarea`
  ADD CONSTRAINT `tablero_solicitudes_cambio_tarea_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tablero_tareas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tablero_solicitudes_cambio_tarea_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tablero_solicitudes_cambio_tarea_ibfk_3` FOREIGN KEY (`revisado_por`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tablero_tareas`
--
ALTER TABLE `tablero_tareas`
  ADD CONSTRAINT `tablero_tareas_ibfk_1` FOREIGN KEY (`asignado_a`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `tablero_tareas_ibfk_2` FOREIGN KEY (`creado_por`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tablero_tareas_ibfk_3` FOREIGN KEY (`actualizado_por`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tablero_tarea_colaboradores`
--
ALTER TABLE `tablero_tarea_colaboradores`
  ADD CONSTRAINT `tablero_tarea_colaboradores_ibfk_1` FOREIGN KEY (`tarea_id`) REFERENCES `tablero_tareas` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tablero_tarea_colaboradores_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tablero_tarea_colaboradores_ibfk_3` FOREIGN KEY (`agregado_por`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE SET NULL;

--
-- Filtros para la tabla `tbl_notificaciones`
--
ALTER TABLE `tbl_notificaciones`
  ADD CONSTRAINT `tbl_notificaciones_ibfk_1` FOREIGN KEY (`usu_id`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tbl_perfil`
--
ALTER TABLE `tbl_perfil`
  ADD CONSTRAINT `tbl_perfil_ibfk_1` FOREIGN KEY (`est_id`) REFERENCES `tbl_estados` (`est_id`);

--
-- Filtros para la tabla `tbl_perfil_ventanas`
--
ALTER TABLE `tbl_perfil_ventanas`
  ADD CONSTRAINT `tbl_perfil_ventanas_ibfk_1` FOREIGN KEY (`prf_id`) REFERENCES `tbl_perfil` (`prf_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_perfil_ventanas_ibfk_2` FOREIGN KEY (`ven_id`) REFERENCES `tbl_ventanas` (`ven_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tbl_permisos_usuarios`
--
ALTER TABLE `tbl_permisos_usuarios`
  ADD CONSTRAINT `tbl_permisos_usuarios_ibfk_1` FOREIGN KEY (`usu_id`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tbl_usuarios`
--
ALTER TABLE `tbl_usuarios`
  ADD CONSTRAINT `tbl_usuarios_ibfk_1` FOREIGN KEY (`est_id`) REFERENCES `tbl_estados` (`est_id`),
  ADD CONSTRAINT `tbl_usuarios_ibfk_2` FOREIGN KEY (`prf_id`) REFERENCES `tbl_perfil` (`prf_id`);

--
-- Filtros para la tabla `tbl_usuarios_ventanas`
--
ALTER TABLE `tbl_usuarios_ventanas`
  ADD CONSTRAINT `tbl_usuarios_ventanas_ibfk_1` FOREIGN KEY (`usu_id`) REFERENCES `tbl_usuarios` (`usu_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `tbl_usuarios_ventanas_ibfk_2` FOREIGN KEY (`ven_id`) REFERENCES `tbl_ventanas` (`ven_id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `tbl_ventanas`
--
ALTER TABLE `tbl_ventanas`
  ADD CONSTRAINT `tbl_ventanas_ibfk_1` FOREIGN KEY (`est_id`) REFERENCES `tbl_estados` (`est_id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
