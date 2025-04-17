/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { redirect, useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useState } from 'react';
import Link from 'next/link';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { StyledSelect } from '@/components/Multiselect/style';
import MuiSelect from '@/components/Select';
import MultiSelect from '@/components/Multiselect';

import {
  createOCS,
  getAllAssociacoes,
  getAllBairros,
  getAllUsers,
} from '@/services';
import { Bairro, User } from '@/types/api';
import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { useQuery } from '@tanstack/react-query';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cnpj, setCNPJ] = useState('');
  const [telefone, setTelefone] = useState('');
  const [street, setStreet] = useState('');
  const [cep, setCEP] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');

  const [selectedAssociacoes, setSelectedAssociacoes] = useState(0);
  const [selectedAgricultores, setSelectedAgricultores] = useState<
    string | string[]
  >([]);

  const [bairro, setBairro] = useState<Bairro[]>([]);
  const [selectedBairro, setSelectedBairro] = useState(0);

  const [errorMessages, setErrorMessages] = useState<string[]>([]);
  const [currentError, setCurrentError] = useState<string | null>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
    }

    getAllBairros(token)
      .then((response: { bairros: Bairro[] }) => setBairro(response.bairros))
      .catch((error: any) => console.log(error));
  }, []);

  const fetchAddress = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      if (!data.erro) {
        setStreet(data.logradouro || '');
        setComplement(data.complemento || '');
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

  const { data: associacoes } = useQuery({
    queryKey: ['associacoes'],
    queryFn: () => {
      const token = localStorage.getItem('@token');
      if (token) {
        return getAllAssociacoes(token);
      }
      return null;
    },
  });

  const { data: agricultores } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      const token = localStorage.getItem('@token');
      if (token) {
        return getAllUsers(token);
      }
      return null;
    },
  });

  const filterAgricultores = agricultores?.users?.filter((user: User) => {
    return user?.roles?.some(
      (role) =>
        typeof role !== 'number' &&
        typeof role !== 'string' &&
        role.nome === 'agricultor',
    );
  });

  const mapAgricultoresToIds = (
    selectedAgricultoresNames: string | string[],
    filterAgricultores: User[],
  ): number[] => {
    const selectedAgricultoresIds: number[] = [];
    filterAgricultores.forEach((agricultor) => {
      if (
        agricultor.id !== undefined &&
        selectedAgricultoresNames.includes(agricultor.name)
      ) {
        selectedAgricultoresIds.push(agricultor.id);
      }
    });
    return selectedAgricultoresIds;
  };

  const validateFields = () => {
    const errors = {
      name: name.length >= 10 ? '' : 'Nome deve ter pelo menos 10 caracteres.',
      email: email ? '' : 'E-mail é obrigatório.',
      cnpj: cnpj ? '' : 'CNPJ é obrigatório.',
      telefone: telefone ? '' : 'Telefone é obrigatório.',
      street: street ? '' : 'Rua é obrigatória.',
      cep: cep ? '' : 'CEP é obrigatório.',
      number: number ? '' : 'Número é obrigatório.',
      selectedAssociacoes: selectedAssociacoes
        ? ''
        : 'Associação é obrigatória.',
      selectedAgricultores: selectedAgricultores.length
        ? ''
        : 'Agricultores são obrigatórios.',
      selectedBairro: selectedBairro ? '' : 'Bairro é obrigatório.',
    };

    const errorMessages = Object.values(errors).filter((error) => error);
    return errorMessages;
  };

  const handleRegister: (e: React.FormEvent) => Promise<void> = async (e) => {
    e.preventDefault();

    const validationErrors = validateFields();
    if (validationErrors.length) {
      setErrorMessages(validationErrors);
      setCurrentError(validationErrors[0]);
      return;
    }

    try {
      const token = localStorage.getItem('@token');
      if (!token) {
        redirect('/');
      }

      const selectedAgricultoresIds = mapAgricultoresToIds(
        selectedAgricultores,
        filterAgricultores || [],
      );

      await createOCS(
        {
          nome: name,
          cnpj: cnpj,
          email: email,
          telefone: telefone,
          rua: street,
          cep: cep,
          numero: number,
          associacao_id: selectedAssociacoes,
          bairro_id: selectedBairro,
          agricultores_id: selectedAgricultoresIds,
          complemento: complement,
        },
        token,
      );
      router.back();
    } catch (error: any) {
      console.log(error);
      if (
        error instanceof Error &&
        (error.message === 'E-mail já cadastrado em outra organização.' ||
          error.message === 'CNPJ já cadastrado em outra organização.' ||
          error.message === 'CNPJ inválido.')
      ) {
        setErrorMessages([error.message]);
        setCurrentError(error.message);
      } else {
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

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <div className={S.headerTitle}>
          <div>
            <Link href="/ocs" className={S.back}>
              &lt; Voltar
            </Link>
          </div>
          <div>
            <h2 className={S.title}>
              Cadastrar Organização Social de Controle
            </h2>
          </div>
        </div>
        <form onSubmit={handleRegister} className={S.form}>
          <h2>Dados da Organização:</h2>
          <section>
            <div>
              <label htmlFor="nome">
                Nome<span>*</span>
              </label>
              <Input
                name="nome"
                type="text"
                placeholder="Insira o nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email">E-mail</label>
              <Input
                name="email"
                type="email"
                placeholder="contato@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="cnpj">
                CNPJ<span>*</span>
              </label>
              <Input
                name="cnpj"
                type="text"
                placeholder="00.000.000/0000-00."
                value={cnpj}
                onChange={(e) => setCNPJ(e.target.value)}
                mask="cnpj"
              />
            </div>
            <div>
              <label htmlFor="telefone">Telefone</label>
              <Input
                name="telefone"
                type="text"
                placeholder="(99) 99999-9999"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                mask="phone"
              />
            </div>
            <MuiSelect
              label="Associação"
              selectedNames={selectedAssociacoes}
              setSelectedNames={setSelectedAssociacoes}
            >
              {associacoes?.map((item) => (
                <StyledSelect
                  key={item.id}
                  value={item.id}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item.nome}
                </StyledSelect>
              ))}
            </MuiSelect>
            <MultiSelect
              label="Agricultores"
              selectedNames={selectedAgricultores}
              setSelectedNames={setSelectedAgricultores}
            >
              {filterAgricultores?.map((item) => (
                <StyledSelect
                  key={item.id}
                  value={item.name}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item.name}
                </StyledSelect>
              ))}
            </MultiSelect>
          </section>

          <h2>Endereço:</h2>
          <section>
            <div>
              <label htmlFor="cep">
                Cep<span>*</span>
              </label>
              <Input
                name="cep"
                type="text"
                placeholder="Cep"
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
              <label htmlFor="complement">Complemento</label>
              <Input
                name="complement"
                type="text"
                placeholder="Complemento"
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />
            </div>
          </section>
          <div className={S.wrapperButtons}>
            <Button dataType="filled" type="submit">
              Cadastrar
            </Button>
          </div>
        </form>
      </div>
      <Snackbar
        open={currentError !== null}
        autoHideDuration={6000}
        onClose={handleClose}
      >
        <Alert variant="filled" severity="error" onClose={handleClose}>
          <AlertTitle>Erro!</AlertTitle>
          {currentError}
        </Alert>
      </Snackbar>
    </main>
  );
}
