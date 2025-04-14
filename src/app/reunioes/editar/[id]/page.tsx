import React from 'react';

import ReunioesEditHome from '@/app/components/ReunioesEdit';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <ReunioesEditHome id={id} />;
};

export default Page;
