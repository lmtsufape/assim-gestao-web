'use client';

import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import S from './styles.module.scss';

import Button from '@/components/Button';
import Input from '@/components/Input';

import { sendResetPasswordEmail } from '@/services';
import { Alert, AlertTitle, Snackbar } from '@mui/material';

export const ResetPasswordRequest = () => {
  const [email, setEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();
    try {
      await sendResetPasswordEmail(email);
      setSuccessMessage('Email de redefinição de senha enviado com sucesso.');
      setTimeout(() => {
        router.push('/');
      }, 7000);
    } catch (error) {
      console.debug(error);
      setErrorMessage('Falha ao enviar o email de redefinição de senha.');
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit} className={S.form}>
        <div className={S['form-group']}>
          <label htmlFor="email">E-mail</label>
          <Input
            placeholder="contato@email.com"
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className={S['button-container']}>
          <Button type="submit" dataType="filled">
            Recuperar Senha
          </Button>
        </div>
      </form>
      <Snackbar
        open={successMessage.length > 0}
        autoHideDuration={6000}
        onClose={() => setSuccessMessage('')}
      >
        <Alert variant="filled" severity="success">
          <AlertTitle>Sucesso!</AlertTitle>
          {successMessage}
        </Alert>
      </Snackbar>
      <Snackbar
        open={errorMessage.length > 0}
        autoHideDuration={6000}
        onClose={() => setErrorMessage('')}
      >
        <Alert variant="filled" severity="error">
          <AlertTitle>Erro!</AlertTitle>
          {errorMessage}
        </Alert>
      </Snackbar>
    </>
  );
};
