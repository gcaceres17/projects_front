import api from '../lib/api';

export const reportesService = {
  async getDashboard(): Promise<any> {
    const response = await api.get('/reportes/dashboard');
    return response.data;
  },

  async getProyectosPorEstado(): Promise<any> {
    const response = await api.get('/reportes/proyectos-por-estado');
    return response.data;
  },

  async getCotizacionesPorMes(): Promise<any> {
    const response = await api.get('/reportes/cotizaciones-por-mes');
    return response.data;
  },

  async getCostosRigidosResumen(): Promise<any> {
    const response = await api.get('/reportes/costos-rigidos-resumen');
    return response.data;
  },

  async getColaboradoresProductividad(): Promise<any> {
    const response = await api.get('/reportes/colaboradores-productividad');
    return response.data;
  },

  async getClientesMasActivos(): Promise<any> {
    const response = await api.get('/reportes/clientes-mas-activos');
    return response.data;
  },

  async getResumenFinanciero(): Promise<any> {
    const response = await api.get('/reportes/resumen-financiero');
    return response.data;
  }
};
