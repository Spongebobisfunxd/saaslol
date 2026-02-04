export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4" style={{ background: 'linear-gradient(135deg, #c4653a 0%, #b5583a 30%, #8b4528 70%, #6b8f6b 100%)' }}>
      {/* Organic blob shapes */}
      <div
        className="absolute top-[-15%] left-[-10%] w-[55%] h-[55%] opacity-20 pointer-events-none"
        style={{
          borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          background: 'radial-gradient(ellipse at center, rgba(253, 240, 231, 0.5) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] opacity-15 pointer-events-none"
        style={{
          borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%',
          background: 'radial-gradient(ellipse at center, rgba(107, 143, 107, 0.5) 0%, transparent 70%)',
        }}
      />
      <div
        className="absolute top-[40%] right-[5%] w-[30%] h-[30%] opacity-10 pointer-events-none"
        style={{
          borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          background: 'radial-gradient(ellipse at center, rgba(255, 255, 255, 0.4) 0%, transparent 70%)',
        }}
      />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
