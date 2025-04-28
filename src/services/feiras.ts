import { api } from './api';

import { Banca, Feira, FeiraData } from '@/types/api';
import { AxiosError } from 'axios';

export async function getAllFeiras(
  token: string,
): Promise<{ feiras: Feira[] }> {
  try {
    const response = await api.get('/api/feiras/', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    console.log('Feiras recebidas:', response.data);
    return response.data;
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to fetch feiras');
  }
}

export async function deleteFeira(token: string, id: number): Promise<void> {
  try {
    await api.delete(`/api/feiras/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    if (
      error instanceof AxiosError &&
      error.response &&
      error.response.status === 400
    ) {
      throw new Error(error.response.data.error);
    } else {
      throw new Error('Failed to delete feira');
    }
  }
}

export async function createFeira(
  token: string,
  feiraData: FormData,
): Promise<{ feira: Feira }> {
  try {
    const response = await api.post('/api/feiras', feiraData, {
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to create feira');
  }
}

export async function getFeira(
  token: string,
  id: number,
): Promise<{ feira: Feira }> {
  try {
    const response = await api.get(`/api/feiras/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to fetch feira');
  }
}

export async function updateFeira(
  token: string,
  id: number,
  feiraData: FeiraData,
): Promise<{ feira: Feira }> {
  try {
    const response = await api.patch(`/api/feiras/${id}`, feiraData, {
      headers: {
        authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to update feira');
  }
}

export async function getFeiraImagem(
  token: string,
  id: number,
): Promise<{ file: Blob; mimeType: string }> {
  try {
    const response = await api.get(`/api/feiras/${id}/imagem`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
      responseType: 'blob',
    });

    const mimeType = response.headers['content-type'];
    return { file: response.data, mimeType };
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to fetch feira image');
  }
}

export async function deleteFeiraImagem(
  token: string,
  id: number,
): Promise<void> {
  try {
    await api.delete(`/api/feiras/${id}/imagem`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to delete feira image');
  }
}

export async function getBancasByFeira(
  token: string,
  feiraId: number,
): Promise<{ bancas: Banca[] }> {
  console.log('Chamando getBancasByFeira');

  try {
    const response = await api.get(`/api/feiras/${feiraId}/bancas`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    console.log('Response data:', response.data);
    return response.data;
  } catch (error) {
    console.debug(error);
    throw new Error('Failed to fetch bancas');
  }
}
