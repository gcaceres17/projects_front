import { apiClient } from '@/lib/api';

// Interfaces para cotizaciones
export interface Cotizacion {
  id: number;
  numero: string;
  cliente_id: number;
  proyecto_id?: number;
  titulo: string;
  descripcion?: string;
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
  subtotal: number;
  impuestos: number;
  descuento: number;
  total: number;
  fecha_creacion: string;
  fecha_envio?: string;
  fecha_vencimiento?: string;
  fecha_aprobacion?: string;
  validez_dias: number;
  terminos_condiciones?: string;
  notas?: string;
  activo: boolean;
  cliente?: any;
  proyecto?: any;
  items?: any[];
  dias_para_vencimiento?: number;
  porcentaje_impuestos?: number;
}

export interface CotizacionCreateData {
  cliente_id: number;
  proyecto_id?: number;
  titulo: string;
  descripcion?: string;
  descuento?: number;
  fecha_vencimiento?: string;
  validez_dias?: number;
  terminos_condiciones?: string;
  notas?: string;
  items?: any[];
}

export interface CotizacionUpdateData extends Partial<CotizacionCreateData> {
  estado?: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
  fecha_envio?: string;
  fecha_aprobacion?: string;
  activo?: boolean;
}

// Servicio de cotizaciones
export const cotizacionesService = {
  list: async (params?: Record<string, any>): Promise<Cotizacion[]> => {
    return apiClient.get<Cotizacion[]>('/cotizaciones/cotizaciones/', params);
  },

  getById: async (id: number): Promise<Cotizacion> => {
    return apiClient.get<Cotizacion>(`/cotizaciones/cotizaciones/${id}/`);
  },

  create: async (data: CotizacionCreateData): Promise<Cotizacion> => {
    return apiClient.post<Cotizacion>('/cotizaciones/cotizaciones/', data);
  },

  update: async (id: number, data: CotizacionUpdateData): Promise<Cotizacion> => {
    return apiClient.put<Cotizacion>(`/cotizaciones/cotizaciones/${id}/`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/cotizaciones/cotizaciones/${id}/`);
  },

  getByStatus: async (estado: string): Promise<Cotizacion[]> => {
    return apiClient.get<Cotizacion[]>(`/cotizaciones/cotizaciones/?estado=${estado}`);
  },

  getByClient: async (cliente_id: number): Promise<Cotizacion[]> => {
    return apiClient.get<Cotizacion[]>(`/cotizaciones/cotizaciones/?cliente_id=${cliente_id}`);
  },

  approve: async (id: number): Promise<Cotizacion> => {
    return apiClient.patch<Cotizacion>(`/cotizaciones/cotizaciones/${id}/aprobar/`);
  },

  reject: async (id: number, motivo?: string): Promise<Cotizacion> => {
    return apiClient.patch<Cotizacion>(`/cotizaciones/cotizaciones/${id}/rechazar/`, { motivo });
  },

  send: async (id: number): Promise<Cotizacion> => {
    return apiClient.patch<Cotizacion>(`/cotizaciones/cotizaciones/${id}/enviar/`);
  },

  changeStatus: async (id: number): Promise<Cotizacion> => {
    return apiClient.patch<Cotizacion>(`/cotizaciones/cotizaciones/${id}/estado/`);
  },

  getStatistics: async (): Promise<any> => {
    return apiClient.get<any>('/cotizaciones/cotizaciones/estadisticas/resumen/');
  },

  generatePDF: async (id: number): Promise<Blob> => {
    // Este endpoint devuelve un PDF
    const response = await fetch(`${apiClient['baseURL']}/cotizaciones/cotizaciones/${id}/pdf/`);
    return response.blob();
  }
};
