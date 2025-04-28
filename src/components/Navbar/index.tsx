'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import * as React from 'react';

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
  const router = useRouter();
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

  const handleLogoClick = () => {
    if (params === '/registrar') {
      router.push('/');
    } else if (params !== '/') {
      router.push('/menu');
    }
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
            <Box
              sx={{ cursor: 'pointer' }}
              className={styles.logoContainer}
              onClick={handleLogoClick}
            >
              <Image
                src={Icons.Logo}
                alt="Logo Gestão"
                className={styles.logoImage}
              />
              <h1>Gestão</h1>
            </Box>

            {params !== '/' && !params.includes('/registrar') && (
              <Box
                sx={{
                  display: { md: 'flex' },
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
