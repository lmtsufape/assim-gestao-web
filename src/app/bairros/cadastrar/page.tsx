/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { redirect, useRouter } from 'next/navigation';
import React from 'react';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';
import { StyledSelect } from '@/components/Multiselect/style';
import MuiSelect from '@/components/Select';
import { Snackbar, Alert, AlertTitle } from '@mui/material';

import { getAllEstados } from '@/services/estado';
import { createCidade } from '@/services/cidades';
import { Estado } from '@/types/api';

export default function Home() {
  const [name, setName] = React.useState('');
  const [estado, setEstado] = React.useState<Estado[]>([]);
  const [selectedEstado, setSelectedEstado] = React.useState<string | number>(
    '',
  );

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

    getAllEstados(token)
      .then((response: any) => setEstado(response))
      .catch((error: any) => console.log(error));
  }, []);

  const handleRegister: (e: React.FormEvent) => Promise<void> = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('@token');
      if (!token) {
        redirect('/');
      }

      const cidadeData = new FormData();
      cidadeData.append('nome', name);
      cidadeData.append('estado_id', selectedEstado.toString());

      await createCidade(token, cidadeData);
      router.back();
    } catch (error: any) {
      console.log(error);
      if (error.response && error.response.status === 500) {
        setTimeout(() => {}, 4000);
      } else {
        setErrorMessage(
          'Erro ao cadastrar cidade. Por favor, verifique os dados e tente novamente.',
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
              label="Estado"
              selectedNames={selectedEstado}
              setSelectedNames={(value) => setSelectedEstado(value as number)}
            >
              {estado?.map((item) => (
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
