/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { redirect } from 'next/navigation';
import React from 'react';

import S from './styles.module.scss';
import Loader from '@/components/Loader';

import { getBanca, getAgricultor } from '@/services/banca';
import { Banca } from '@/types/api';
import Link from 'next/link';

const BancaDetails = ({ params }: { params: { id: number } }) => {
  const [content, setContent] = React.useState<Banca | null>(null);
  const [agricultor, setAgricultor] = React.useState<any | null>(null);

  React.useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
      return;
    }

    const fetchData = async () => {
      try {
        const bancaResponse = await getBanca(token, params.id);
        setContent(bancaResponse);

        const agricultorResponse = await getAgricultor(
          token,
          bancaResponse.agricultor_id,
        );
        setAgricultor(agricultorResponse);
      } catch (error) {
        console.log(error);
      }
    };

    fetchData();
  }, [params.id]);

  if (!content || !agricultor) {
    return <Loader />;
  }

  return (
    <main className={S.main}>
      <div className={S.container}>
        <div className={S.back}>
          <Link href="/bancas" className={S.link}>
            &lt; Voltar
          </Link>
        </div>
        <h1 className={S.title}>{content.nome}</h1>
        <div className={S.content}>
          <h2>Dados da Banca</h2>
          <h3>Descrição</h3>
          <p>{content.descricao}</p>
          <h3>Horário de Abertura</h3>
          <p>{content.horario_abertura}</p>
          <h3>Horário de Fechamento</h3>
          <p>{content.horario_fechamento}</p>
          <h3>Preço Mínimo</h3>
          <p>{content.preco_minimo}</p>
          <h3>Entrega</h3>
          <p>{content.entrega ? 'Sim' : 'Não'}</p>
          <h3>Agricultor</h3>
          <p>{agricultor.name}</p>
        </div>
      </div>
    </main>
  );
};

export default BancaDetails;
