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
  TextField,
  SelectChangeEvent,
} from '@mui/material';
import { getFeira, updateFeira } from '@/services/feiras';
import { getAllAssociacoes, getAllBairros } from '@/services';
import { Bairro, Feira } from '@/types/api';
import MuiSelect from '@/components/Select';
import { StyledSelect } from '@/components/Multiselect/style';
import { useQuery } from '@tanstack/react-query';

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
  const [horariosFuncionamento, setHorariosFuncionamento] = useState<{
    [key: string]: [string, string];
  }>({});
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [selectedBairro, setSelectedBairro] = useState<number | string>('');
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedAssociacoes, setSelectedAssociacoes] = React.useState(1);

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
        setHorariosFuncionamento(response.feira.horarios_funcionamento);
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
        horarios_funcionamento: horariosFuncionamento,
        bairro_id: selectedBairro,
        associacao_id: selectedAssociacoes,
      };

      await updateFeira(token, parseInt(params.id), feiraData);
      router.push('/feiras');
    } catch (error) {
      console.log(error);
      setErrorMessage('Erro ao atualizar feira. Por favor, tente novamente.');
    }
  };

  const handleDiasChange = (event: SelectChangeEvent<string[]>) => {
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
                    renderValue={(selected) =>
                      (selected as string[]).join(', ')
                    }
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
                  <div
                    style={{ display: 'flex', gap: '1rem', marginTop: '10px' }}
                  >
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
            </div>
            <div>
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
