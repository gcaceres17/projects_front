import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { proyectosService, Proyecto, ProyectoCreate } from '@/services/proyectos';
import { PaginationParams } from '@/services/colaboradores';

export const useProyectos = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['proyectos', params],
    queryFn: () => proyectosService.getAll(params),
  });
};

export const useProyecto = (id: number) => {
  return useQuery({
    queryKey: ['proyectos', id],
    queryFn: () => proyectosService.getById(id),
    enabled: !!id,
  });
};

export const useCreateProyecto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ProyectoCreate) => proyectosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
    },
  });
};

export const useUpdateProyecto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ProyectoCreate> }) =>
      proyectosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
      queryClient.invalidateQueries({ queryKey: ['proyectos', id] });
    },
  });
};

export const useDeleteProyecto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => proyectosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['proyectos'] });
    },
  });
};

export const useProyectoEstadisticas = (id: number) => {
  return useQuery({
    queryKey: ['proyectos', id, 'estadisticas'],
    queryFn: () => proyectosService.getEstadisticas(id),
    enabled: !!id,
  });
};
