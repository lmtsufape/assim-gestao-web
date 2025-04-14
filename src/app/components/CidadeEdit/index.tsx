'use client';

import { redirect, useRouter } from 'next/navigation';
import React from 'react';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import { StyledSelect } from '@/components/Multiselect/style';
import MuiSelect from '@/components/Select';

import { getCidade, updateCidade } from '@/services/cidades';
import { getAllEstados } from '@/services/estado';
import { Estado } from '@/types/api';
import { Snackbar, Alert, AlertTitle } from '@mui/material';
import { AxiosError } from 'axios';

type CidadeEditHomeProps = {
  id: number;
};

const CidadeEditHome = ({ id }: CidadeEditHomeProps) => {
  const [name, setName] = React.useState('');
  const [estado, setEstado] = React.useState<Estado[]>([]);
  const [selectedEstado, setSelectedEstado] = React.useState<string | number>(
    '',
  );
  const [loading, setLoading] = React.useState(true);

  const router = useRouter();
  const [token, setToken] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
    }
    setToken(token);

    const fetchData = async () => {
      try {
        const estados = await getAllEstados(token);
        setEstado(estados);

        const cidade = await getCidade(token, id);
        setName(cidade.nome);
        setSelectedEstado(cidade.estado_id);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleRegister: (e: React.FormEvent) => Promise<void> = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        redirect('/');
      }

      const cidadeData = {
        nome: name,
        estado_id: Number(selectedEstado),
      };

      await updateCidade(token, id, cidadeData);
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
          'Erro ao atualizar cidade. Por favor, verifique os dados e tente novamente.',
        );
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <h1>Editar Cidade</h1>
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
              Atualizar
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
};

export default CidadeEditHome;
