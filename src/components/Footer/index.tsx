import Image from 'next/image';
import React from 'react';
import { GoMail } from 'react-icons/go';
import { SiFacebook, SiInstagram } from 'react-icons/si';

import S from './styles.module.scss';

import { Icons } from '@/assets';
import LMTS from '@/assets/lmts.svg';
import Ufape from '@/assets/ufape.svg';

const Footer = () => {
  return (
    <footer className={S.footer}>
      <ul>
        <li className={S.logo}>
          <Image
            src={Icons.LogoWhite}
            className={S.logoImg}
            alt="Logo Gestão"
          />{' '}
          <p>Gestão</p>
        </li>
        <li className={S.ufapelmtsWrapper}>
          <div className={S.imageContainer}>
            <Image className={S.ufapeLogo} src={Ufape} alt="ufape logo" />
          </div>
          <div className={S.imageContainer}>
            <Image className={S.lmtsLogo} src={LMTS} alt="lmts logo" />
          </div>
        </li>
        <li className={S.socialNetwork}>
          <GoMail className={S.email} />
          <SiFacebook />
          <SiInstagram />
        </li>
      </ul>
    </footer>
  );
};

export default Footer;
