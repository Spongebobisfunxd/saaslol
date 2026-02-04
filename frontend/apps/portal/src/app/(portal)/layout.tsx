import dynamic from 'next/dynamic';

const PortalLayoutClient = dynamic(() => import('./_layout-client'), { ssr: false });

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PortalLayoutClient>{children}</PortalLayoutClient>;
}
