import React from 'react';

import OcsHome from '@/app/components/Ocs';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <OcsHome id={id} />;
};

export default Page;
