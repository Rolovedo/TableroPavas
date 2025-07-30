import authService from './auth.service';

class TareasService {
    constructor() {
        this.baseURL = authService.baseURL;
    }

    // Hacer peticiones autenticadas
    async makeRequest(endpoint, options = {}) {
        const token = authService.getTableroToken();
        
        const defaultHeaders = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        try {
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    ...defaultHeaders,
                    ...options.headers
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`Error en petición a ${endpoint}:`, error);
            throw error;
        }
    }

    // Obtener todas las tareas
    async obtenerTareas() {
        try {
            console.log('🔍 Cargando tareas desde la base de datos...');
            const response = await this.makeRequest('/api/tablero/tareas');
            
            if (response.success) {
                // Organizar tareas por estado para el tablero Kanban
                const tareasPorEstado = {
                    backlog: [],
                    todo: [],
                    inProgress: [],
                    review: [],
                    done: []
                };

                // Mapear estados de la BD a estados del frontend
                const estadoMap = {
                    'pendiente': 'backlog',
                    'por-hacer': 'todo', 
                    'en-progreso': 'inProgress',
                    'revision': 'review',
                    'completada': 'done'
                };

                response.tareas.forEach(tarea => {
                    const estadoFrontend = estadoMap[tarea.status] || 'backlog';
                    tareasPorEstado[estadoFrontend].push(tarea);
                });

                console.log('✅ Tareas organizadas por estado:', tareasPorEstado);
                return tareasPorEstado;
            } else {
                throw new Error(response.message || 'Error al cargar tareas');
            }
        } catch (error) {
            console.error('❌ Error cargando tareas:', error);
            throw error;
        }
    }

    // Crear nueva tarea
    async crearTarea(tareaData) {
        try {
            console.log('📝 Creando nueva tarea:', tareaData);
            
            // Mapear datos del frontend a formato de BD
            const tareaParaBD = {
                titulo: tareaData.title,
                descripcion: tareaData.description,
                asignado_a: tareaData.assignee?.id,
                prioridad: this.mapPriorityToDatabase(tareaData.priority),
                estado: this.mapStatusToDatabase(tareaData.status || 'backlog'),
                categoria: tareaData.category,
                fecha_vencimiento: tareaData.dueDate ? this.formatDate(tareaData.dueDate) : null,
                horas_estimadas: tareaData.estimatedHours || 0,
                habilidades_requeridas: tareaData.requiredSkills || [],
                creado_por: authService.getTableroUser()?.usu_id || 1
            };

            const response = await this.makeRequest('/api/tablero/tareas', {
                method: 'POST',
                body: JSON.stringify(tareaParaBD)
            });

            if (response.success) {
                console.log('✅ Tarea creada exitosamente:', response.tarea);
                return response.tarea;
            } else {
                throw new Error(response.message || 'Error al crear tarea');
            }
        } catch (error) {
            console.error('❌ Error creando tarea:', error);
            throw error;
        }
    }

    // Actualizar tarea (incluye drag & drop)
    async actualizarTarea(tareaId, cambios) {
        try {
            console.log(`📝 Actualizando tarea ${tareaId}:`, cambios);
            
            // Mapear cambios del frontend a formato de BD
            const cambiosParaBD = {};
            
            if (cambios.title !== undefined) cambiosParaBD.titulo = cambios.title;
            if (cambios.description !== undefined) cambiosParaBD.descripcion = cambios.description;
            if (cambios.assignee !== undefined) cambiosParaBD.asignado_a = cambios.assignee?.id;
            if (cambios.priority !== undefined) cambiosParaBD.prioridad = this.mapPriorityToDatabase(cambios.priority);
            if (cambios.status !== undefined) cambiosParaBD.estado = this.mapStatusToDatabase(cambios.status);
            if (cambios.category !== undefined) cambiosParaBD.categoria = cambios.category;
            if (cambios.dueDate !== undefined) cambiosParaBD.fecha_vencimiento = cambios.dueDate ? this.formatDate(cambios.dueDate) : null;
            if (cambios.estimatedHours !== undefined) cambiosParaBD.horas_estimadas = cambios.estimatedHours;
            if (cambios.actualHours !== undefined) cambiosParaBD.horas_reales = cambios.actualHours;
            if (cambios.progress !== undefined) cambiosParaBD.progreso = cambios.progress;
            if (cambios.requiredSkills !== undefined) cambiosParaBD.habilidades_requeridas = cambios.requiredSkills;
            
            cambiosParaBD.actualizado_por = authService.getTableroUser()?.usu_id || 1;

            const response = await this.makeRequest(`/api/tablero/tareas/${tareaId}`, {
                method: 'PUT',
                body: JSON.stringify(cambiosParaBD)
            });

            if (response.success) {
                console.log(`✅ Tarea ${tareaId} actualizada exitosamente`);
                return response.tarea;
            } else {
                throw new Error(response.message || 'Error al actualizar tarea');
            }
        } catch (error) {
            console.error(`❌ Error actualizando tarea ${tareaId}:`, error);
            throw error;
        }
    }

    // Obtener desarrolladores disponibles
    async obtenerDesarrolladores() {
        try {
            console.log('👥 Cargando desarrolladores...');
            const response = await this.makeRequest('/api/tablero/desarrolladores');
            
            if (response.success) {
                console.log('✅ Desarrolladores cargados:', response.desarrolladores.length);
                return response.desarrolladores;
            } else {
                throw new Error(response.message || 'Error al cargar desarrolladores');
            }
        } catch (error) {
            console.error('❌ Error cargando desarrolladores:', error);
            throw error;
        }
    }

    // Métodos auxiliares para mapear entre frontend y backend
    mapPriorityToDatabase(priority) {
        const priorityMap = {
            'low': 'baja',
            'medium': 'media', 
            'high': 'alta',
            'very-high': 'muy-alta'
        };
        return priorityMap[priority] || 'media';
    }

    mapStatusToDatabase(status) {
        const statusMap = {
            'backlog': 'pendiente',
            'todo': 'por-hacer',
            'inProgress': 'en-progreso',
            'review': 'revision',
            'done': 'completada'
        };
        return statusMap[status] || 'pendiente';
    }

    formatDate(date) {
        if (date instanceof Date) {
            return date.toISOString().split('T')[0];
        }
        return date;
    }
}

// Exportar instancia singleton
const tareasService = new TareasService();
export default tareasService;
