/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState, FormEvent, useEffect } from 'react';
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
  TextField,
} from '@mui/material';
import { getAllBairros } from '@/services';
import { createFeira } from '@/services/feiras';
import { Bairro } from '@/types/api';

const diasDaSemana = [
  'domingo',
  'segunda-feira',
  'terca-feira',
  'quarta-feira',
  'quinta-feira',
  'sexta-feira',
  'sábado',
];

export default function CreateFeira() {
  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [diasSelecionados, setDiasSelecionados] = useState<string[]>([]);
  const [horariosFuncionamento, setHorariosFuncionamento] = useState<{
    [key: string]: [string, string];
  }>({});
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
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      if (!token) {
        redirect('/');
      }

      const formData = new FormData();
      formData.append('nome', nome);
      formData.append('descricao', descricao);
      formData.append(
        'horarios_funcionamento',
        JSON.stringify(horariosFuncionamento),
      );
      formData.append('associacao_id', '1');
      if (selectedBairro)
        formData.append('bairro_id', selectedBairro.toString());

      await createFeira(token, formData);
      router.push('/feiras');
    } catch (error) {
      console.log(error);
      setErrorMessage('Erro ao criar feira. Por favor, tente novamente.');
    }
  };

  const handleDiasChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    const value = event.target.value as string[];
    setDiasSelecionados(value);
  };

  const handleHorarioChange = (dia: string, index: number, value: string) => {
    setHorariosFuncionamento((prev) => ({
      ...prev,
      [dia]: [
        index === 0 ? value : prev[dia]?.[0] || '',
        index === 1 ? value : prev[dia]?.[1] || '',
      ],
    }));
  };

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <h1>Cadastrar Feira</h1>
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
            {diasSelecionados.map((dia) => (
              <div key={dia}>
                <label>
                  Horários de {dia.charAt(0).toUpperCase() + dia.slice(1)}:
                </label>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <TextField
                    label="Início"
                    type="time"
                    value={horariosFuncionamento[dia]?.[0] || ''}
                    onChange={(e) =>
                      handleHorarioChange(dia, 0, e.target.value)
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300,
                    }}
                  />
                  <TextField
                    label="Fim"
                    type="time"
                    value={horariosFuncionamento[dia]?.[1] || ''}
                    onChange={(e) =>
                      handleHorarioChange(dia, 1, e.target.value)
                    }
                    InputLabelProps={{
                      shrink: true,
                    }}
                    inputProps={{
                      step: 300,
                    }}
                  />
                </div>
              </div>
            ))}
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
