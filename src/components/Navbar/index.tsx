'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import * as React from 'react';
import { BiMenu } from 'react-icons/bi';

import styles from './styles.module.scss';

import { Icons } from '@/assets';

import {
  AppBar,
  Box,
  Container,
  IconButton,
  Menu,
  MenuItem,
  Toolbar,
  createTheme,
  ThemeProvider,
} from '@mui/material';

const Navbar = () => {
  const params = usePathname();
  const [userId, setUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    setUserId(localStorage.getItem('userId'));
  }, []);

  const perfil = () => {
    if (userId) {
      window.location.href = `/perfil/${userId}`;
    } else {
      alert('Usuário não identificado.');
    }
  };

  const [anchorElProfile, setAnchorElProfile] =
    React.useState<null | HTMLElement>(null);

  const handleOpenProfileMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorElProfile(event.currentTarget);
  };

  const logout = () => {
    localStorage.clear();
    window.location.href = '/';
  };

  return (
    <ThemeProvider
      theme={createTheme({
        components: {
          MuiMenu: {
            styleOverrides: {
              root: {
                position: 'absolute',
              },
            },
          },
        },
      })}
    >
      <AppBar className={styles.navbar} position="absolute">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Link href="/menu" className={styles.logoContainer}>
              <Image
                src={Icons.Logo}
                alt="Logo Gestão"
                className={styles.logoImage}
              />
              <h1>Gestão</h1>
            </Link>
            <Box
              sx={{
                flexGrow: 1,
                display: { xs: 'flex', md: 'none' },
                placeContent: 'end',
              }}
            >
              <IconButton
                size="large"
                aria-label="opções de páginas de navegação"
                aria-controls="menu-appbar"
                aria-haspopup="true"
                onClick={handleOpenProfileMenu} // Reutilizando o mesmo método para o menu em dispositivos móveis
              >
                <BiMenu className={styles.menu} />
              </IconButton>
            </Box>
            {params !== '/' && !params.includes('/registrar') && (
              <Box
                sx={{
                  display: { xs: 'none', md: 'flex' },
                  alignItems: 'center',
                  marginLeft: 'auto',
                }}
              >
                <IconButton
                  size="large"
                  aria-label="menu do perfil"
                  aria-controls="profile-menu"
                  aria-haspopup="true"
                  onClick={handleOpenProfileMenu}
                >
                  <Image src={Icons.Perfil} alt="Perfil" />
                </IconButton>
                <Menu
                  id="profile-menu"
                  anchorEl={anchorElProfile}
                  open={Boolean(anchorElProfile)}
                  onClose={() => setAnchorElProfile(null)}
                >
                  <MenuItem onClick={perfil}>Perfil</MenuItem>
                  <MenuItem onClick={logout}>Sair</MenuItem>
                </Menu>
              </Box>
            )}
          </Toolbar>
        </Container>
      </AppBar>
    </ThemeProvider>
  );
};

export default Navbar;
