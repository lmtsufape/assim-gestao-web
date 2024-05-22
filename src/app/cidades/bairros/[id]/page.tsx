/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { redirect } from 'next/navigation';
import React from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { BiSolidEditAlt } from 'react-icons/bi';
import { Tooltip, IconButton, Box, Typography, Modal } from '@mui/material';
import Link from 'next/link';

import S from './styles.module.scss';

import Loader from '@/components/Loader';
import TableView from '@/components/Table/Table';

import { getBairrosPorCidade } from '@/services/cidades';
import { useQuery } from '@tanstack/react-query';
import Button from '@/components/Button';

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

const Bairros = ({ params }: { params: { id: string } }) => {
  const [token, setToken] = React.useState<string | null>(null);
  const [infoModalOpen, setInfoModalOpen] = React.useState(false);

  React.useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
    } else {
      setToken(token);
    }
  }, []);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['bairros', params.id],
    queryFn: () => {
      if (token) {
        return getBairrosPorCidade(token, params.id);
      }
      return null;
    },
    enabled: !!token,
  });

  if (isLoading) return <Loader />;
  if (isError) return `Error: ${error.message}`;
  const handleCloseInfoModal = () => setInfoModalOpen(false);

  const columns: any = [
    {
      header: 'Nome',
      accessorKey: 'nome',
    },
    {
      header: 'Ações',
      accessorKey: 'id',
      cell: (info: any) => {
        const value = info.getValue();
        return (
          <ul className={S.action} role="list">
            <li>
              <Link href={`bairros/editar/${value}`}>
                <Tooltip title="Editar">
                  <IconButton aria-label="editar" size="small">
                    <BiSolidEditAlt />
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
          <div className={S.headerTitle}>
            <div className={S.back}>
              <Link href={`/cidades`} className={S.link}>
                <FaArrowLeft /> Voltar
              </Link>
            </div>
            <div>
              <h1 className={S.title}>Bairros</h1>
            </div>
          </div>
        </div>
        {data && data.length === 0 ? (
          <p>Não há bairros cadastrados para esta cidade.</p>
        ) : (
          data && <TableView columns={columns} data={data} />
        )}
      </section>
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
                <BiSolidEditAlt
                  style={{ verticalAlign: 'middle', marginRight: '5px' }}
                />
                <strong>Editar:</strong> Permite modificar informações do
                bairro.
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
    </div>
  );
};

export default Bairros;
