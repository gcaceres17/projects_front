import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { costosRigidosService, CostoRigido, CostoRigidoCreate } from '@/services/costos-rigidos';
import { PaginationParams } from '@/services/colaboradores';

export const useCostosRigidos = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['costos-rigidos', params],
    queryFn: () => costosRigidosService.getAll(params),
  });
};

export const useCostoRigido = (id: number) => {
  return useQuery({
    queryKey: ['costos-rigidos', id],
    queryFn: () => costosRigidosService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCostoRigido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CostoRigidoCreate) => costosRigidosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costos-rigidos'] });
    },
  });
};

export const useUpdateCostoRigido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CostoRigidoCreate> }) =>
      costosRigidosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['costos-rigidos'] });
      queryClient.invalidateQueries({ queryKey: ['costos-rigidos', id] });
    },
  });
};

export const useDeleteCostoRigido = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => costosRigidosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costos-rigidos'] });
    },
  });
};

export const useCostosRigidosEstadisticas = () => {
  return useQuery({
    queryKey: ['costos-rigidos', 'estadisticas'],
    queryFn: () => costosRigidosService.getEstadisticasResumen(),
  });
};

export const useCostosRigidosCategorias = () => {
  return useQuery({
    queryKey: ['costos-rigidos', 'categorias'],
    queryFn: () => costosRigidosService.getCategorias(),
  });
};

export const useCostosRigidosProveedores = () => {
  return useQuery({
    queryKey: ['costos-rigidos', 'proveedores'],
    queryFn: () => costosRigidosService.getProveedores(),
  });
};
