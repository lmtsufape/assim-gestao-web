'use client';

import S from './styles.module.scss';

import MenuOptions from '../../components/Menubuttons';

import Authentication from '@/utils/session';
import Loader from '@/components/Loader';
import { useEffect, useState } from 'react';

const Home = () => {
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
