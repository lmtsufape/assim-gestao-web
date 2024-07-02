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

import { getAllCidades } from '@/services/cidades';
import { Cidade } from '@/types/api';
import Loader from '@/components/Loader';
import { getBairro } from '@/services';

interface Params {
  id: number;
}

interface EditBairroProps {
  params: Params;
}

export default function EditBairro({ params }: EditBairroProps) {
  const [name, setName] = React.useState('');
  const [cidade, setCidade] = React.useState<Cidade[]>([]);
  const [selectedCidade, setSelectedCidade] = React.useState<number>(0);
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
        const cidades = await getAllCidades(token);
        setCidade(cidades);

        const bairro = await getBairro(token, params.id);
        setName(bairro.nome);
        setSelectedCidade(bairro.cidade_id);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchData();
  }, [params.id]);

  const handleUpdate: (e: React.FormEvent) => Promise<void> = async (e) => {
    e.preventDefault();
    try {
      if (!token) {
        redirect('/');
      }

      const bairroData = {
        nome: name,
        cidade_id: selectedCidade,
      };

      await updateBairro(token, params.id, bairroData);
      router.back();
    } catch (error: any) {
      console.log(error);
      if (error.response && error.response.status === 500) {
        setTimeout(() => {}, 4000);
      } else {
        setErrorMessage(
          'Erro ao atualizar bairro. Por favor, verifique os dados e tente novamente.',
        );
      }
    }
  };

  if (loading) return <Loader />;

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <h1>Editar Bairro</h1>
        <form className={S.form} onSubmit={handleUpdate}>
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
}
