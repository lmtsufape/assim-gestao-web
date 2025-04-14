'use client';

import { FC, useEffect, useState } from 'react';

import S from './styles.module.scss';

import MenuOptions from '../../components/Menubuttons';
import Loader from '@/components/Loader';

import Authentication from '@/utils/session';

const Home: FC = () => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);
  return (
    <main
      className={S.main}
      style={{
        marginTop: '5rem',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {isLoading ? <Loader /> : <MenuOptions />}
    </main>
  );
};
export default Authentication(Home);
