import React from 'react';

import FeirasEditHome from '@/app/components/FeirasEdit';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <FeirasEditHome id={id} />;
};

export default Page;
