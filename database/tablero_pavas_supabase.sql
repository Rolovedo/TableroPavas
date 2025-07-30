-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.
-- Created on: July 30, 2025
-- Base de datos para el tablero de tareas en Supabase

CREATE TABLE public.tablero_archivos_adjuntos_tarea (
  id integer NOT NULL DEFAULT nextval('tablero_archivos_adjuntos_tarea_id_seq'::regclass),
  tarea_id integer NOT NULL,
  usuario_id integer NOT NULL,
  nombre_archivo character varying NOT NULL,
  ruta_archivo character varying NOT NULL,
  tamaño_archivo integer,
  tipo_archivo character varying,
  fecha_subida timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tablero_archivos_adjuntos_tarea_pkey PRIMARY KEY (id),
  CONSTRAINT tablero_archivos_adjuntos_tarea_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tablero_tareas(id),
  CONSTRAINT tablero_archivos_adjuntos_tarea_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tablero_comentarios_tarea (
  id integer NOT NULL DEFAULT nextval('tablero_comentarios_tarea_id_seq'::regclass),
  tarea_id integer NOT NULL,
  usuario_id integer NOT NULL,
  comentario text NOT NULL,
  es_interno boolean DEFAULT false,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tablero_comentarios_tarea_pkey PRIMARY KEY (id),
  CONSTRAINT tablero_comentarios_tarea_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tablero_tareas(id),
  CONSTRAINT tablero_comentarios_tarea_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tablero_configuraciones (
  id integer NOT NULL DEFAULT nextval('tablero_configuraciones_id_seq'::regclass),
  clave_configuracion character varying NOT NULL UNIQUE,
  valor_configuracion text,
  descripcion text,
  actualizado_por integer,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tablero_configuraciones_pkey PRIMARY KEY (id),
  CONSTRAINT tablero_configuraciones_actualizado_por_fkey FOREIGN KEY (actualizado_por) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tablero_desarrolladores (
  id integer NOT NULL DEFAULT nextval('tablero_desarrolladores_id_seq'::regclass),
  usuario_id integer NOT NULL,
  rol character varying NOT NULL DEFAULT 'desarrollador'::character varying,
  nivel character varying NOT NULL DEFAULT 'junior'::character varying,
  habilidades jsonb,
  capacidad_maxima integer NOT NULL DEFAULT 40,
  calificacion_eficiencia numeric DEFAULT 0.85,
  esta_activo boolean DEFAULT true,
  avatar character varying,
  telefono character varying,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tablero_desarrolladores_pkey PRIMARY KEY (id),
  CONSTRAINT tablero_desarrolladores_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tablero_historial_tareas (
  id integer NOT NULL DEFAULT nextval('tablero_historial_tareas_id_seq'::regclass),
  tarea_id integer NOT NULL,
  usuario_id integer NOT NULL,
  accion character varying NOT NULL,
  valor_anterior text,
  valor_nuevo text,
  notas text,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tablero_historial_tareas_pkey PRIMARY KEY (id),
  CONSTRAINT tablero_historial_tareas_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tablero_tareas(id),
  CONSTRAINT tablero_historial_tareas_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tablero_notificaciones_whatsapp (
  id integer NOT NULL DEFAULT nextval('tablero_notificaciones_whatsapp_id_seq'::regclass),
  tarea_id integer,
  solicitud_cambio_id integer,
  telefono_destinatario character varying NOT NULL,
  mensaje text NOT NULL,
  tipo character varying,
  estado character varying DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'enviado'::character varying, 'fallido'::character varying]::text[])),
  fecha_envio timestamp without time zone,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tablero_notificaciones_whatsapp_pkey PRIMARY KEY (id),
  CONSTRAINT tablero_notificaciones_whatsapp_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tablero_tareas(id),
  CONSTRAINT tablero_notificaciones_whatsapp_solicitud_cambio_id_fkey FOREIGN KEY (solicitud_cambio_id) REFERENCES public.tablero_solicitudes_cambio_tarea(id)
);
CREATE TABLE public.tablero_solicitudes_cambio_tarea (
  id integer NOT NULL DEFAULT nextval('tablero_solicitudes_cambio_tarea_id_seq'::regclass),
  tarea_id integer NOT NULL,
  usuario_id integer NOT NULL,
  estado_anterior character varying,
  estado_solicitado character varying,
  motivo text,
  estado character varying DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'aprobado'::character varying, 'rechazado'::character varying]::text[])),
  fecha_solicitud timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_revision timestamp without time zone,
  revisado_por integer,
  notas_revisor text,
  CONSTRAINT tablero_solicitudes_cambio_tarea_pkey PRIMARY KEY (id),
  CONSTRAINT tablero_solicitudes_cambio_tarea_revisado_por_fkey FOREIGN KEY (revisado_por) REFERENCES public.tbl_usuarios(usu_id),
  CONSTRAINT tablero_solicitudes_cambio_tarea_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tablero_tareas(id),
  CONSTRAINT tablero_solicitudes_cambio_tarea_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tablero_tarea_colaboradores (
  id integer NOT NULL DEFAULT nextval('tablero_tarea_colaboradores_id_seq'::regclass),
  tarea_id integer NOT NULL,
  usuario_id integer NOT NULL,
  fecha_agregado timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  agregado_por integer,
  CONSTRAINT tablero_tarea_colaboradores_pkey PRIMARY KEY (id),
  CONSTRAINT tablero_tarea_colaboradores_tarea_id_fkey FOREIGN KEY (tarea_id) REFERENCES public.tablero_tareas(id),
  CONSTRAINT tablero_tarea_colaboradores_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES public.tbl_usuarios(usu_id),
  CONSTRAINT tablero_tarea_colaboradores_agregado_por_fkey FOREIGN KEY (agregado_por) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tablero_tareas (
  id integer NOT NULL DEFAULT nextval('tablero_tareas_id_seq'::regclass),
  titulo character varying NOT NULL,
  descripcion text,
  asignado_a integer,
  prioridad character varying DEFAULT 'media'::character varying CHECK (prioridad::text = ANY (ARRAY['baja'::character varying, 'media'::character varying, 'alta'::character varying, 'muy-alta'::character varying]::text[])),
  estado character varying DEFAULT 'pendiente'::character varying CHECK (estado::text = ANY (ARRAY['pendiente'::character varying, 'por-hacer'::character varying, 'en-progreso'::character varying, 'revision'::character varying, 'completada'::character varying]::text[])),
  categoria character varying,
  fecha_vencimiento date,
  horas_estimadas integer DEFAULT 0,
  horas_reales integer DEFAULT 0,
  progreso integer DEFAULT 0,
  habilidades_requeridas jsonb,
  creado_por integer NOT NULL,
  actualizado_por integer,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tablero_tareas_pkey PRIMARY KEY (id),
  CONSTRAINT tablero_tareas_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES public.tbl_usuarios(usu_id),
  CONSTRAINT tablero_tareas_creado_por_fkey FOREIGN KEY (creado_por) REFERENCES public.tbl_usuarios(usu_id),
  CONSTRAINT tablero_tareas_actualizado_por_fkey FOREIGN KEY (actualizado_por) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tbl_estados (
  est_id integer NOT NULL DEFAULT nextval('tbl_estados_est_id_seq'::regclass),
  est_nombre character varying NOT NULL,
  est_descripcion character varying,
  est_color character varying DEFAULT '#007bff'::character varying,
  CONSTRAINT tbl_estados_pkey PRIMARY KEY (est_id)
);
CREATE TABLE public.tbl_notificaciones (
  not_id integer NOT NULL DEFAULT nextval('tbl_notificaciones_not_id_seq'::regclass),
  usu_id integer NOT NULL,
  not_titulo character varying NOT NULL,
  not_mensaje text NOT NULL,
  not_tipo character varying DEFAULT 'info'::character varying CHECK (not_tipo::text = ANY (ARRAY['info'::character varying, 'warning'::character varying, 'error'::character varying, 'success'::character varying]::text[])),
  not_visto boolean DEFAULT false,
  not_fec_env timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  not_fec_visto timestamp without time zone,
  not_datos_extra jsonb,
  CONSTRAINT tbl_notificaciones_pkey PRIMARY KEY (not_id),
  CONSTRAINT tbl_notificaciones_usu_id_fkey FOREIGN KEY (usu_id) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tbl_perfil (
  prf_id integer NOT NULL DEFAULT nextval('tbl_perfil_prf_id_seq'::regclass),
  prf_nombre character varying NOT NULL,
  prf_descripcion character varying,
  est_id integer DEFAULT 1,
  CONSTRAINT tbl_perfil_pkey PRIMARY KEY (prf_id),
  CONSTRAINT tbl_perfil_est_id_fkey FOREIGN KEY (est_id) REFERENCES public.tbl_estados(est_id)
);
CREATE TABLE public.tbl_perfil_ventanas (
  pv_id integer NOT NULL DEFAULT nextval('tbl_perfil_ventanas_pv_id_seq'::regclass),
  prf_id integer NOT NULL,
  ven_id integer NOT NULL,
  pv_activo boolean DEFAULT true,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tbl_perfil_ventanas_pkey PRIMARY KEY (pv_id),
  CONSTRAINT tbl_perfil_ventanas_prf_id_fkey FOREIGN KEY (prf_id) REFERENCES public.tbl_perfil(prf_id),
  CONSTRAINT tbl_perfil_ventanas_ven_id_fkey FOREIGN KEY (ven_id) REFERENCES public.tbl_ventanas(ven_id)
);
CREATE TABLE public.tbl_permisos_usuarios (
  pu_id integer NOT NULL DEFAULT nextval('tbl_permisos_usuarios_pu_id_seq'::regclass),
  usu_id integer NOT NULL,
  per_id integer NOT NULL,
  fecha_asignacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tbl_permisos_usuarios_pkey PRIMARY KEY (pu_id),
  CONSTRAINT tbl_permisos_usuarios_usu_id_fkey FOREIGN KEY (usu_id) REFERENCES public.tbl_usuarios(usu_id)
);
CREATE TABLE public.tbl_usuarios (
  usu_id integer NOT NULL DEFAULT nextval('tbl_usuarios_usu_id_seq'::regclass),
  usu_foto character varying,
  usu_nombre character varying NOT NULL,
  usu_apellido character varying,
  usu_correo character varying NOT NULL UNIQUE,
  usu_usuario character varying,
  usu_clave character varying NOT NULL,
  usu_telefono character varying,
  usu_documento character varying,
  est_id integer DEFAULT 1,
  prf_id integer NOT NULL,
  usu_agenda boolean DEFAULT false,
  usu_instructor boolean DEFAULT false,
  usu_cambio boolean DEFAULT false,
  fecha_creacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  fecha_actualizacion timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT tbl_usuarios_pkey PRIMARY KEY (usu_id),
  CONSTRAINT tbl_usuarios_est_id_fkey FOREIGN KEY (est_id) REFERENCES public.tbl_estados(est_id),
  CONSTRAINT tbl_usuarios_prf_id_fkey FOREIGN KEY (prf_id) REFERENCES public.tbl_perfil(prf_id)
);
CREATE TABLE public.tbl_usuarios_ventanas (
  uv_id integer NOT NULL DEFAULT nextval('tbl_usuarios_ventanas_uv_id_seq'::regclass),
  usu_id integer NOT NULL,
  ven_id integer NOT NULL,
  CONSTRAINT tbl_usuarios_ventanas_pkey PRIMARY KEY (uv_id),
  CONSTRAINT tbl_usuarios_ventanas_usu_id_fkey FOREIGN KEY (usu_id) REFERENCES public.tbl_usuarios(usu_id),
  CONSTRAINT tbl_usuarios_ventanas_ven_id_fkey FOREIGN KEY (ven_id) REFERENCES public.tbl_ventanas(ven_id)
);
CREATE TABLE public.tbl_ventanas (
  ven_id integer NOT NULL DEFAULT nextval('tbl_ventanas_ven_id_seq'::regclass),
  ven_nombre character varying NOT NULL,
  ven_descripcion character varying,
  ven_ruta character varying,
  ven_url character varying,
  ven_icono character varying,
  ven_orden integer DEFAULT 0,
  ven_padre integer DEFAULT 0,
  est_id integer DEFAULT 1,
  CONSTRAINT tbl_ventanas_pkey PRIMARY KEY (ven_id),
  CONSTRAINT tbl_ventanas_est_id_fkey FOREIGN KEY (est_id) REFERENCES public.tbl_estados(est_id)
);