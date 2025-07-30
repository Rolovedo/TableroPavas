import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card } from 'primereact/card';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Dropdown } from 'primereact/dropdown';
import { Calendar } from 'primereact/calendar';
import { InputTextarea } from 'primereact/inputtextarea';
import { Badge } from 'primereact/badge';
import { Avatar } from 'primereact/avatar';
import { Chip } from 'primereact/chip';
import { Toast } from 'primereact/toast';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import Layout from '@components/layout/Layout';
import authService from '../../services/auth.service';
import tareasService from '../../services/tareas.service';
import './tableroBoard.scss';

const TableroBoard = () => {
    const toast = useRef(null);

    // Estados principales
    const [tasks, setTasks] = useState({
        backlog: [],
        todo: [],
        inProgress: [],
        review: [],
        done: []
    });

    const [developers, setDevelopers] = useState([]);

    const [showTaskDialog, setShowTaskDialog] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [selectedColumn, setSelectedColumn] = useState('backlog');
    const [loading, setLoading] = useState(false);

    // Estados del formulario
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        assignee: null,
        priority: null,
        dueDate: null,
        category: null,
        estimatedHours: 0,
        actualHours: 0,
        requiredSkills: [],
    });

    // Opciones para dropdowns
    // Los valores deben coincidir con los del backend: 'baja', 'media', 'alta', 'muy-alta'
    const priorityOptions = [
        { label: 'Baja', value: 'baja', color: '#28a745' },
        { label: 'Media', value: 'media', color: '#17a2b8' },
        { label: 'Alta', value: 'alta', color: '#ffc107' },
        { label: 'Muy Alta', value: 'muy-alta', color: '#dc3545' }
    ];

    const categoryOptions = [
        { label: 'Frontend', value: 'frontend' },
        { label: 'Backend', value: 'backend' },
        { label: 'Database', value: 'database' },
        { label: 'Testing', value: 'testing' },
        { label: 'DevOps', value: 'devops' }
    ];

    // Funciones de utilidad
    const showToastMessage = (severity, summary, detail) => {
        if (toast.current) {
            toast.current.show({ severity, summary, detail });
        }
    };

    // Cargar tareas desde la base de datos
    const loadTasks = useCallback(async () => {
        try {
            setLoading(true);
            console.log('📡 Cargando tareas desde base de datos...');
            
            const tareasPorEstado = await tareasService.obtenerTareas();
            setTasks(tareasPorEstado);
            
            console.log('✅ Tareas cargadas exitosamente');
            
        } catch (error) {
            console.error('Error cargando tareas:', error);
            showToastMessage('error', 'Error', 'No se pudieron cargar las tareas desde la base de datos');
            
            // Fallback a tareas simuladas si hay error de conexión
            const mockTasks = {
                backlog: [
                    {
                        id: 'mock-1',
                        title: 'Configurar autenticación JWT',
                        description: 'Implementar sistema de autenticación con tokens JWT',
                        assignee: developers[0] || { id: 1, name: 'Juan Pérez', avatar: 'JP' },
                        priority: 'high',
                        dueDate: new Date('2024-02-15'),
                        category: 'backend',
                        estimatedHours: 8,
                        createdBy: 'Admin',
                        createdAt: new Date()
                    }
                ],
                todo: [],
                inProgress: [],
                review: [],
                done: []
            };
            setTasks(mockTasks);
        } finally {
            setLoading(false);
        }
    }, [developers]);

    // Crear nueva tarea en la base de datos
    const createTask = async () => {
        try {
            setLoading(true);
            console.log('🔍 Creando nueva tarea...');
            if (!newTask.title || !newTask.assignee) {
                showToastMessage('warn', 'Campos Requeridos', 'Título y asignado son obligatorios');
                return;
            }
            const user = authService.getTableroUser();
            const taskToCreate = {
                title: newTask.title,
                description: newTask.description,
                assignee: newTask.assignee,
                priority: newTask.priority && newTask.priority.value ? newTask.priority.value : 'media',
                status: selectedColumn,
                category: newTask.category && newTask.category.value ? newTask.category.value : 'sin-categoria',
                dueDate: newTask.dueDate,
                estimatedHours: newTask.estimatedHours || 0,
                actualHours: newTask.actualHours || 0,
                requiredSkills: newTask.requiredSkills,
                createdBy: user?.id || user?.usuId || 1,
                updatedBy: user?.id || user?.usuId || 1
            };
            const tareaCreada = await tareasService.crearTarea(taskToCreate);
            setTasks(prevTasks => ({
                ...prevTasks,
                [selectedColumn]: [...prevTasks[selectedColumn], {
                    ...tareaCreada,
                    assignee: newTask.assignee,
                    priority: newTask.priority && newTask.priority.value ? newTask.priority.value : 'media',
                    category: newTask.category && newTask.category.value ? newTask.category.value : 'sin-categoria',
                    dueDate: newTask.dueDate,
                    estimatedHours: newTask.estimatedHours || 0,
                    actualHours: newTask.actualHours || 0,
                    requiredSkills: newTask.requiredSkills,
                    createdBy: user?.nombre || 'Usuario',
                    createdAt: new Date()
                }]
            }));
            setNewTask({
                title: '',
                description: '',
                assignee: null,
                priority: null,
                dueDate: null,
                category: null,
                estimatedHours: 0,
                actualHours: 0,
                requiredSkills: []
            });
            setShowTaskDialog(false);
            showToastMessage('success', 'Tarea Creada', 'La tarea se ha creado exitosamente en la base de datos');
            console.log('✅ Tarea creada exitosamente:', tareaCreada);
        } catch (error) {
            console.error('Error creando tarea:', error);
            showToastMessage('error', 'Error', 'No se pudo crear la tarea en la base de datos');
        } finally {
            setLoading(false);
        }
    };

    // Manejar drag and drop con actualización en base de datos
    const onDragEnd = async (result) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (destination.droppableId === source.droppableId && destination.index === source.index) {
            return;
        }

        const start = tasks[source.droppableId];
        const finish = tasks[destination.droppableId];

        if (start === finish) {
            // Mover dentro de la misma columna
            const newTaskIds = Array.from(start);
            const task = newTaskIds.find(t => t.id.toString() === draggableId);
            newTaskIds.splice(source.index, 1);
            newTaskIds.splice(destination.index, 0, task);

            setTasks(prev => ({
                ...prev,
                [source.droppableId]: newTaskIds
            }));
        } else {
            // Mover entre columnas diferentes
            const startTaskIds = Array.from(start);
            const task = startTaskIds.find(t => t.id.toString() === draggableId);
            startTaskIds.splice(source.index, 1);

            const finishTaskIds = Array.from(finish);
            finishTaskIds.splice(destination.index, 0, task);

            // Actualizar estado local inmediatamente
            setTasks(prev => ({
                ...prev,
                [source.droppableId]: startTaskIds,
                [destination.droppableId]: finishTaskIds
            }));

            // Actualizar en la base de datos
            try {
                await tareasService.actualizarTarea(task.id, {
                    status: destination.droppableId
                });

                showToastMessage('success', 'Tarea Movida', `Tarea movida a ${destination.droppableId}`);
                console.log(`✅ Tarea ${task.id} movida a ${destination.droppableId} en la BD`);
            } catch (error) {
                console.error('Error actualizando tarea en BD:', error);
                // Revertir el cambio local si falla la actualización en BD
                setTasks(prev => ({
                    ...prev,
                    [source.droppableId]: [...prev[source.droppableId], task],
                    [destination.droppableId]: prev[destination.droppableId].filter(t => t.id !== task.id)
                }));
                showToastMessage('error', 'Error', 'No se pudo actualizar la tarea en la base de datos');
            }
        }
    };

    // Cargar desarrolladores desde la base de datos
    const loadDevelopers = useCallback(async () => {
        try {
            console.log('👥 Cargando desarrolladores desde base de datos...');
            const desarrolladores = await tareasService.obtenerDesarrolladores();
            setDevelopers(desarrolladores);
            console.log('✅ Desarrolladores cargados:', desarrolladores.length);
        } catch (error) {
            console.error('Error cargando desarrolladores:', error);
            // Fallback a desarrolladores simulados
            const mockDevelopers = [
                { id: 1, name: 'Juan Pérez', email: 'juan@empresa.com', avatar: 'JP' },
                { id: 2, name: 'María García', email: 'maria@empresa.com', avatar: 'MG' },
                { id: 3, name: 'Carlos López', email: 'carlos@empresa.com', avatar: 'CL' }
            ];
            setDevelopers(mockDevelopers);
        }
    }, []);

    useEffect(() => {
        console.log("🎯 TABLERO KANBAN CARGADO EXITOSAMENTE!");
        
        if (!authService.isTableroAuthenticated()) {
            if (!authService.useExistingPontoAuth()) {
                authService.setDevelopmentAuth();
            }
        }
        
        // Cargar desarrolladores primero, luego tareas
        loadDevelopers();
    }, [loadDevelopers]);

    useEffect(() => {
        // Cargar tareas cuando los desarrolladores estén listos
        if (developers.length > 0) {
            loadTasks();
        }
    }, [developers, loadTasks]);

    const columns = [
        { id: 'backlog', title: 'Backlog', color: '#6c757d' },
        { id: 'todo', title: 'Por Hacer', color: '#007bff' },
        { id: 'inProgress', title: 'En Progreso', color: '#ffc107' },
        { id: 'review', title: 'En Revisión', color: '#17a2b8' },
        { id: 'done', title: 'Completado', color: '#28a745' }
    ];

    const renderTaskCard = (task, index) => (
        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`task-card ${snapshot.isDragging ? 'dragging' : ''}`}
                >
                    <Card className="task-card-content">
                        <div className="task-header">
                            <h4 className="task-title">{task.title}</h4>
                            <Badge 
                                value={
                                    priorityOptions.find(opt => opt.value === task.priority)?.label || task.priority
                                }
                                severity={
                                    task.priority === 'muy-alta' ? 'danger' :
                                    task.priority === 'alta' ? 'warning' :
                                    task.priority === 'media' ? 'info' :
                                    'success'
                                }
                            />
                        </div>
                        
                        {task.description && (
                            <p className="task-description">{task.description}</p>
                        )}
                        
                        <div className="task-footer">
                            <div className="task-assignee">
                                <Avatar 
                                    label={task.assignee?.avatar || task.assignee?.name?.substring(0, 2) || 'U'} 
                                    size="small" 
                                    style={{ backgroundColor: '#007bff' }}
                                />
                                <span>{task.assignee?.name || 'Sin asignar'}</span>
                            </div>
                            
                            {task.category && (
                                <Chip label={
                                    categoryOptions.find(opt => opt.value === task.category)?.label || task.category
                                } className="category-chip" />
                            )}
                        </div>
                        
                        {task.estimatedHours > 0 && (
                            <div className="task-hours">
                                <i className="pi pi-clock"></i>
                                <span>{task.estimatedHours}h</span>
                            </div>
                        )}
                    </Card>
                </div>
            )}
        </Draggable>
    );

    // ← ENVOLVER TODO EL CONTENIDO EN EL LAYOUT
    return (
        <Layout>
            <div className="tablero-board">
                <Toast ref={toast} />
                
                <div className="board-header">
                    <h1>
                        <span role="img" aria-label="tablero">📋</span> Tablero Kanban - PAVAS
                    </h1>
                    <Button 
                        label="➕ Nueva Tarea" 
                        className="p-button-success"
                        onClick={() => {
                            setSelectedColumn('backlog');
                            setShowTaskDialog(true);
                        }}
                    />
                </div>

                <DragDropContext onDragEnd={onDragEnd}>
                    <div className="board-columns">
                        {columns.map(column => (
                            <div key={column.id} className="board-column">
                                <div className="column-header" style={{ borderTopColor: column.color }}>
                                    <h3>{column.title}</h3>
                                    <Badge value={tasks[column.id]?.length || 0} />
                                </div>
                                
                                <Droppable droppableId={column.id}>
                                    {(provided, snapshot) => (
                                        <div
                                            ref={provided.innerRef}
                                            {...provided.droppableProps}
                                            className={`column-content ${snapshot.isDraggingOver ? 'drag-over' : ''}`}
                                        >
                                            {tasks[column.id]?.map((task, index) => 
                                                renderTaskCard(task, index)
                                            )}
                                            {provided.placeholder}
                                        </div>
                                    )}
                                </Droppable>
                            </div>
                        ))}
                    </div>
                </DragDropContext>

                <Dialog
                    visible={showTaskDialog}
                    style={{ width: '600px' }}
                    header={editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                    modal
                    onHide={() => {
                        setShowTaskDialog(false);
                        setEditingTask(null);
                    }}
                >
                    <div className="task-form">
                        <div className="p-field">
                            <label htmlFor="title">Título *</label>
                            <InputText
                                id="title"
                                value={newTask.title}
                                onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                                placeholder="Ingresa el título de la tarea"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="description">Descripción</label>
                            <InputTextarea
                                id="description"
                                value={newTask.description}
                                onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                                rows={3}
                                placeholder="Describe la tarea"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="assignee">Asignado a *</label>
                            <Dropdown
                                id="assignee"
                                value={newTask.assignee}
                                options={developers}
                                onChange={(e) => setNewTask(prev => ({ ...prev, assignee: e.value }))}
                                optionLabel="name"
                                placeholder="Selecciona un desarrollador"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="priority">Prioridad</label>
                            <Dropdown
                                id="priority"
                                value={newTask.priority}
                                options={priorityOptions}
                                onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.value }))}
                                optionLabel="label"
                                placeholder="Selecciona prioridad"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="category">Categoría</label>
                            <Dropdown
                                id="category"
                                value={newTask.category}
                                options={categoryOptions}
                                onChange={(e) => setNewTask(prev => ({ ...prev, category: e.value }))}
                                optionLabel="label"
                                placeholder="Selecciona categoría"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="estimatedHours">Horas Estimadas</label>
                            <InputText
                                id="estimatedHours"
                                type="number"
                                value={newTask.estimatedHours}
                                onChange={(e) => setNewTask(prev => ({ ...prev, estimatedHours: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="dueDate">Fecha de Vencimiento</label>
                            <Calendar
                                id="dueDate"
                                value={newTask.dueDate}
                                onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.value }))}
                                showIcon
                                dateFormat="dd/mm/yy"
                            />
                        </div>

                        <div className="p-field">
                            <label htmlFor="actualHours">Horas Reales</label>
                            <InputText
                                id="actualHours"
                                type="number"
                                value={newTask.actualHours}
                                onChange={(e) => setNewTask(prev => ({ ...prev, actualHours: parseInt(e.target.value) || 0 }))}
                                placeholder="0"
                            />
                        </div>
                        <div className="p-field">
                            <label htmlFor="requiredSkills">Habilidades Requeridas</label>
                            <InputText
                                id="requiredSkills"
                                value={newTask.requiredSkills.join(', ')}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    setNewTask(prev => ({ ...prev, requiredSkills: value.split(',').map(s => s.trim()).filter(Boolean) }));
                                }}
                                placeholder="Ej: React, Node, SQL"
                            />
                        </div>
                        <div className="form-buttons">
                            <Button 
                                label="Cancelar" 
                                className="p-button-secondary"
                                onClick={() => setShowTaskDialog(false)}
                            />
                            <Button 
                                label={editingTask ? 'Actualizar' : 'Crear Tarea'} 
                                className="p-button-success"
                                loading={loading}
                                onClick={createTask}
                            />
                        </div>
                    </div>
                </Dialog>
            </div>
        </Layout>
    );
};

export default TableroBoard;
