import React from 'react';

import OCSParticipantesHome from '@/app/components/OcsParticipantes';

type Props = {
  params: Promise<{
    id: number;
  }>;
};

const Page = async ({ params }: Props) => {
  const { id } = await params;
  return <OCSParticipantesHome id={id} />;
};

export default Page;
