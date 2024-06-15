/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Link from 'next/link';
import React from 'react';

import S from '../loginForm/styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';

import { signIn } from '@/services/user';
import { Alert, AlertTitle, Snackbar } from '@mui/material';

export const LoginForm = () => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [error, setError] = React.useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signIn(email, password);
    } catch (error: any) {
      const errors = error.response?.data?.errors;
      if (errors !== undefined && errors !== null) {
        /*  const errorMessages = Object.values(errors).map(
          (errArray: any) => errArray[0],
        ); */
        setError(`Verifique os campos, e tente novamente!`);
      }
    }
  };

  return (
    <>
      <form className={S.loginForm} onSubmit={handleLogin}>
        <div>
          <label htmlFor="email">E-mail</label>
          <Input
            placeholder="contato@email.com"
            name="email"
            type="email"
            value={email}
            onChange={(
              e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
            ) => setEmail((e.target as HTMLInputElement).value)}
          />
        </div>
        <div>
          <label htmlFor="password">Senha</label>
          <Input
            placeholder="*********"
            name="password"
            type="password"
            value={password}
            onChange={(e: any) => setPassword(e.target.value)}
          />
        </div>
        <div className={S.links}>
          <Link href="/recuperar-senha">Esqueceu a senha?</Link>
        </div>
        <Button
          dataType="filled"
          type="submit"
          style={{ backgroundColor: '#008000', color: '#fff' }}
        >
          Entrar
        </Button>
      </form>
      <Snackbar
        open={error.length > 0}
        autoHideDuration={6000}
        onClose={() => setError('')}
      >
        <Alert variant="filled" severity="error" onClose={() => setError('')}>
          <AlertTitle>Erro ao fazer login!</AlertTitle>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
};
