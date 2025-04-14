import React from 'react';

import BairroEditHome from '@/app/components/BairroEdit';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <BairroEditHome id={id} />;
};

export default Page;
