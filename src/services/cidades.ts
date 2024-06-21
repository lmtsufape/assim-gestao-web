import { api } from './api';

import { Bairro, Cidade } from '@/types/api';

export const getAllCidades = async (token: string): Promise<Cidade[]> => {
  const response = await api.get('/api/cidades', {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.cidades;
};

export const getCidade = async (
  token: string,
  cidadeId: number,
): Promise<Cidade> => {
  const response = await api.get(`/api/cidades/${cidadeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.cidade;
};

export const createCidade = async (
  token: string,
  cidadeData: FormData,
): Promise<Cidade> => {
  const response = await api.post('/api/cidades', cidadeData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.cidade;
};

export const updateCidade = async (
  token: string,
  cidadeId: number,
  cidadeData: { nome: string; estado_id: number },
): Promise<Cidade> => {
  const response = await api.patch(`/api/cidades/${cidadeId}`, cidadeData, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.cidade;
};

export const removeCidade = async (
  token: string,
  cidadeId: number,
): Promise<void> => {
  await api.delete(`/api/cidades/${cidadeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const searchCidades = async (
  token: string,
  query: string,
): Promise<Cidade[]> => {
  const response = await api.get(
    `/api/cidades/buscar?q=${encodeURIComponent(query)}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data.cidades;
};

export const getBairrosPorCidade = async (
  token: string,
  cidadeId: string,
): Promise<Bairro[]> => {
  const response = await api.get(`/api/bairros/cidade/${cidadeId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data.bairros;
};
