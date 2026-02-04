'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useLogin } from '@loyalty/api-client';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Input,
  Label,
} from '@loyalty/ui';

const loginSchema = z.object({
  email: z.string().email('Podaj prawidlowy adres e-mail'),
  password: z.string().min(1, 'Haslo jest wymagane'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      await loginMutation.mutateAsync(values);
      router.push('/dashboard');
    } catch {
      // Error is handled via mutation state
    }
  };

  return (
    <Card
      className="overflow-hidden border-0"
      style={{
        backgroundColor: 'var(--surface)',
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(212, 168, 83, 0.08), 0 0 60px rgba(212, 168, 83, 0.04)',
      }}
    >
      {/* Gold top accent line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: 'linear-gradient(90deg, transparent, var(--gold), transparent)',
        }}
      />

      <CardHeader className="text-center pb-2 pt-8">
        <div
          className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-xl text-xl"
          style={{
            background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
            color: 'var(--charcoal)',
            fontFamily: 'var(--font-dm-serif), Georgia, serif',
            fontWeight: 'bold',
            boxShadow: '0 4px 16px rgba(212, 168, 83, 0.25)',
          }}
        >
          L
        </div>
        <CardTitle
          className="text-2xl"
          style={{
            fontFamily: 'var(--font-dm-serif), Georgia, serif',
            color: 'var(--cream)',
          }}
        >
          Zaloguj sie
        </CardTitle>
        <CardDescription style={{ color: 'var(--warm-gray)' }}>
          Wprowadz dane logowania, aby uzyskac dostep do panelu.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email" style={{ color: 'var(--warm-gray-light)' }}>
              Adres e-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="jan@firma.pl"
              autoComplete="email"
              className="border-0"
              style={{
                backgroundColor: 'var(--surface-elevated)',
                color: 'var(--cream)',
                borderRadius: 'var(--radius)',
              }}
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" style={{ color: 'var(--warm-gray-light)' }}>
              Haslo
            </Label>
            <Input
              id="password"
              type="password"
              placeholder="********"
              autoComplete="current-password"
              className="border-0"
              style={{
                backgroundColor: 'var(--surface-elevated)',
                color: 'var(--cream)',
                borderRadius: 'var(--radius)',
              }}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {loginMutation.isError && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.15)',
              }}
            >
              {(loginMutation.error as Error)?.message ||
                'Nieprawidlowy email lub haslo. Sprobuj ponownie.'}
            </div>
          )}

          <Button
            type="submit"
            className="btn-lift w-full border-0 text-sm font-semibold tracking-wide"
            disabled={isSubmitting || loginMutation.isPending}
            style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
              color: 'var(--charcoal)',
              borderRadius: 'var(--radius)',
              height: '2.75rem',
            }}
          >
            {loginMutation.isPending ? 'Logowanie...' : 'Zaloguj sie'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pb-8">
        <p className="text-sm" style={{ color: 'var(--warm-gray)' }}>
          Nie masz konta?{' '}
          <Link
            href="/register"
            className="gold-underline font-medium underline-offset-4 transition-colors"
            style={{ color: 'var(--gold)' }}
          >
            Zarejestruj sie
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
