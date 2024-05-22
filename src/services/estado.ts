import { api } from './api';
import { Estado } from '@/types/api';

export const getAllEstados = async (token: string): Promise<Estado[]> => {
  const response = await api.get('/api/estados', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.estados;
};
