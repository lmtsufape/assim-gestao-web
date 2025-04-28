'use client';

import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import React from 'react';

import S from './styles.module.scss';
import Loader from '@/components/Loader';

import { getBanca } from '@/services/banca';
import { Banca } from '@/types/api';
import { getFeira } from '@/services/feiras';
import { getAgricultor } from '@/services/banca';

const BancaDetails = ({
  params,
}: {
  params: { id: string; bancaId: string };
}) => {
  const [content, setContent] = React.useState<Banca | null>(null);
  const [feira, setFeira] = React.useState<string>('');
  const [agricultor, setAgricultor] = React.useState<string>('');
  const router = useRouter();

  React.useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
    }

    async function fetchData() {
      const token = localStorage.getItem('@token');
      if (!token) {
        redirect('/');
      }
      try {
        const bancaResponse = await getBanca(token, parseInt(params.bancaId));
        setContent(bancaResponse);

        if (bancaResponse.feira_id) {
          const feiraResponse = await getFeira(token, bancaResponse.feira_id);
          setFeira(feiraResponse.feira.nome);
        }

        if (bancaResponse.agricultor_id) {
          const agricultorResponse = await getAgricultor(
            token,
            bancaResponse.agricultor_id,
          );
          setAgricultor(agricultorResponse.nome);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, [params.id]);

  if (!content) {
    return <Loader />;
  }

  return (
    <main className={S.main}>
      <div className={S.container}>
        <div className={S.back}>
          <Link href={`/feiras/${content.feira_id}/bancas`} className={S.link}>
            &lt; Voltar
          </Link>
        </div>
        <h1 className={S.title}>{content.nome}</h1>
        <div className={S.content}>
          <h2>Dados da Banca</h2>
          <h3>Descrição</h3>
          <p>{content.descricao}</p>

          <h3>Feira</h3>
          <p>{feira}</p>

          <h3>Agricultor</h3>
          <p>{agricultor}</p>
        </div>
      </div>
    </main>
  );
};

export default BancaDetails;
