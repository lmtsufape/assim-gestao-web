/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, useEffect, FormEvent } from 'react';
import { redirect, useRouter } from 'next/navigation';
import S from './styles.module.scss';
import Button from '@/components/Button';
import Input from '@/components/Input';
import {
  Snackbar,
  Alert,
  AlertTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Checkbox,
  ListItemText,
  OutlinedInput,
} from '@mui/material';
import { getFeira, updateFeira } from '@/services/feiras';
import { getAllBairros } from '@/services';
import { Bairro, Feira } from '@/types/api';

const diasDaSemana = [
  'domingo',
  'segunda-feira',
  'terca-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

interface UpdateFeiraProps {
  params: { id: string };
}

export default function UpdateFeira({ params }: UpdateFeiraProps) {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [selectedBairro, setSelectedBairro] = useState<number | string>('');
  const [errorMessage, setErrorMessage] = useState('');

  const router = useRouter();
  const [token, setToken] = useState('');

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
    setToken(token);

    getAllBairros(token)
      .then((response: { bairros: Bairro[] }) => setBairros(response.bairros))
      .catch((error: any) => console.log(error));

    getFeira(token, parseInt(params.id))
      .then((response: { feira: Feira }) => {
        setNome(response.feira.nome);
        setDescricao(response.feira.descricao);
        setDiasSelecionados(Object.keys(response.feira.horarios_funcionamento));
        setSelectedBairro(response.feira.bairro_id);
      })
      .catch((error: any) => console.log(error));
  }, [params.id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        redirect('/');
      }

      const feiraData = {
        nome: nome,
        descricao: descricao,
        horarios_funcionamento: diasSelecionados,
        bairro_id: selectedBairro,
      };

      await updateFeira(token, parseInt(params.id), feiraData);
      router.push('/feiras');
    } catch (error) {
      console.log(error);
      setErrorMessage('Erro ao atualizar feira. Por favor, tente novamente.');
    }
  };

  const handleDiasChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string[];
    setDiasSelecionados(value);
  };

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <h1>Atualizar Feira</h1>
        <form className={S.form} onSubmit={handleSubmit}>
          <h3>Dados da Feira</h3>
          <section>
            <div>
              <label htmlFor="nome">
                Nome<span>*</span>
              </label>
              <Input
                name="nome"
                type="text"
                placeholder="Informe o nome da feira"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="descricao">
                Descrição<span>*</span>
              </label>
              <Input
                name="descricao"
                type="text"
                placeholder="Informe a descrição"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="dias_funcionamento">
                Dias de Funcionamento<span>*</span>
              </label>
              <FormControl fullWidth>
                <InputLabel id="dias-label">Selecione os dias</InputLabel>
                <Select
                  labelId="dias-label"
                  id="dias_funcionamento"
                  multiple
                  value={diasSelecionados}
                  onChange={handleDiasChange}
                  input={<OutlinedInput label="Selecione os dias" />}
                  renderValue={(selected) => (selected as string[]).join(', ')}
                >
                  {diasDaSemana.map((dia) => (
                    <MenuItem key={dia} value={dia}>
                      <Checkbox checked={diasSelecionados.includes(dia)} />
                      <ListItemText primary={dia} />
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div>
              <label htmlFor="bairro">
                Bairro<span>*</span>
              </label>
              <FormControl fullWidth>
                <InputLabel id="bairro-label">Selecione o bairro</InputLabel>
                <Select
                  labelId="bairro-label"
                  id="bairro"
                  value={selectedBairro}
                  onChange={(e) => setSelectedBairro(e.target.value as number)}
                  input={<OutlinedInput label="Selecione o bairro" />}
                >
                  {bairros.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.nome}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
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
