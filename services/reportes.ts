import { apiClient } from '@/lib/api';

// Interfaces para los datos de reportes
export interface DashboardStats {
  proyectos: {
    total: number;
    activos: number;
    completados: number;
    porcentaje_completados: number;
  };
  colaboradores: {
    total: number;
    activos: number;
    porcentaje_activos: number;
  };
  cotizaciones: {
    total: number;
    pendientes: number;
    aprobadas: number;
    valor_total: number;
    valor_aprobadas: number;
  };
  clientes: {
    total: number;
    activos: number;
    porcentaje_activos: number;
  };
}

export interface ProjectByStatus {
  estado: string;
  cantidad: number;
  porcentaje: number;
}

export interface FinancialSummary {
  ingresosTotales: number;
  costosTotales: number;
  margenBruto: number;
  proyeccionMensual: number;
}

// Servicio de reportes
export const reportesService = {
  getDashboard: async (): Promise<DashboardStats> => {
    // Usar endpoint de prueba para demostración (funciona sin autenticación)
    return apiClient.get<DashboardStats>('/reportes/dashboard-test');
  },

  getProjectsByStatus: async (): Promise<ProjectByStatus[]> => {
    return apiClient.get<ProjectByStatus[]>('/reportes/proyectos-por-estado');
  },

  getQuotationsByMonth: async (year: number): Promise<any[]> => {
    return apiClient.get<any[]>(`/reportes/cotizaciones-por-mes?año=${year}`);
  },

  getRigidCostsSummary: async (): Promise<any> => {
    return apiClient.get<any>('/reportes/costos-rigidos-resumen');
  },

  getCollaboratorsProductivity: async (): Promise<any[]> => {
    return apiClient.get<any[]>('/reportes/colaboradores-productividad');
  },

  getMostActiveClients: async (limit: number = 10): Promise<any[]> => {
    return apiClient.get<any[]>(`/reportes/clientes-mas-activos?limite=${limit}`);
  },

  getFinancialSummary: async (): Promise<FinancialSummary> => {
    return apiClient.get<FinancialSummary>('/reportes/resumen-financiero');
  }
};
