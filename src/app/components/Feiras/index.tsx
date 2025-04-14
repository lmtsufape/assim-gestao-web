'use client';

import Image from 'next/image';
import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import React from 'react';
import { BiSolidEditAlt } from 'react-icons/bi';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Loader from '@/components/Loader';

import { getAssociacao } from '@/services/associations';
import { getBairro } from '@/services/bairro';
import { getFeira } from '@/services/feiras';
import { Feira } from '@/types/api';

type FeirasHomeProps = {
  id: number;
};

const FeirasHome = ({ id }: FeirasHomeProps) => {
  const [content, setContent] = React.useState<Feira | null>(null);
  const [bairro, setBairro] = React.useState<string>('');
  const [associacao, setAssociacao] = React.useState<string>('');

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
        const feiraResponse = await getFeira(token, id);
        setContent(feiraResponse.feira);

        const bairroResponse = await getBairro(
          token,
          feiraResponse.feira.bairro_id,
        );
        setBairro(bairroResponse.nome);

        if (feiraResponse.feira.associacao_id) {
          const associacaoResponse = await getAssociacao(
            token,
            feiraResponse.feira.associacao_id.toString(),
          );
          setAssociacao(associacaoResponse.nome);
        }
      } catch (error) {
        console.log(error);
      }
    }

    fetchData();
  }, [id]);

  if (!content) {
    return <Loader />;
  }

  return (
    <main className={S.main}>
      <div className={S.container}>
        <div className={S.back}>
          <Link href="/feiras" className={S.link}>
            &lt; Voltar
          </Link>
        </div>
        <h1 className={S.title}>{content.nome}</h1>
        <div className={S.content}>
          <h2>Dados da Feira</h2>
          <h3>Descrição</h3>
          <p>{content.descricao}</p>

          <h3>Horários de Funcionamento</h3>
          {Object.keys(content.horarios_funcionamento).map((dia) => (
            <div key={dia}>
              <h4>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h4>
              <p>
                Início: {content.horarios_funcionamento[dia][0]} - Fim:{' '}
                {content.horarios_funcionamento[dia][1]}
              </p>
            </div>
          ))}
          <h3>Bairro</h3>
          <p>{bairro}</p>
          <h3>Associação</h3>
          <p>{associacao}</p>
          {content.imagem && (
            <>
              <h3>Imagem</h3>
              <Image src={content.imagem} alt={`Imagem de ${content.nome}`} />
            </>
          )}
          <div className={S.editButton}>
            <Button
              onClick={() => router.push('/feiras/editar/' + id)}
              type="button"
              dataType="edit"
            >
              {' '}
              Editar
              <BiSolidEditAlt />
            </Button>
          </div>
        </div>
      </div>
    </main>
  );
};

export default FeirasHome;
