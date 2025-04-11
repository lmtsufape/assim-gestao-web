import React from 'react';

import CidadeEditHome from '@/app/components/CidadeEdit';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <CidadeEditHome id={id} />;
};

export default Page;
