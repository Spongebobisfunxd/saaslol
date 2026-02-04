import dynamic from 'next/dynamic';

const ClientContent = dynamic(() => import('./_client'), { ssr: false });

export default function AnalyticsPage() {
  return <ClientContent />;
}
