import { api } from './api';

export const getBancas = async (token: string) => {
  const response = await api.get('/api/bancas', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.bancas;
};

export const getBanca = async (token: string, bancaId: number) => {
  const response = await api.get(`/api/bancas/${bancaId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.banca;
};

export const createBanca = async (token: string, bancaData: FormData) => {
  const response = await api.post('/api/bancas', bancaData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.banca;
};

export const updateBanca = async (
  token: string,
  bancaId: number,
  bancaData: FormData,
) => {
  const response = await api.patch(`/api/bancas/${bancaId}`, bancaData, {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.banca;
};

export const deleteBanca = async (token: string, bancaId: number) => {
  await api.delete(`/api/bancas/${bancaId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const getAgricultor = async (token: string, agricultorId: number) => {
  const response = await api.get(`/api/bancas/agricultores/${agricultorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data.agricultor;
};
