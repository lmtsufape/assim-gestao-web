/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import {
  MdManageAccounts,
  MdVisibility,
  MdVisibilityOff,
} from 'react-icons/md';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';
import StyledLink from '@/components/Link';

import { createUser } from '@/services/user';
import { getAllCidades } from '@/services/cidades';

import {
  Alert,
  AlertTitle,
  Snackbar,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  SelectChangeEvent,
  FormHelperText,
} from '@mui/material';
import { Bairro, Cidade } from '@/types/api';
import { getAllBairrosByCidade } from '@/services';

const RegisterForm = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [telefone, setTelefone] = useState('');
  const [cpf, setCpf] = useState('');

  const [street, setStreet] = useState('');
  const [cep, setCEP] = useState('');
  const [number, setNumber] = useState('');
  const [complemento, setComplemento] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState('');

  const [cidades, setCidades] = useState<Cidade[]>([]);
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [selectedCidade, setSelectedCidade] = useState<number>(1);
  const [selectedBairro, setSelectedBairro] = useState<number | ''>('');
  const [bairroError, setBairroError] = useState<boolean>(false);

  const router = useRouter();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('@token');
      if (token) {
        router.push('/menu');
      } else {
        fetchCidades(token!);
        fetchBairros(token!, 1);
      }
    }
  }, [router]);

  const fetchCidades = async (token: string) => {
    try {
      const cidades = await getAllCidades(token);
      setCidades(cidades);
    } catch (error) {
      console.error('Failed to fetch cidades:', error);
    }
  };

  const fetchBairros = async (token: string, cidadeId: number) => {
    try {
      const { bairros } = await getAllBairrosByCidade(token, cidadeId);
      setBairros(bairros);
      console.log('Bairros fetched:', bairros);
    } catch (error) {
      console.error('Failed to fetch bairros:', error);
    }
  };

  const handleCidadeChange = (event: SelectChangeEvent<number>) => {
    const token = localStorage.getItem('@token');

    const cidadeId = event.target.value as number;
    setSelectedCidade(cidadeId);
    fetchBairros(token!, cidadeId);
  };

  const handleBairroChange = (event: SelectChangeEvent<number>) => {
    const bairroId = event.target.value as number;
    setSelectedBairro(bairroId);
    setBairroError(false);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof selectedBairro !== 'number') {
      setBairroError(true);
      setError('Bairro é obrigatório');
      return;
    }

    const token = localStorage.getItem('@token');

    try {
      await createUser(
        {
          name,
          email,
          password,
          apelido: null,
          telefone,
          cpf,
          roles: [4],
          rua: street,
          cep,
          numero: number,
          bairro_id: selectedBairro,
        },
        token!,
      );
      router.back();
    } catch (error: any) {
      console.log(error.response?.data?.message);
      const errors = error.response?.data?.errors;
      if (errors !== undefined && errors !== null) {
        for (const key of Object.keys(errors)) {
          const errorMessage = errors[key][0];
          setError(`${errorMessage}`);
        }
      }
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={S.registerForm}>
      <h1>
        <MdManageAccounts />
        Cadastrar
      </h1>
      <p className={S.loginMessage}>
        Já está registrado? <Link href="/">Faça o login</Link>
      </p>
      <form onSubmit={handleRegister}>
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
        <div>
          <label htmlFor="telefone">
            Telefone<span>*</span>
          </label>
          <Input
            name="telefone"
            type="text"
            placeholder="(99) 99999-9999"
            value={telefone}
            mask="phone"
            onChange={(e) => setTelefone(e.target.value)}
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
        <h3>Endereço</h3>
        <div>
          <InputLabel id="cidade-label">Cidade</InputLabel>
          <FormControl fullWidth>
            <Select
              style={{ borderRadius: '10px' }}
              labelId="cidade-label"
              id="cidade"
              value={selectedCidade}
              placeholder="Cidade"
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
        <div>
          <label htmlFor="bairro_id">
            Bairro<span>*</span>
          </label>
          <FormControl fullWidth error={bairroError}>
            <Select
              style={{ borderRadius: '10px' }}
              labelId="bairro-label"
              id="bairro"
              value={selectedBairro}
              onChange={handleBairroChange}
              label="Bairro"
              displayEmpty
            >
              <MenuItem value="" disabled>
                <span
                  style={{
                    color: '#a4a4a4',
                    fontSize: '15px',
                    marginLeft: ' -5px',
                  }}
                >
                  Bairro
                </span>
              </MenuItem>
              {bairros.map((bairro) => (
                <MenuItem key={bairro.id} value={bairro.id}>
                  {bairro.nome}
                </MenuItem>
              ))}
            </Select>
            {bairroError && (
              <FormHelperText>Bairro é obrigatório</FormHelperText>
            )}
          </FormControl>
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
          <label htmlFor="cep">
            Cep<span>*</span>
          </label>
          <Input
            name="cep"
            type="text"
            placeholder="00000-000"
            value={cep}
            onChange={(e) => setCEP(e.target.value)}
            mask="zipCode"
          />
        </div>
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
          <label htmlFor="text">Complemento</label>
          <Input
            name="complemento"
            type="text"
            placeholder="Complemento"
            value={complemento}
            onChange={(e) => setComplemento(e.target.value)}
          />
        </div>
        <div className={S.wrapperButtons}>
          <StyledLink href="/" data-type="transparent" text="Voltar" />
          <Button dataType="filled" type="submit">
            Cadastrar
          </Button>
        </div>
      </form>
      <Snackbar open={error.length > 0} autoHideDuration={1000}>
        <Alert variant="filled" severity="error">
          <AlertTitle>Erro!</AlertTitle>
          {error}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default RegisterForm;
