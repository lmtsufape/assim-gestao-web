import { api } from './api';
import { OCS } from '@/types/api';
import { User } from '@/types/api';
import { isValidCNPJ } from '@/utils/validCnpj';

export async function getAllOCS(token: string): Promise<{ ocs: OCS[] }> {
  try {
    const response = await api.get('/api/ocs', {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch ocs');
  }
}

export async function getOCS(token: string, id: string): Promise<{ ocs: OCS }> {
  try {
    const response = await api.get(`/api/ocs/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch ocs');
  }
}

export async function getUsersByOCS(
  token: string,
  id: string,
): Promise<{ users: User[] }> {
  try {
    const response = await api.get(`/api/ocs/participantes/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch users by ocs');
  }
}

export async function vincularAgricultorOrganizacao(
  token: string,
  id: string,
  organizacaoId: string,
) {
  try {
    const response = await api.put(
      `api/agricultores/vincular/${id}`,
      {
        organizacao_id: organizacaoId,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    );

    if (response.status < 200 || response.status >= 300) {
      throw new Error(
        `Failed to link farmer to organization: ${response.statusText}`,
      );
    }
    return response.data;
  } catch (error) {
    console.error('Erro ao vincular o agricultor à organização:', error);
    throw error;
  }
}

export async function desvincularAgricultor(token: string, id: string) {
  try {
    const response = await api.delete(`api/agricultores/desvincular/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao desvincular o agricultor:', error);
    throw error;
  }
}

export async function checkEmailExistsInOCS(
  email: string,
  token: string,
): Promise<boolean> {
  try {
    console.log(`Token usado para verificar a existência do e-mail: ${token}`);

    const response = await api.get(`/api/ocs`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const ocsList = response.data.ocs;
      console.log(`OCS recuperadas: ${ocsList.length}`);

      for (const ocs of ocsList) {
        console.log(`Verificando e-mail da OCS: ${ocs.contato?.email}`);
        if (ocs.contato?.email === email) {
          console.log(`E-mail encontrado na OCS: ${ocs.contato?.email}`);
          return true;
        }
      }

      console.log(`E-mail não encontrado na OCS: ${email}`);
      return false;
    } else {
      console.log(
        `Falha ao recuperar OCS, código de status: ${response.status}`,
      );
      return false;
    }
  } catch (error) {
    console.error(`Erro ao verificar a existência do e-mail na OCS: ${error}`);
    return false;
  }
}

export async function checkCNPJExistsInOCS(
  cnpj: string,
  token: string,
): Promise<boolean> {
  try {
    console.log(`Token usado para verificar a existência do CNPJ: ${token}`);

    const response = await api.get(`/api/ocs`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const ocsList = response.data.ocs;
      console.log(`OCS recuperadas: ${ocsList.length}`);

      for (const ocs of ocsList) {
        console.log(`Verificando CNPJ da OCS: ${ocs.cnpj}`);
        if (ocs.cnpj === cnpj) {
          console.log(`CNPJ encontrado na OCS: ${ocs.cnpj}`);
          return true;
        }
      }

      console.log(`CNPJ não encontrado na OCS: ${cnpj}`);
      return false;
    } else {
      console.log(
        `Falha ao recuperar OCS, código de status: ${response.status}`,
      );
      return false;
    }
  } catch (error) {
    console.error(`Erro ao verificar a existência do CNPJ na OCS: ${error}`);
    return false;
  }
}

// Função para criar uma nova OCS
export async function createOCS(
  {
    nome,
    cnpj,
    email,
    telefone,
    rua,
    numero,
    cep,
    bairro_id,
    associacao_id,
    agricultores_id,
  }: OCS,
  token: string,
): Promise<void> {
  try {
    if (typeof email === 'string' && email) {
      const emailExistsInOCS = await checkEmailExistsInOCS(email, token);

      if (emailExistsInOCS) {
        throw new Error('E-mail já cadastrado em outra organização.');
      }
    } else {
      throw new Error('E-mail inválido.');
    }

    if (!isValidCNPJ(cnpj)) {
      throw new Error('CNPJ inválido.');
    }

    if (typeof cnpj === 'string' && cnpj) {
      const cnpjExistsInOCS = await checkCNPJExistsInOCS(cnpj, token);

      if (cnpjExistsInOCS) {
        throw new Error('CNPJ já cadastrado em outra organização.');
      }
    } else {
      throw new Error('CNPJ inválido.');
    }

    const response = await api.post(
      `/api/ocs`,
      {
        nome,
        cnpj,
        email,
        telefone,
        rua,
        numero,
        cep,
        bairro_id,
        associacao_id,
        agricultores_id,
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      },
    );

    console.log('Nova OCS criada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao criar OCS:', error);
    if (
      error instanceof Error &&
      (error.message === 'E-mail já cadastrado em outra organização.' ||
        error.message === 'CNPJ já cadastrado em outra organização.' ||
        error.message === 'CNPJ inválido.')
    ) {
      throw error;
    }
    throw new Error('Falha ao criar OCS');
  }
}

export async function editOCS(
  {
    nome,
    cnpj,
    email,
    telefone,
    rua,
    numero,
    cep,
    bairro_id,
    associacao_id,
    agricultores_id,
  }: OCS,
  token: string,
  id: string,
) {
  try {
    const response = await api.patch(
      `/api/ocs/${id}`,
      {
        nome,
        cnpj,
        email,
        telefone,
        rua,
        numero,
        cep,
        bairro_id,
        associacao_id,
        agricultores_id,
      },
      {
        headers: {
          authorization: `Bearer ${token}`,
        },
      },
    );
    console.log(response.data);
    return response.data;
  } catch (error) {
    throw new Error('Failed to edit ocs');
  }
}

export async function removeOCS(token: string, id: number) {
  try {
    const response = await api.delete(`/api/ocs/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to remove ocs');
  }
}
