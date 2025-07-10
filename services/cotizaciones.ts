import { apiClient } from '@/lib/api';

// Interfaces para cotizaciones
export interface Cotizacion {
  id: number;
  numero: string;
  cliente_id: number;
  proyecto_id?: number;
  descripcion: string;
  estado: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
  subtotal: number;
  impuestos: number;
  total: number;
  fecha_creacion: string;
  fecha_vencimiento: string;
  fecha_respuesta?: string;
  terminos_condiciones?: string;
  notas?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CotizacionCreateData {
  cliente_id: number;
  proyecto_id?: number;
  descripcion: string;
  subtotal: number;
  impuestos: number;
  fecha_vencimiento: string;
  terminos_condiciones?: string;
  notas?: string;
}

export interface CotizacionUpdateData extends Partial<CotizacionCreateData> {
  estado?: 'borrador' | 'enviada' | 'aprobada' | 'rechazada' | 'vencida';
  fecha_respuesta?: string;
  activo?: boolean;
}

// Servicio de cotizaciones
export const cotizacionesService = {
  list: async (params?: Record<string, any>): Promise<Cotizacion[]> => {
    return apiClient.get<Cotizacion[]>('/cotizaciones', params);
  },

  getById: async (id: number): Promise<Cotizacion> => {
    return apiClient.get<Cotizacion>(`/cotizaciones/${id}`);
  },

  create: async (data: CotizacionCreateData): Promise<Cotizacion> => {
    return apiClient.post<Cotizacion>('/cotizaciones', data);
  },

  update: async (id: number, data: CotizacionUpdateData): Promise<Cotizacion> => {
    return apiClient.put<Cotizacion>(`/cotizaciones/${id}`, data);
  },

  delete: async (id: number): Promise<void> => {
    return apiClient.delete(`/cotizaciones/${id}`);
  },

  getByStatus: async (estado: string): Promise<Cotizacion[]> => {
    return apiClient.get<Cotizacion[]>(`/cotizaciones?estado=${estado}`);
  },

  getByClient: async (cliente_id: number): Promise<Cotizacion[]> => {
    return apiClient.get<Cotizacion[]>(`/cotizaciones?cliente_id=${cliente_id}`);
  },

  approve: async (id: number): Promise<Cotizacion> => {
    return apiClient.patch<Cotizacion>(`/cotizaciones/${id}/aprobar`);
  },

  reject: async (id: number, motivo?: string): Promise<Cotizacion> => {
    return apiClient.patch<Cotizacion>(`/cotizaciones/${id}/rechazar`, { motivo });
  },

  send: async (id: number): Promise<Cotizacion> => {
    return apiClient.patch<Cotizacion>(`/cotizaciones/${id}/enviar`);
  },

  getStatistics: async (): Promise<any> => {
    return apiClient.get<any>('/cotizaciones/estadisticas');
  },

  generatePDF: async (id: number): Promise<Blob> => {
    // Este endpoint devuelve un PDF
    const response = await fetch(`${apiClient['baseURL']}/cotizaciones/${id}/pdf`);
    return response.blob();
  }
};
