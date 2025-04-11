import React from 'react';

import UsuariosEditHome from '@/app/components/UsuariosEdit';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <UsuariosEditHome id={id} />;
};

export default Page;
