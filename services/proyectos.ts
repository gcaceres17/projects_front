import { apiClient } from '@/lib/api';

// Interfaces para proyectos
export interface Proyecto {
  id: number;
  nombre: string;
  descripcion: string;
  estado: 'planificacion' | 'activo' | 'pausado' | 'completado' | 'cancelado';
  fecha_inicio: string;
  fecha_fin_estimada?: string;
  fecha_fin_real?: string;
  cliente_id?: number;
  presupuesto?: number;
  horas_estimadas?: number;
  horas_trabajadas?: number;
  progreso?: number;
  created_at: string;
  updated_at: string;
}

export interface ProyectoCreateData {
  nombre: string;
  descripcion: string;
  estado?: string;
  fecha_inicio: string;
  fecha_fin_estimada?: string;
  cliente_id?: number;
  presupuesto?: number;
  horas_estimadas?: number;
}

export interface ProyectoUpdateData extends Partial<ProyectoCreateData> {
  fecha_fin_real?: string;
  horas_trabajadas?: number;
  progreso?: number;
}

// Servicio de proyectos
export const proyectosService = {
  // Listar todos los proyectos
  list: async (params: Record<string, any> = {}): Promise<Proyecto[]> => {
    return apiClient.get<Proyecto[]>('/proyectos', params);
  },

  // Obtener proyecto por ID
  getById: async (id: number): Promise<Proyecto> => {
    return apiClient.get<Proyecto>(`/proyectos/${id}`);
  },

  // Crear nuevo proyecto
  create: async (data: ProyectoCreateData): Promise<Proyecto> => {
    return apiClient.post<Proyecto>('/proyectos', data);
  },

  // Actualizar proyecto
  update: async (id: number, data: ProyectoUpdateData): Promise<Proyecto> => {
    return apiClient.put<Proyecto>(`/proyectos/${id}`, data);
  },

  // Eliminar proyecto
  delete: async (id: number): Promise<void> => {
    return apiClient.delete<void>(`/proyectos/${id}`);
  },

  // Obtener estadísticas del proyecto
  getStatistics: async (id: number): Promise<any> => {
    return apiClient.get<any>(`/proyectos/${id}/estadisticas`);
  },

  // Filtrar proyectos por estado
  getByStatus: async (estado: string): Promise<Proyecto[]> => {
    return apiClient.get<Proyecto[]>('/proyectos', { estado });
  }
};
