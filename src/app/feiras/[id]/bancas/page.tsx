/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import { redirect, useParams } from 'next/navigation';
import React from 'react';
import { BsFillEyeFill, BsInfoCircle } from 'react-icons/bs';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Loader from '@/components/Loader';
import TableView from '@/components/Table/Table';

import { deleteBanca } from '@/services/banca';
import { getBancasByFeira } from '@/services/feiras';
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

export default function Bancas() {
  const [bancaId, setBancaId] = React.useState<number | null>(null);
  const handleClose = () => setBancaId(null);
  const [token, setToken] = React.useState('');
  const [infoModalOpen, setInfoModalOpen] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState('');

  const params = useParams();
  const feiraId = params.id as string;

  React.useEffect(() => {
    if (!feiraId) {
      console.error('feiraId não encontrado nos parâmetros de busca');
      return;
    }
    console.log('Feira ID:', feiraId);
  }, [feiraId]);

  React.useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
    }
    setToken(token);
  }, []);

  const mutation = useMutation({
    mutationFn: ({ token, bancaId }: { token: string; bancaId: number }) => {
      return deleteBanca(token, bancaId);
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
    queryKey: ['bancas'],
    queryFn: () => {
      if (token && feiraId) {
        return getBancasByFeira(token, parseInt(feiraId));
      }
      return null;
    },
    enabled: !!token && !!feiraId,
  });

  if (isLoading) return <Loader />;
  if (isError) return `Error: ${error.message}`;
  const handleOpenInfoModal = () => setInfoModalOpen(true);
  const handleCloseInfoModal = () => setInfoModalOpen(false);

  const columns: any = [
    {
      header: 'Nome',
      accessorKey: 'nome',
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
        const value: number = info.getValue();
        return (
          <ul className={S.action} role="list">
            <li>
              <Link href={`/feiras/${feiraId}/bancas/${value}`}>
                <Tooltip title="Visualizar Detalhes">
                  <IconButton aria-label="detalhes" size="small">
                    <BsFillEyeFill />
                  </IconButton>
                </Tooltip>
              </Link>
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
          <div className={S.back}>
            <Link href="/menu" className={S.link}>
              &lt; Voltar
            </Link>
          </div>
          <div>
            <h1 className={S.title}>Bancas</h1>
          </div>
        </div>
        {data && data.bancas ? (
          <TableView columns={columns} data={data.bancas} />
        ) : (
          <p>Nenhuma banca encontrada</p>
        )}
      </section>
      <Modal
        open={bancaId !== null}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Typography id="modal-modal-title" variant="h6" component="h2">
            Tem certeza que deseja excluir esta banca?
          </Typography>
          <div className={S.buttons}>
            <Button type="button" dataType="transparent" onClick={handleClose}>
              Cancelar
            </Button>
            <Button
              type="button"
              onClick={() =>
                bancaId && mutation.mutate({ token: token, bancaId: bancaId })
              }
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
                <strong>Visualizar:</strong> Abre uma página de detalhes da
                banca.
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
  );
}
