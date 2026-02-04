'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useRegister } from '@loyalty/api-client';
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
  NIPInput,
  PhoneInput,
} from '@loyalty/ui';

const registerSchema = z.object({
  email: z.string().email('Podaj prawidlowy adres e-mail'),
  password: z
    .string()
    .min(8, 'Haslo musi miec co najmniej 8 znakow')
    .regex(/[A-Z]/, 'Haslo musi zawierac wielka litere')
    .regex(/[0-9]/, 'Haslo musi zawierac cyfre'),
  firstName: z.string().min(1, 'Imie jest wymagane'),
  lastName: z.string().min(1, 'Nazwisko jest wymagane'),
  companyName: z.string().min(1, 'Nazwa firmy jest wymagana'),
  nip: z.string().length(10, 'NIP musi miec 10 cyfr'),
  phone: z.string().min(9, 'Numer telefonu jest wymagany'),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

const inputStyle = {
  backgroundColor: 'var(--surface-elevated)',
  color: 'var(--cream)',
  borderRadius: 'var(--radius)',
};

export default function RegisterPage() {
  const router = useRouter();
  const registerMutation = useRegister();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: '',
      password: '',
      firstName: '',
      lastName: '',
      companyName: '',
      nip: '',
      phone: '',
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync(values);
      router.push('/onboarding');
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
          Utworz konto
        </CardTitle>
        <CardDescription style={{ color: 'var(--warm-gray)' }}>
          Zarejestruj firme i rozpocznij korzystanie z programu lojalnosciowego.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-8 pb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName" style={{ color: 'var(--warm-gray-light)' }}>
                Imie
              </Label>
              <Input
                id="firstName"
                placeholder="Jan"
                autoComplete="given-name"
                className="border-0"
                style={inputStyle}
                {...register('firstName')}
              />
              {errors.firstName && (
                <p className="text-sm text-destructive">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastName" style={{ color: 'var(--warm-gray-light)' }}>
                Nazwisko
              </Label>
              <Input
                id="lastName"
                placeholder="Kowalski"
                autoComplete="family-name"
                className="border-0"
                style={inputStyle}
                {...register('lastName')}
              />
              {errors.lastName && (
                <p className="text-sm text-destructive">
                  {errors.lastName.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName" style={{ color: 'var(--warm-gray-light)' }}>
              Nazwa firmy
            </Label>
            <Input
              id="companyName"
              placeholder="Moja Firma Sp. z o.o."
              autoComplete="organization"
              className="border-0"
              style={inputStyle}
              {...register('companyName')}
            />
            {errors.companyName && (
              <p className="text-sm text-destructive">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="nip" style={{ color: 'var(--warm-gray-light)' }}>
              NIP
            </Label>
            <Controller
              name="nip"
              control={control}
              render={({ field }) => (
                <NIPInput
                  id="nip"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.nip && (
              <p className="text-sm text-destructive">{errors.nip.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" style={{ color: 'var(--warm-gray-light)' }}>
              Telefon
            </Label>
            <Controller
              name="phone"
              control={control}
              render={({ field }) => (
                <PhoneInput
                  id="phone"
                  value={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            {errors.phone && (
              <p className="text-sm text-destructive">{errors.phone.message}</p>
            )}
          </div>

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
              style={inputStyle}
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
              placeholder="Min. 8 znakow"
              autoComplete="new-password"
              className="border-0"
              style={inputStyle}
              {...register('password')}
            />
            {errors.password && (
              <p className="text-sm text-destructive">
                {errors.password.message}
              </p>
            )}
          </div>

          {registerMutation.isError && (
            <div
              className="rounded-lg p-3 text-sm"
              style={{
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                color: '#f87171',
                border: '1px solid rgba(239, 68, 68, 0.15)',
              }}
            >
              {(registerMutation.error as Error)?.message ||
                'Rejestracja nie powiodla sie. Sprobuj ponownie.'}
            </div>
          )}

          <Button
            type="submit"
            className="btn-lift w-full border-0 text-sm font-semibold tracking-wide"
            disabled={isSubmitting || registerMutation.isPending}
            style={{
              background: 'linear-gradient(135deg, var(--gold), var(--gold-dim))',
              color: 'var(--charcoal)',
              borderRadius: 'var(--radius)',
              height: '2.75rem',
            }}
          >
            {registerMutation.isPending
              ? 'Rejestracja...'
              : 'Zarejestruj sie'}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="justify-center pb-8">
        <p className="text-sm" style={{ color: 'var(--warm-gray)' }}>
          Masz juz konto?{' '}
          <Link
            href="/login"
            className="gold-underline font-medium underline-offset-4 transition-colors"
            style={{ color: 'var(--gold)' }}
          >
            Zaloguj sie
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
