'use client';

import { redirect, useRouter } from 'next/navigation';
import React, { ChangeEvent } from 'react';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import { StyledSelect } from '@/components/Multiselect/style';
import MuiSelect from '@/components/Select';

import { getAllBairros } from '@/services';
import { editAssociacao, getAssociacao } from '@/services/associations';
import { getPresidents } from '@/services/user';
import {
  Associacao,
  Bairro,
  GetBairrosResponse,
  GetPresidentsResponse,
  Presidente,
} from '@/types/api';
import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { AxiosError } from 'axios';

type AssociacaoEditHomeProps = {
  id: string;
};

const AssociacaoEditHome = ({ id }: AssociacaoEditHomeProps) => {
  const [content, setContent] = React.useState<Associacao | null>(null);
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [date, setDate] = React.useState('');
  const [street, setStreet] = React.useState('');
  const [cep, setCEP] = React.useState('');
  const [number, setNumber] = React.useState('');
  const [complement, setComplement] = React.useState('');

  const [bairro, setBairro] = React.useState<Bairro[]>([]);
  const [selectedBairro, setSelectedBairro] = React.useState<number>(0);

  const [presidents, setPresidents] = React.useState<Presidente[]>([]);
  const [selectedPresidents, setSelectedPresidents] = React.useState(0);

  const [error, setError] = React.useState('');

  const router = useRouter();

  React.useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
    }
    getAssociacao(token, id)
      .then((response: Associacao) => {
        setContent(response);
      })
      .catch((error) => console.log(error));
    getPresidents(token)
      .then((response: GetPresidentsResponse) => {
        setPresidents(response.users);
      })
      .catch((error) => console.log(error));
    getAllBairros(token)
      .then((response: GetBairrosResponse) => {
        setBairro(response.bairros);
      })
      .catch((error) => console.log(error));
  }, [id]);

  function formatDateToInput(dateString: string | undefined): string {
    if (!dateString) return '';
    const [year, month, day] = dateString.split('-');
    return `${day}/${month}/${year}`;
  }

  React.useEffect(() => {
    if (content) {
      setName(content.nome ?? '');
      setEmail(content.contato?.email ?? '');
      setPhone(content.contato?.telefone ?? '');
      setDate(formatDateToInput(content.data_fundacao));
      setStreet(content.endereco?.rua ?? '');
      setCEP(content.endereco?.cep ?? '');
      setNumber(content.endereco?.numero ?? '');
      setComplement(content.endereco?.complemento ?? '');
    }
  }, [content]);

  React.useEffect(() => {
    if (content?.endereco?.bairro_id) {
      setSelectedBairro(content.endereco.bairro_id);
    }
  }, [content]);

  if (!content) {
    return <Loader />;
  }

  const presidentDefault = content.presidentes?.map(
    (item: Presidente) => item.id,
  );

  const fetchAddress = async (cep: string) => {
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setStreet(data.logradouro || '');
        setComplement(data.complemento || '');

        const bairroViaCep = data.bairro?.toLowerCase().trim();

        if (bairroViaCep && bairro.length > 0) {
          const bairroMatch = bairro.find(
            (b) => b.nome.toLowerCase().trim() === bairroViaCep,
          );

          if (bairroMatch) {
            setSelectedBairro(bairroMatch.id);
          } else {
            console.warn('Bairro não encontrado nos dados cadastrados.');
            setError('Bairro do CEP não encontrado em nosso cadastro.');
          }
        }
      } else {
        setError('CEP não encontrado.');
      }
    } catch (error) {
      console.log(error);
      setError('Erro ao buscar o CEP.');
    }
  };

  function convertDateToISO(dateStr: string): string {
    const [day, month, year] = dateStr.split('-');
    return `${year}-${month}-${day}`;
  }

  const handleCEPChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const target = e.target as HTMLInputElement;
    let cepValue = target.value.replace(/\D/g, '');

    if (cepValue.length > 5) {
      cepValue = cepValue.slice(0, 5) + '-' + cepValue.slice(5, 8);
    }

    setCEP(cepValue);
    if (cepValue.replace('-', '').length === 8) {
      fetchAddress(cepValue.replace('-', ''));
    }
  };

  const handleEditRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('@token');
      if (!token) {
        redirect('/');
      }

      const requestData = {
        nome: name || (content.nome ?? ''),
        email: email || (content?.contato?.email ?? ''),
        telefone: phone || (content?.contato?.telefone ?? ''),
        data_fundacao: convertDateToISO(date) || (content?.data_fundacao ?? ''),
        rua: street || (content?.endereco?.rua ?? ''),
        cep: cep || (content?.endereco?.cep ?? ''),
        numero: number || (content?.endereco?.numero ?? ''),
        bairro_id: selectedBairro,
        secretarios_id: [1],
        presidentes_id: getSelectedPresidents(),
        complemento: complement || (content?.endereco?.complemento ?? ''),
      };

      await editAssociacao(requestData, token, id);
      router.back();
    } catch (error) {
      let errors;
      if (error instanceof AxiosError) {
        console.log(error.response?.data?.message);
        errors = error.response?.data?.errors;
      }
      if (errors !== undefined && errors !== null) {
        for (const key of Object.keys(errors)) {
          const errorMessage = errors[key][0];
          setTimeout(() => {
            setError(`${errorMessage}`);
            window.location.reload();
          }, 3000);
        }
      }
    }
  };

  function getSelectedPresidents(): number[] {
    if (selectedPresidents > 0) {
      return [selectedPresidents];
    } else if (presidentDefault) {
      return [Number(presidentDefault)];
    } else {
      return [];
    }
  }

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <h1>Editar</h1>
        <p>
          <strong>{content.nome}</strong>
        </p>
        <form className={S.form} onSubmit={handleEditRegister}>
          <section>
            <div>
              <label htmlFor="nome">
                Nome<span>*</span>
              </label>
              <Input
                name="nome"
                type="text"
                placeholder={content.nome}
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="email">E-mail</label>
              <Input
                name="email"
                type="email"
                placeholder={content.contato?.email ?? ''}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="telefone">Telefone</label>
              <Input
                name="telefone"
                type="text"
                placeholder={content.contato?.telefone ?? ''}
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                mask="phone"
              />
            </div>
            <div>
              <label htmlFor="date">
                Data de Fundação<span>*</span>
              </label>
              <Input
                name="date"
                type="text"
                mask="date"
                placeholder={content.data_fundacao}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <MuiSelect
              label="Presidentes"
              selectedNames={selectedPresidents}
              setSelectedNames={setSelectedPresidents}
            >
              {presidents?.map((item: Presidente) => (
                <StyledSelect
                  key={item.id}
                  value={item.id}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item.name}
                </StyledSelect>
              ))}
            </MuiSelect>
          </section>
          <h3>Endereço</h3>
          <section>
            <div>
              <label htmlFor="cep">
                Cep<span>*</span>
              </label>
              <Input
                name="cep"
                type="text"
                placeholder={content.endereco?.cep ?? ''}
                value={cep}
                onChange={handleCEPChange}
                mask="zipCode"
              />
            </div>
            <MuiSelect
              label="Bairro"
              selectedNames={selectedBairro}
              setSelectedNames={setSelectedBairro}
            >
              {bairro?.map((item: { id: number; nome: string }) => (
                <StyledSelect
                  key={item.id}
                  value={item.id}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item.nome}
                </StyledSelect>
              ))}
            </MuiSelect>
            <div>
              <label htmlFor="street">
                Rua<span>*</span>
              </label>
              <Input
                name="street"
                type="text"
                placeholder={content.endereco?.rua ?? ''}
                value={street}
                onChange={(e) => setStreet(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="number">
                Número<span>*</span>
              </label>
              <Input
                name="number"
                type="number"
                placeholder={content.endereco?.numero ?? ''}
                value={number}
                onChange={(e) => setNumber(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="complement">Complemento</label>
              <Input
                name="complement"
                type="text"
                placeholder={content.endereco?.complemento ?? ''}
                value={complement}
                onChange={(e) => setComplement(e.target.value)}
              />
            </div>
          </section>
          <div className={S.wrapperButtons}>
            <Button
              onClick={() => router.back()}
              type="button"
              dataType="transparent"
            >
              Voltar
            </Button>
            <Button dataType="filled" type="submit">
              Editar
            </Button>
          </div>
        </form>
        <Snackbar open={error.length > 0} autoHideDuration={6000}>
          <Alert variant="filled" severity="error">
            <AlertTitle>Erro!</AlertTitle>
            {error}
          </Alert>
        </Snackbar>
      </div>
    </main>
  );
};

export default AssociacaoEditHome;
