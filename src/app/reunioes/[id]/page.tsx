import React from 'react';

import ReunioesHome from '@/app/components/Reunioes';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <ReunioesHome id={id} />;
};

export default Page;
