import { isValidCPF } from '@/utils/validCpf';
import { Role } from '../types/api';
import { api } from './api';

import { Presidente, User } from '@/types/api';

export async function checkEmailExistsInUsers(
  email: string,
  token: string,
): Promise<boolean> {
  try {
    const response = await api.get(`/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const userList = response.data.users;

      for (const user of userList) {
        if (user.email === email) {
          return true;
        }
      }
      return false;
    } else {
      console.log(
        `Falha ao recuperar usuários, código de status: ${response.status}`,
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Erro ao verificar a existência do e-mail nos usuários: ${error}`,
    );
    return false;
  }
}

export async function checkCpfExistsInUsers(
  cpf: string,
  token: string,
): Promise<boolean> {
  try {
    const response = await api.get(`/api/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 200) {
      const userList = response.data.users;

      for (const user of userList) {
        if (user.cpf === cpf) {
          return true;
        }
      }

      return false;
    } else {
      console.log(
        `Falha ao recuperar usuários, código de status: ${response.status}`,
      );
      return false;
    }
  } catch (error) {
    console.error(
      `Erro ao verificar a existência do CPF nos usuários: ${error}`,
    );
    return false;
  }
}

export async function createUser(
  {
    name,
    email,
    password,
    telefone,
    cpf,
    roles,
    rua,
    cep,
    numero,
    bairro_id,
    complemento,
  }: User,
  token: string,
) {
  try {
    // Verificar se o e-mail já existe em outro usuário
    if (typeof email === 'string' && email) {
      const emailExistsInUsers = await checkEmailExistsInUsers(email, token);

      if (emailExistsInUsers) {
        throw new Error('E-mail já cadastrado em outro usuário.');
      }
    } else {
      throw new Error('E-mail inválido.');
    }

    // Verificar se o CPF é válido
    if (!isValidCPF(cpf)) {
      throw new Error('CPF inválido.');
    }

    // Verificar se o CPF já existe em outro usuário
    if (typeof cpf === 'string' && cpf) {
      const cpfExistsInUsers = await checkCpfExistsInUsers(cpf, token);

      if (cpfExistsInUsers) {
        throw new Error('CPF já cadastrado em outro usuário.');
      }
    } else {
      throw new Error('CPF inválido.');
    }

    // Se o e-mail e o CPF não existirem, proceder com a criação do usuário
    const userData: User = {
      name,
      email,
      password,
      telefone,
      cpf,
      roles,
      rua,
      cep,
      numero,
      bairro_id,
      complemento,
    };

    const response = await api.post('/api/users', userData, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    return response.data;
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    if (
      error instanceof Error &&
      (error.message === 'E-mail já cadastrado em outro usuário.' ||
        error.message === 'CPF já cadastrado em outro usuário.' ||
        error.message === 'CPF inválido.')
    ) {
      throw error;
    }
    throw new Error('Falha ao criar usuário');
  }
}

export async function signIn(email: string, password: string) {
  const response = await api.post('/api/sanctum/token', {
    email,
    password,
    device_name: 'WEB', // TODO: Get Device Name
  });
  localStorage.setItem('@token', response.data.token);
  localStorage.setItem('@roles', JSON.stringify(response.data.user.roles));
  localStorage.setItem('userId', response.data.user.id);
  window.location.href = '/menu';
}

export async function getPresidents(
  token: string,
): Promise<{ data: Presidente[] }> {
  try {
    const response = await api.get(`/api/users/presidents`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch presidents');
  }
}

export async function getAllUsers(token: string): Promise<{ users: User[] }> {
  try {
    const response = await api.get(`/api/users`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
}

export async function getUser(
  token: string,
  id: string,
): Promise<{ user: User }> {
  try {
    const response = await api.get(`/api/users/${id}`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch user');
  }
}

export async function editUser(
  {
    name,
    password,
    email,
    telefone,
    cpf,
    roles,
    rua,
    cep,
    numero,
    bairro_id,
  }: User,
  token: string,
  id: string,
) {
  const response = await api.patch(
    `/api/users/${id}`,
    {
      name,
      email,
      password,
      telefone,
      cpf,
      roles,
      rua,
      cep,
      numero,
      bairro_id,
    },
    {
      headers: {
        authorization: `Bearer ${token}`,
      },
    },
  );
  console.log(response.data);
  return response.data;
}

export async function removeUser(token: string, id: number) {
  const response = await api.delete(`/api/users/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response.data;
}

export async function getAllRoles(token: string): Promise<Role[]> {
  try {
    const response = await api.get(`/api/roles`, {
      headers: {
        authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to fetch users');
  }
}

export async function sendResetPasswordEmail(email: string) {
  try {
    const response = await api.post('api/forgot-password', { email });
    return response.data;
  } catch (error) {
    throw new Error('Failed to send reset password email');
  }
}

export async function resetPassword(
  token: string,
  email: string,
  password: string,
  password_confirmation: string,
) {
  try {
    const response = await api.post('api/reset-password', {
      token,
      email,
      password,
      password_confirmation,
    });
    return response.data;
  } catch (error) {
    throw new Error('Failed to reset password');
  }
}
