export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden p-4"
      style={{ backgroundColor: 'var(--charcoal)' }}
    >
      {/* Subtle radial gradient backdrop */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 30%, rgba(212, 168, 83, 0.06) 0%, transparent 60%)',
        }}
      />

      {/* Diagonal editorial pattern */}
      <div className="auth-pattern pointer-events-none absolute inset-0" />

      {/* Decorative corner accents */}
      <div
        className="pointer-events-none absolute left-0 top-0 h-32 w-32"
        style={{
          background: 'linear-gradient(135deg, rgba(212, 168, 83, 0.08) 0%, transparent 50%)',
        }}
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-32 w-32"
        style={{
          background: 'linear-gradient(315deg, rgba(212, 168, 83, 0.08) 0%, transparent 50%)',
        }}
      />

      {/* Fine horizontal lines - editorial motif */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, rgba(212, 168, 83, 0.5) 39px, rgba(212, 168, 83, 0.5) 40px)',
        }}
      />

      <div className="relative z-10 w-full max-w-md fade-in">
        {children}
      </div>
    </div>
  );
}
