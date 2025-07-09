import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { colaboradoresService, Colaborador, ColaboradorCreate, PaginationParams } from '@/services/colaboradores';

export const useColaboradores = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['colaboradores', params],
    queryFn: () => colaboradoresService.getAll(params),
  });
};

export const useColaborador = (id: number) => {
  return useQuery({
    queryKey: ['colaboradores', id],
    queryFn: () => colaboradoresService.getById(id),
    enabled: !!id,
  });
};

export const useCreateColaborador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ColaboradorCreate) => colaboradoresService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    },
  });
};

export const useUpdateColaborador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ColaboradorCreate> }) =>
      colaboradoresService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
      queryClient.invalidateQueries({ queryKey: ['colaboradores', id] });
    },
  });
};

export const useDeleteColaborador = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => colaboradoresService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['colaboradores'] });
    },
  });
};

export const useColaboradorEstadisticas = (id: number) => {
  return useQuery({
    queryKey: ['colaboradores', id, 'estadisticas'],
    queryFn: () => colaboradoresService.getEstadisticas(id),
    enabled: !!id,
  });
};
