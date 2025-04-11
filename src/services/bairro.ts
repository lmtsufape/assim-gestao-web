import { api } from './api';

import { Bairro } from '@/types/api';

export async function getAllBairros(
  token: string,
): Promise<{ bairros: Bairro[] }> {
  try {
    const response = await api.get('/api/bairros', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to fetch bairros');
  }
}

export const getBairro = async (
  token: string,
  bairroId: number,
): Promise<Bairro> => {
  const response = await api.get(`/api/bairros/${bairroId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.bairro;
};

export async function getAllBairrosByCidade(
  token: string,
  id: number,
): Promise<{ bairros: Bairro[] }> {
  try {
    const response = await api.get(`/api/bairros/cidade/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching bairros in a cidade:', error);
    throw new Error('Failed to fetch bairros in a cidade');
  }
}

export async function deleteBairro(token: string, id: number): Promise<void> {
  try {
    await api.delete(`/api/bairros/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to delete bairro');
  }
}

export async function createBairro(
  token: string,
  bairro: Partial<Bairro>,
): Promise<{ bairro: Bairro }> {
  try {
    const response = await api.post('/api/bairros', bairro, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to create bairro');
  }
}

export async function updateBairro(
  token: string,
  id: number,
  bairro: Partial<Bairro>,
): Promise<{ bairro: Bairro }> {
  try {
    const response = await api.put(`/api/bairros/${id}`, bairro, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to update bairro');
  }
}
