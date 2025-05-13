'use client';

import { redirect, useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useState } from 'react';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import MultiSelect from '@/components/Multiselect';
import { StyledSelect } from '@/components/Multiselect/style';
import MuiSelect from '@/components/Select';

import {
  createUser,
  getAllRoles,
  getAllBairrosByCidade,
  checkEmailExistsInUsers,
  checkCpfExistsInUsers,
} from '@/services';
import { getAllCidades } from '@/services/cidades';
import { Bairro, Cidade } from '@/types/api';
import { isValidCPF } from '@/utils/validCpf';
import {
  Alert,
  AlertTitle,
  Snackbar,
  FormControl,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

export default function Home() {
  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [currentError, setCurrentError] = useState<string | null>(null);
  const [confirmationMessage, setConfirmationMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [telefone, setTelefone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [selectedCidade, setSelectedCidade] = useState<number>(1);

  const [street, setStreet] = useState('');
  const [cep, setCEP] = useState('');
  const [number, setNumber] = useState('');
  const [complemento, setComplemento] = useState('');

  const [bairro, setBairro] = useState<Bairro[]>([]);
  const [selectedBairro, setSelectedBairro] = useState<number>(0);
  const [cidades, setCidades] = useState<Cidade[]>([]);

  const [selectedRole, setSelectedRole] = useState<string | string[]>([]);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('@token');
    fetchCidades(token!);
    fetchBairros(token!, 1);
    if (!token) {
      redirect('/');
    }
  }, []);

  const fetchAddress = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setStreet(data.logradouro || '');
        setComplemento(data.complemento || '');

        const cidadeViaCep = data.localidade?.toLowerCase().trim();
        const bairroViaCep = data.bairro?.toLowerCase().trim();

        const cidadeMatch = cidades.find(
          (cidade) => cidade.nome.toLowerCase().trim() === cidadeViaCep,
        );

        if (cidadeMatch) {
          setSelectedCidade(cidadeMatch.id as number);
          const token = localStorage.getItem('@token');

          const { bairros } = await getAllBairrosByCidade(
            token!,
            cidadeMatch.id as number,
          );
          setBairro(bairros);

          const bairroMatch = bairros.find(
            (bairro) => bairro.nome.toLowerCase().trim() === bairroViaCep,
          );

          if (bairroMatch) {
            setSelectedBairro(bairroMatch.id);
          } else {
            setSelectedBairro(bairros[0]?.id || 0);
            console.warn('Bairro não encontrado nos dados cadastrados.');
          }
        } else {
          setSelectedCidade(1);
          setSelectedBairro(0);
          console.warn('Cidade não encontrada nos dados cadastrados.');
        }
      } else {
        setCurrentError('CEP não encontrado.');
      }
    } catch (error) {
      console.log(error);
      setCurrentError('Erro ao buscar o CEP.');
    }
  };

  const handleCEPChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    let cepValue = target.value.replace(/\D/g, '');

    if (cepValue.length > 5) {
      cepValue = cepValue.slice(0, 5) + '-' + cepValue.slice(5, 8);
    }

    setCEP(cepValue);
    if (cepValue.replace('-', '').length === 8) {
      fetchAddress(cepValue.replace('-', ''));
    }
  };

  const fetchCidades = async (token: string) => {
    try {
      const cidades = await getAllCidades(token);
      setCidades(cidades);
    } catch (error) {
      console.error('Failed to fetch cidades:', error);
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const { data: roles } = useQuery({
    queryKey: ['roles'],
    queryFn: () => {
      const token = localStorage.getItem('@token');
      if (token) {
        return getAllRoles(token);
      }
      return null;
    },
  });

  const getRoleIdByName = (roleName: string): number | undefined => {
    const selectedRoleObject = roles?.find((role) => role.nome === roleName);
    return selectedRoleObject?.id;
  };

  const validateFields = () => {
    const errors = [];

    if (name.length < 3) {
      errors.push('O campo nome deve ter no mínimo 3 caracteres.');
    }
    if (!email) {
      errors.push('O campo e-mail é obrigatório.');
    }
    if (!cpf) {
      errors.push('O campo CPF é obrigatório.');
    } else if (!isValidCPF(cpf)) {
      errors.push('O CPF é inválido.');
    }
    if (!telefone) {
      errors.push('O campo telefone é obrigatório.');
    }
    if (!password) {
      errors.push('O campo senha é obrigatório.');
    }
    if (!street) {
      errors.push('O campo rua é obrigatório.');
    }
    if (!cep) {
      errors.push('O campo CEP é obrigatório.');
    }
    if (!number) {
      errors.push('O campo número é obrigatório.');
    }
    if (!selectedBairro) {
      errors.push('O campo bairro é obrigatório.');
    }

    return errors;
  };

  const handleRegister: (e: React.FormEvent) => Promise<void> = async (e) => {
    e.preventDefault();

    const validationErrors = validateFields();
    if (validationErrors.length) {
      setErrorMessages(validationErrors);
      setCurrentError(validationErrors[0]);
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('@token');
      if (!token) {
        redirect('/');
      }

      const emailExists = await checkEmailExistsInUsers(email, token!);
      if (emailExists) {
        throw new Error('E-mail já cadastrado em outro usuário.');
      }

      const cpfExists = await checkCpfExistsInUsers(cpf, token!);
      if (cpfExists) {
        throw new Error('CPF já cadastrado em outro usuário.');
      }

      const selectedRoleIds = Array.isArray(selectedRole)
        ? (selectedRole
            .map((role) => getRoleIdByName(role as string))
            .filter(Boolean) as number[])
        : [getRoleIdByName(selectedRole as string) as number];

      await createUser(
        {
          name: name,
          email: email,
          cpf,
          password: password,
          telefone: telefone,
          roles: selectedRoleIds,
          rua: street,
          cep: cep,
          numero: number,
          bairro_id: selectedBairro,
          complemento: complemento,
        },
        token,
      );

      setLoading(false);
      setConfirmationMessage('Usuário cadastrado com sucesso');
      setTimeout(() => {
        setConfirmationMessage('');
        router.push('/menu');
      }, 4000);
    } catch (error) {
      setLoading(false);
      if (
        error instanceof Error &&
        (error.message === 'E-mail já cadastrado em outro usuário.' ||
          error.message === 'CPF já cadastrado em outro usuário.')
      ) {
        setErrorMessages([error.message]);
        setCurrentError(error.message);
      } else if (error instanceof AxiosError) {
        const errors = error.response?.data?.errors;
        if (errors !== undefined && errors !== null) {
          const errorList = [];
          for (const key of Object.keys(errors)) {
            const errorMessage = errors[key][0];
            errorList.push(errorMessage);
          }
          setErrorMessages(errorList);
          setCurrentError(errorList[0]);
        } else {
          setErrorMessages(['Erro ao processar a requisição.']);
          setCurrentError('Erro ao processar a requisição.');
        }
      }
    }
  };

  const handleClose = () => {
    if (currentError !== null) {
      const nextIndex = errorMessages.indexOf(currentError) + 1;
      if (nextIndex < errorMessages.length) {
        setCurrentError(errorMessages[nextIndex]);
      } else {
        setCurrentError(null);
        setErrorMessages([]);
      }
    }
  };

  const handleCidadeChange = (event: SelectChangeEvent<number>) => {
    const token = localStorage.getItem('@token');

    const cidadeId = event.target.value as number;
    setSelectedCidade(cidadeId);
    fetchBairros(token!, cidadeId);
  };

  /*  const handleBairroChange = (event: SelectChangeEvent<number>) => {
    const bairroId = event.target.value as number;
    setSelectedBairro(bairroId);
  }; */

  const fetchBairros = async (token: string, cidadeId: number) => {
    try {
      const { bairros } = await getAllBairrosByCidade(token, cidadeId);
      setBairro(bairros);
      if (bairros.length > 0) {
        setSelectedBairro(bairros[0].id); // Setar o primeiro bairro como selecionado
      }
    } catch (error) {
      console.error('Failed to fetch bairros:', error);
    }
  };

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <h1>Cadastrar</h1>
        <p>
          <strong>Usuário</strong>
        </p>
        <form onSubmit={handleRegister} className={S.form}>
          <h3>Dados</h3>
          <section>
            <div>
              <label htmlFor="nome">
                Nome<span>*</span>
              </label>
              <Input
                name="nome"
                type="text"
                placeholder="Insira seu nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email">
                E-mail<span>*</span>
              </label>
              <Input
                name="email"
                type="email"
                placeholder="contato@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">
                Senha<span>*</span>
              </label>
              <div className={S.passwordInput}>
                <Input
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="*******"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={toggleShowPassword}
                  className={S.togglePasswordButton}
                >
                  {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="telefone">
                Telefone<span>*</span>
              </label>
              <Input
                name="telefone"
                type="text"
                placeholder="(99) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                mask="phone"
              />
            </div>
            <div>
              <label htmlFor="cpf">
                CPF<span>*</span>
              </label>
              <Input
                name="cpf"
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                mask="cpf"
              />
            </div>
            <MultiSelect
              label="Função"
              selectedNames={selectedRole}
              setSelectedNames={setSelectedRole}
            >
              {roles?.map((item: { id: number; nome: string }) => (
                <StyledSelect
                  key={item.id}
                  value={item.nome}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item.nome === 'agricultor'
                    ? 'vendedor'
                    : item.nome === 'secretario'
                      ? 'secretário'
                      : item.nome}
                </StyledSelect>
              ))}
            </MultiSelect>
          </section>
          <h3>Endereço</h3>
          <section>
            <div>
              <label htmlFor="cep">
                Cep<span>*</span>
              </label>
              <Input
                name="cep"
                type="text"
                placeholder="00000-000"
                value={cep}
                onChange={handleCEPChange}
                mask="zipCode"
              />
            </div>
            <div>
              <label htmlFor="street">
                Rua<span>*</span>
              </label>
              <Input
                name="street"
                type="text"
                placeholder="Rua"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="cidade-label">
                Cidade<span>*</span>
              </label>
              <FormControl fullWidth>
                <Select
                  style={{ borderRadius: '8px' }}
                  labelId="cidade-label"
                  id="cidade"
                  value={selectedCidade}
                  // placeholder="Cidade"
                  onChange={handleCidadeChange}
                  label="Cidade"
                >
                  {cidades.map((cidade) => (
                    <MenuItem key={cidade.id} value={cidade.id}>
                      {cidade.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <MuiSelect
              label="Bairro"
              selectedNames={selectedBairro}
              setSelectedNames={setSelectedBairro}
            >
              {bairro?.map((item: { id: number; nome: string }) => (
                <StyledSelect
                  key={item.id}
                  value={item.id}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item.nome}
                </StyledSelect>
              ))}
            </MuiSelect>

            <div>
              <label htmlFor="number">
                Número<span>*</span>
              </label>
              <Input
                name="number"
                type="number"
                placeholder="Número"
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="complemento">Complemento</label>
              <Input
                name="complemento"
                type="text"
                placeholder="Complemento"
                value={complemento}
                onChange={(e) => setComplemento(e.target.value)}
              />
            </div>
          </section>
          <div className={S.wrapperButtons}>
            <Button
              onClick={() => router.back()}
              type="button"
              dataType="transparent"
            >
              Voltar
            </Button>{' '}
            <Button dataType="filled" type="submit">
              Cadastrar
            </Button>
          </div>
        </form>
      </div>
      {loading && (
        <div className={S.loaderContainer}>
          <div className={S.loaderBackdrop}></div>
          <Loader />
        </div>
      )}
      <Snackbar
        open={currentError !== null}
        autoHideDuration={1000}
        onClose={handleClose}
      >
        <Alert variant="filled" severity="error" onClose={handleClose}>
          <AlertTitle>Erro!</AlertTitle>
          {currentError}
        </Alert>
      </Snackbar>
      {confirmationMessage && (
        <Snackbar open={confirmationMessage.length > 0} autoHideDuration={500}>
          <Alert variant="filled" severity="success">
            <AlertTitle>Sucesso!</AlertTitle>
            {confirmationMessage}
          </Alert>
        </Snackbar>
      )}
    </main>
  );
}
