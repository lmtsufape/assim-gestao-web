import React from 'react';

import OcsEditHome from '@/app/components/OcsEdit';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <OcsEditHome id={id} />;
};

export default Page;
