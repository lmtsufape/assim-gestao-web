'use client';

import { redirect, useRouter } from 'next/navigation';
import React from 'react';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { StyledSelect } from '@/components/Multiselect/style';
import MuiSelect from '@/components/Select';

import { createBairro } from '@/services';
import { getAllCidades } from '@/services/cidades';
import { Bairro, Cidade } from '@/types/api';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { AxiosError } from 'axios';

export default function Home() {
  const [name, setName] = React.useState('');
  const [cidade, setCidade] = React.useState<Cidade[]>([]);
  const [selectedCidade, setSelectedCidade] = React.useState<number>(0);

  const router = useRouter();
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  React.useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
    }

    getAllCidades(token)
      .then((response) => setCidade(response))
      .catch((error) => console.log(error));
  }, []);

  const handleRegister: (e: React.FormEvent) => Promise<void> = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('@token');
      if (!token) {
        redirect('/');
      }

      const bairroData: Partial<Bairro> = {
        nome: name,
        cidade_id: selectedCidade,
      };

      await createBairro(token, bairroData);
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
          'Erro ao cadastrar bairro. Por favor, verifique os dados e tente novamente.',
        );
      }
    }
  };

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <h1>Cadastrar</h1>
        <p>
          <strong>Bairro</strong>
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
            <MuiSelect
              label="Cidade"
              selectedNames={selectedCidade}
              setSelectedNames={(value) => setSelectedCidade(value as number)}
            >
              {cidade?.map((item) => (
                <StyledSelect
                  key={item.id}
                  value={item.id}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item.nome}
                </StyledSelect>
              ))}
            </MuiSelect>
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
