import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cotizacionesService, Cotizacion, CotizacionCreate } from '@/services/cotizaciones';
import { PaginationParams } from '@/services/colaboradores';

export const useCotizaciones = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['cotizaciones', params],
    queryFn: () => cotizacionesService.getAll(params),
  });
};

export const useCotizacion = (id: number) => {
  return useQuery({
    queryKey: ['cotizaciones', id],
    queryFn: () => cotizacionesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCotizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CotizacionCreate) => cotizacionesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
    },
  });
};

export const useUpdateCotizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<CotizacionCreate> }) =>
      cotizacionesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', id] });
    },
  });
};

export const useDeleteCotizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cotizacionesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
    },
  });
};

export const useAprobarCotizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cotizacionesService.aprobar(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', id] });
    },
  });
};

export const useRechazarCotizacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => cotizacionesService.rechazar(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['cotizaciones'] });
      queryClient.invalidateQueries({ queryKey: ['cotizaciones', id] });
    },
  });
};
