'use client';

import { redirect, useRouter } from 'next/navigation';
import React, { ChangeEvent, useEffect, useState } from 'react';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { StyledSelect } from '@/components/Multiselect/style';
import MuiSelect from '@/components/Select';

import { getAllBairros } from '@/services';
import { createAssociacao } from '@/services/associations';
import { getPresidents } from '@/services/user';
import { Bairro, GetPresidentsResponse, Presidente } from '@/types/api';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { AxiosError } from 'axios';

export default function Home() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [date, setDate] = useState('');
  const [telefone, setTelefone] = useState('');
  const [street, setStreet] = useState('');
  const [cep, setCEP] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');

  const [bairro, setBairro] = useState<Bairro[]>([]);
  const [selectedBairro, setSelectedBairro] = useState(1);

  const [presidents, setPresidents] = useState<Presidente[]>([]);
  const [selectedPresidents, setSelectedPresidents] = useState(2);

  const secretarioId = [3];

  const router = useRouter();

  const [errorMessage, setErrorMessage] = React.useState('');

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
    }

    getPresidents(token)
      .then((response: GetPresidentsResponse) => setPresidents(response.users))
      .catch((error) => console.log(error));
    getAllBairros(token)
      .then((response: { bairros: Bairro[] }) => setBairro(response.bairros))
      .catch((error) => console.log(error));
  }, []);

  const fetchAddress = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setStreet(data.logradouro || '');
        setComplement(data.complemento || '');

        const bairroViaCep = data.bairro?.toLowerCase().trim();

        if (bairroViaCep && bairro.length > 0) {
          const bairroMatch = bairro.find(
            (b) => b.nome.toLowerCase().trim() === bairroViaCep,
          );

          if (bairroMatch) {
            setSelectedBairro(bairroMatch.id);
          } else {
            console.warn('Bairro não encontrado nos dados cadastrados.');
            setErrorMessage('Bairro do CEP não encontrado em nosso cadastro.');
          }
        }
      } else {
        setErrorMessage('CEP não encontrado.');
      }
    } catch (error) {
      console.log(error);
      setErrorMessage('Erro ao buscar o CEP.');
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

  function convertDateToISO(dateStr: string): string {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }

  const handleRegister: (e: React.FormEvent) => Promise<void> = async (e) => {
    e.preventDefault();
    if (name.trim().length < 10) {
      setErrorMessage('Nome deve ter pelo menos 10 caracteres.');
      return;
    }

    if (!date || !cep || !street || !number) {
      setErrorMessage('Preencha todos os campos obrigatórios.');
      return;
    }
    try {
      const token = localStorage.getItem('@token');
      if (!token) {
        redirect('/');
      }
      await createAssociacao(
        {
          nome: name,
          email: email,
          telefone: telefone,
          data_fundacao: convertDateToISO(date),
          rua: street,
          cep: cep,
          numero: number,
          bairro_id: selectedBairro,
          secretarios_id: secretarioId,
          presidentes_id: [selectedPresidents],
        },
        token,
      );
      router.back();
    } catch (error) {
      console.log(error);
      if (
        error instanceof AxiosError &&
        error.response &&
        error.response.status === 500
      ) {
        setTimeout(() => {}, 4000);
      } else {
        setErrorMessage(
          'Erro ao cadastrar associação. Por favor, verifique os dados e tente novamente.',
        );
      }
    }
  };

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <h1>Cadastrar</h1>
        <p>
          <strong>Associação</strong>
        </p>
        <form className={S.form} onSubmit={handleRegister}>
          <h3>Dados</h3>
          <section>
            <div>
              <label htmlFor="nome">
                Nome<span>*</span>
              </label>
              <Input
                name="nome"
                type="text"
                placeholder="Nome"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email">E-mail</label>
              <Input
                name="email"
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <div>
              <label htmlFor="date">
                Data de Fundação<span>*</span>
              </label>
              <Input
                name="date"
                type="text"
                placeholder="dd/mm/aaaa"
                value={date}
                mask="date"
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <MuiSelect
              label="Presidentes"
              selectedNames={selectedPresidents}
              setSelectedNames={setSelectedPresidents}
            >
              {presidents?.map((item: Presidente) => (
                <StyledSelect
                  key={item.id}
                  value={item.id}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item.name}
                </StyledSelect>
              ))}
            </MuiSelect>
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
      <Snackbar open={errorMessage.length > 0}>
        <Alert variant="filled" severity="error">
          <AlertTitle>Erro!</AlertTitle>
          {errorMessage}
        </Alert>
      </Snackbar>
    </main>
  );
}
