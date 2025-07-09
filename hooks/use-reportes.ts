import { useQuery } from '@tanstack/react-query';
import { reportesService } from '@/services/reportes';

export const useDashboardReportes = () => {
  return useQuery({
    queryKey: ['reportes', 'dashboard'],
    queryFn: () => reportesService.getDashboard(),
  });
};

export const useProyectosPorEstado = () => {
  return useQuery({
    queryKey: ['reportes', 'proyectos-por-estado'],
    queryFn: () => reportesService.getProyectosPorEstado(),
  });
};

export const useCotizacionesPorMes = () => {
  return useQuery({
    queryKey: ['reportes', 'cotizaciones-por-mes'],
    queryFn: () => reportesService.getCotizacionesPorMes(),
  });
};

export const useCostosRigidosResumen = () => {
  return useQuery({
    queryKey: ['reportes', 'costos-rigidos-resumen'],
    queryFn: () => reportesService.getCostosRigidosResumen(),
  });
};

export const useColaboradoresProductividad = () => {
  return useQuery({
    queryKey: ['reportes', 'colaboradores-productividad'],
    queryFn: () => reportesService.getColaboradoresProductividad(),
  });
};

export const useClientesMasActivos = () => {
  return useQuery({
    queryKey: ['reportes', 'clientes-mas-activos'],
    queryFn: () => reportesService.getClientesMasActivos(),
  });
};

export const useResumenFinanciero = () => {
  return useQuery({
    queryKey: ['reportes', 'resumen-financiero'],
    queryFn: () => reportesService.getResumenFinanciero(),
  });
};
