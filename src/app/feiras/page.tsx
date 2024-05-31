/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import { BiSolidTrashAlt, BiSolidEditAlt } from 'react-icons/bi';
import { BsFillEyeFill, BsInfoCircle } from 'react-icons/bs';
import { FaStore } from 'react-icons/fa';

import S from './styles.module.scss';

import Button from '@/components/Button';
import StyledLink from '@/components/Link';
import Loader from '@/components/Loader';
import TableView from '@/components/Table/Table';

import { getAllFeiras, deleteFeira } from '@/services/feiras';
import {
  Box,
  IconButton,
  Tooltip,
  Modal,
  Typography,
  Snackbar,
  Alert,
  AlertTitle,
} from '@mui/material';
import { useMutation, useQuery } from '@tanstack/react-query';

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: '#fff',
  boxShadow: 24,
  border: 'none',
  borderRadius: 4,
  p: 4,
};

export default function Feiras() {
  const [value, setValue] = React.useState(0);
  const handleClose = () => setValue(0);
  const [token, setToken] = React.useState('');
  const [infoModalOpen, setInfoModalOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  React.useEffect(() => {
    const token = localStorage.getItem('@token');
    const rolesString = localStorage.getItem('@roles');
    const roles = rolesString ? JSON.parse(rolesString) : '';
    const filter = roles.map((item: { id: number }) => item.id);
    if (!token) {
      redirect('/');
    }
    if (filter.includes(5) || filter.includes(4)) {
      redirect('/default');
    }
    setToken(token);
  }, []);

  const mutation = useMutation({
    mutationFn: ({ token, value }: { token: string; value: number }) => {
      return deleteFeira(token, value);
    },
    onSuccess: () => {
      refetch();
      handleClose();
    },
    onError: (error: any) => {
      setErrorMessage(error.message);
    },
  });

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['feiras'],
    queryFn: () => {
      const token = localStorage.getItem('@token');
      if (token) {
        return getAllFeiras(token);
      }
      return null;
    },
  });

  if (isLoading) return <Loader />;
  if (isError) return `Error: ${error?.message}`;

  const handleOpenInfoModal = () => setInfoModalOpen(true);
  const handleCloseInfoModal = () => setInfoModalOpen(false);

  const formatHorariosFuncionamento = (horarios: Record<string, string[]>) => {
    return Object.entries(horarios)
      .map(([dia]) => `${dia}`)
      .join(', ');
  };

  const columns: any = [
    {
      header: 'Nome',
      accessorKey: 'nome',
    },
    {
      header: 'Dia da Semana',
      accessorKey: 'horarios_funcionamento',
      cell: (info: any) => {
        const value = info.getValue();
        return <p>{formatHorariosFuncionamento(value)}</p>;
      },
    },
    {
      header: 'Descrição',
      accessorKey: 'descricao',
    },
    {
      header: () => (
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          Ações
          <Tooltip title="Clique aqui para informações sobre os ícones">
            <IconButton
              size="small"
              style={{ marginLeft: '5px', color: 'white' }}
              onClick={handleOpenInfoModal}
            >
              <BsInfoCircle />
            </IconButton>
          </Tooltip>
        </div>
      ),
      accessorKey: 'id',
      cell: (info: any) => {
        const value = info.getValue();
        return (
          <ul className={S.action} role="list">
            <li>
              <Link href={`feiras/${value}`}>
                <Tooltip title="Ver Detalhes">
                  <IconButton aria-label="detalhes" size="small">
                    <BsFillEyeFill />
                  </IconButton>
                </Tooltip>
              </Link>
            </li>
            <li>
              <Link href={`feiras/editar/${value}`}>
                <Tooltip title="Editar">
                  <IconButton aria-label="editar" size="small">
                    <BiSolidEditAlt />
                  </IconButton>
                </Tooltip>
              </Link>
            </li>
            <li>
              <Link href={`feiras/${value}/bancas`}>
                <Tooltip title="Ver Bancas">
                  <IconButton aria-label="bancas" size="small">
                    <FaStore />
                  </IconButton>
                </Tooltip>
              </Link>
            </li>
            <li>
              <Tooltip title="Remover">
                <IconButton
                  onClick={() => setValue(value)}
                  aria-label="Deletar"
                  size="small"
                >
                  <BiSolidTrashAlt />
                </IconButton>
              </Tooltip>
            </li>
          </ul>
        );
      },
    },
  ];

  return (
    <div style={{ marginTop: '5rem' }}>
      <section className={S.dashboard}>
        <div className={S.header}>
          <div className={S.headerTitle}>
            <div className={S.back}>
              <Link href="/menu" className={S.link}>
                &lt; Voltar
              </Link>
            </div>
            <div>
              <h1 className={S.title}>Feiras</h1>
            </div>
            <div className={S.addButton}>
              <StyledLink
                href="feiras/cadastrar"
                data-type="filled"
                text="Adicionar Nova Feira"
              />
            </div>
          </div>
        </div>
        {data && data.feiras ? (
          <TableView columns={columns} data={data.feiras} />
        ) : (
          <p>Nenhuma feira encontrada</p>
        )}
      </section>
      <div>
        <Modal
          open={value > 0}
          onClose={handleClose}
          aria-labelledby="modal-modal-title"
          aria-describedby="modal-modal-description"
        >
          <Box sx={style}>
            <Typography id="modal-modal-title" variant="h6" component="h2">
              Tem certeza que deseja excluir?
            </Typography>
            <div className={S.buttons}>
              <Button
                type="button"
                dataType="transparent"
                onClick={handleClose}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={() => mutation.mutate({ token: token, value: value })}
                style={{ backgroundColor: '#f76c6c', color: '#ffffff' }}
              >
                Excluir
              </Button>
            </div>
          </Box>
        </Modal>
        <Modal
          open={infoModalOpen}
          onClose={handleCloseInfoModal}
          aria-labelledby="info-modal-title"
          aria-describedby="info-modal-description"
        >
          <Box sx={style}>
            <Typography id="info-modal-title" variant="h6" component="h2">
              Informações dos Ícones de Ação
            </Typography>
            <Typography id="info-modal-description" sx={{ mt: 2 }}>
              <ul>
                <li>
                  <BsFillEyeFill
                    style={{ verticalAlign: 'middle', marginRight: '5px' }}
                  />
                  <strong>Ver Detalhes:</strong> Abre uma página com os detalhes
                  da feira.
                </li>
                <li>
                  <BiSolidEditAlt
                    style={{ verticalAlign: 'middle', marginRight: '5px' }}
                  />
                  <strong>Editar:</strong> Permite modificar informações da
                  feira.
                </li>
                <li>
                  <FaStore
                    style={{ verticalAlign: 'middle', marginRight: '5px' }}
                  />
                  <strong>Ver Bancas:</strong> Abre uma página com as bancas
                  associadas à feira.
                </li>
                <li>
                  <BiSolidTrashAlt
                    style={{ verticalAlign: 'middle', marginRight: '5px' }}
                  />
                  <strong>Remover:</strong> Exclui a feira após confirmação.
                </li>
              </ul>
              <br />
            </Typography>
            <Button
              onClick={handleCloseInfoModal}
              type={'button'}
              dataType="filled"
            >
              Voltar
            </Button>
          </Box>
        </Modal>
        <Snackbar
          open={errorMessage.length > 0}
          autoHideDuration={6000}
          onClose={() => setErrorMessage('')}
        >
          <Alert
            onClose={() => setErrorMessage('')}
            severity="error"
            variant="filled"
          >
            <AlertTitle>Erro</AlertTitle>
            {errorMessage}
          </Alert>
        </Snackbar>
      </div>
    </div>
  );
}
