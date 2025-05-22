'use client';

import Link from 'next/link';
import { redirect, useRouter } from 'next/navigation';
import React, { ChangeEvent } from 'react';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';
import Loader from '@/components/Loader';
import MultiSelect from '@/components/Multiselect';
import { StyledSelect } from '@/components/Multiselect/style';
import MuiSelect from '@/components/Select';

import {
  editOCS,
  getAllBairros,
  getOCS,
  getAllAssociacoes,
  getAllUsers,
} from '@/services';
import { OCS, User, Bairro } from '@/types/api';
import { Alert, AlertTitle, Snackbar } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AxiosError } from 'axios';

type OcsEditHomeProps = {
  id: number;
};

const OcsEditHome = ({ id }: OcsEditHomeProps) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [cnpj, setCNPJ] = React.useState('');
  const [telefone, setTelefone] = React.useState('');
  const [street, setStreet] = React.useState('');
  const [cep, setCEP] = React.useState('');
  const [number, setNumber] = React.useState('');
  const [complement, setComplement] = React.useState('');

  const [selectedAssociacoes, setSelectedAssociacoes] = React.useState(1);

  const [bairro, setBairro] = React.useState<Bairro[]>([]);
  const [selectedBairro, setSelectedBairro] = React.useState(0);

  const [selectedAgricultores, setSelectedAgricultores] = React.useState<
    string | string[]
  >([]);

  const [content, setContent] = React.useState<OCS | null>(null);
  const [error, setError] = React.useState('');

  const router = useRouter();

  interface OCSResponse {
    ocs: OCS;
  }

  const { data: agricultores } = useQuery({
    queryKey: ['users'],
    queryFn: () => {
      const token = localStorage.getItem('@token');
      if (token) {
        return getAllUsers(token);
      }
      return null;
    },
  });

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

  React.useEffect(() => {
    const token = localStorage.getItem('@token');
    if (!token) {
      redirect('/');
    }
    getOCS(token, id.toString())
      .then((response: OCSResponse) => setContent(response.ocs))
      .catch((error) => console.log(error));
    getAllBairros(token)
      .then((response: { bairros: Bairro[] }) => setBairro(response.bairros))
      .catch((error) => console.log(error));
  }, [id]);

  React.useEffect(() => {
    if (content) {
      setName(content.nome ?? '');
      setEmail(content.contato?.email ?? '');
      setCNPJ(content.cnpj ?? '');
      setTelefone(content.contato?.telefone ?? '');
      setStreet(content.endereco?.rua ?? '');
      setCEP(content.endereco?.cep ?? '');
      setNumber(content.endereco?.numero ?? '');
      setComplement(content.endereco?.complemento ?? '');
      setSelectedBairro(content.endereco?.bairro_id ?? 0);
      setSelectedAssociacoes(content.associacao_id ?? 1);
    }
  }, [content]);

  if (!content) {
    return <Loader />;
  }

  const associacaoDefault = content?.associacao_id;
  const bairrosDefault = content?.endereco?.bairro_id;
  const agricultoresDefault = content?.agricultores_id;

  const filterAgricultores = agricultores?.users?.filter((user: User) => {
    return user?.roles?.some(
      (role) =>
        typeof role !== 'number' &&
        typeof role !== 'string' &&
        role.nome === 'agricultor',
    );
  });

  const mapAgricultoresToIds = (
    selectedAgricultoresNames: string | string[],
    filterAgricultores: User[],
  ): number[] => {
    const selectedAgricultoresIds: number[] = [];
    filterAgricultores.forEach((agricultor) => {
      if (
        agricultor.id !== undefined &&
        selectedAgricultoresNames.includes(agricultor.name)
      ) {
        selectedAgricultoresIds.push(agricultor.id);
      }
    });
    return selectedAgricultoresIds;
  };

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

      const selectedAgricultoresIds = mapAgricultoresToIds(
        selectedAgricultores,
        filterAgricultores || [],
      );

      const requestData = {
        cep: cep || content?.endereco?.cep,
        nome: name || content.nome,
        cnpj: cnpj || content.cnpj,
        email: email || content?.contato?.email,
        telefone: telefone || content?.contato?.telefone,
        rua: street || content?.endereco?.rua,
        numero: number || content?.endereco?.numero,
        bairro_id: selectedBairro ?? bairrosDefault,
        agricultores_id: selectedAgricultoresIds || agricultoresDefault,
        associacao_id: selectedAssociacoes || associacaoDefault,
      };
      await editOCS(requestData, token, id.toString());
      router.back();
    } catch (error) {
      console.log(error);
      let errors;
      if (error instanceof AxiosError) {
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

  return (
    <main style={{ marginTop: '5rem' }}>
      <div className={S.container}>
        <div className={S.headerContent}>
          <div className={S.headerTitle}>
            <div>
              <Link href="/menu" className={S.back}>
                &lt; Voltar
              </Link>
            </div>
            <div>
              <h1 className={S.title}>{content.nome}</h1>
            </div>
          </div>
        </div>
        <form onSubmit={handleEditRegister} className={S.form}>
          <h3>Dados OCS</h3>
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
              <label htmlFor="cnpj">
                CNPJ<span>*</span>
              </label>
              <Input
                name="cnpj"
                type="text"
                placeholder={
                  content?.cnpj
                    ? content.cnpj.replace(
                        /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
                        '$1.$2.$3/$4-$5',
                      )
                    : ''
                }
                value={cnpj}
                onChange={(e) => setCNPJ(e.target.value)}
                mask="cnpj"
              />
            </div>
            <div>
              <label htmlFor="telefone">Telefone</label>
              <Input
                name="telefone"
                type="text"
                placeholder={content.contato?.telefone ?? ''}
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                mask="phone"
              />
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
            <MultiSelect
              label="Agricultores"
              selectedNames={selectedAgricultores}
              setSelectedNames={setSelectedAgricultores}
            >
              {filterAgricultores?.map((item) => (
                <StyledSelect
                  key={item.id}
                  value={item.name}
                  sx={{ justifyContent: 'space-between' }}
                >
                  {item.name}
                </StyledSelect>
              ))}
            </MultiSelect>
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
            </Button>{' '}
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

export default OcsEditHome;
