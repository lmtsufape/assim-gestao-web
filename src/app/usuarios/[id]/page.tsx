import React from 'react';

import UsuariosHome from '@/app/components/Usuarios';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <UsuariosHome id={id} />;
};

export default Page;
