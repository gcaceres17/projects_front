import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clientesService, Cliente, ClienteCreate } from '@/services/clientes';
import { PaginationParams } from '@/services/colaboradores';

export const useClientes = (params?: PaginationParams) => {
  return useQuery({
    queryKey: ['clientes', params],
    queryFn: () => clientesService.getAll(params),
  });
};

export const useCliente = (id: number) => {
  return useQuery({
    queryKey: ['clientes', id],
    queryFn: () => clientesService.getById(id),
    enabled: !!id,
  });
};

export const useCreateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: ClienteCreate) => clientesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

export const useUpdateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ClienteCreate> }) =>
      clientesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      queryClient.invalidateQueries({ queryKey: ['clientes', id] });
    },
  });
};

export const useDeleteCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => clientesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
    },
  });
};

export const useClienteProyectos = (id: number) => {
  return useQuery({
    queryKey: ['clientes', id, 'proyectos'],
    queryFn: () => clientesService.getProyectos(id),
    enabled: !!id,
  });
};

export const useClienteEstadisticas = (id: number) => {
  return useQuery({
    queryKey: ['clientes', id, 'estadisticas'],
    queryFn: () => clientesService.getEstadisticas(id),
    enabled: !!id,
  });
};
