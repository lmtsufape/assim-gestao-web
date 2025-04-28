import React from 'react';

import FeirasHome from '@/app/components/Feiras';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <FeirasHome id={id} />;
};

export default Page;
