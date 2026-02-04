'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  Button,
  Input,
} from '@loyalty/ui';
import { useAuthStore } from '@loyalty/store';
import { apiClient } from '@loyalty/api-client';
import { Phone, Shield, ArrowLeft, MessageSquare } from 'lucide-react';

type Step = 'phone' | 'code';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [step, setStep] = useState<Step>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState(['', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);

  const codeRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Format phone for display
  const formatPhone = (val: string) => {
    const digits = val.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
    return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6, 9)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 9);
    setPhone(raw);
    setError(null);
  };

  const handleSendCode = useCallback(async () => {
    if (phone.length < 9) {
      setError('Podaj poprawny numer telefonu');
      return;
    }

    setError(null);
    setLoading(true);

    // Simulate sending SMS (the backend verifies on the next step)
    // We just move to the code entry step
    setTimeout(() => {
      setLoading(false);
      setCodeSent(true);
      setStep('code');
      // Focus first code input after transition
      setTimeout(() => codeRefs.current[0]?.focus(), 100);
    }, 800);
  }, [phone]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 4);
      const newCode = [...code];
      for (let i = 0; i < 4; i++) {
        newCode[i] = digits[i] || '';
      }
      setCode(newCode);
      setError(null);
      const focusIdx = Math.min(digits.length, 3);
      codeRefs.current[focusIdx]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    setError(null);

    if (digit && index < 3) {
      codeRefs.current[index + 1]?.focus();
    }
  };

  const handleCodeKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      codeRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter' && code.every((d) => d)) {
      handleVerify();
    }
  };

  const handleVerify = useCallback(async () => {
    const fullCode = code.join('');
    if (fullCode.length !== 4) {
      setError('Wpisz 4-cyfrowy kod');
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const fullPhone = `+48${phone}`;
      const { data } = await apiClient.post('/auth/phone-login', {
        phone: fullPhone,
        code: fullCode,
      });

      const resp = data as any;
      login(resp.data.user, {
        accessToken: resp.data.tokens.accessToken,
        refreshToken: resp.data.tokens.refreshToken,
      });

      router.push('/home');
    } catch (err: any) {
      const message =
        err?.response?.data?.message ||
        'Nieprawidlowy kod. Sprobuj ponownie.';
      setError(message);
      setCode(['', '', '', '']);
      codeRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }, [code, phone, login, router]);

  // Auto-verify when all 4 digits entered
  useEffect(() => {
    if (step === 'code' && code.every((d) => d) && !loading) {
      handleVerify();
    }
  }, [code, step, loading, handleVerify]);

  return (
    <Card className="border-0 shadow-2xl rounded-3xl overflow-hidden" style={{ background: '#fdf0e7' }}>
      <CardHeader className="text-center pb-2 pt-8">
        <div
          className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-white"
          style={{
            background: 'linear-gradient(135deg, #c4653a, #8b4528)',
            borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
          }}
        >
          {step === 'phone' ? (
            <Phone className="h-8 w-8" />
          ) : (
            <MessageSquare className="h-8 w-8" />
          )}
        </div>
        <CardTitle className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
          {step === 'phone' ? 'Zaloguj sie' : 'Wpisz kod SMS'}
        </CardTitle>
        <CardDescription className="text-base" style={{ color: '#a8928a' }}>
          {step === 'phone'
            ? 'Podaj numer telefonu, aby otrzymac kod weryfikacyjny.'
            : `Wyslalismy kod SMS na numer +48 ${formatPhone(phone)}`}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6 pt-4 pb-8 px-6">
        {step === 'phone' ? (
          <>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-sm font-medium" style={{ color: '#3d2c22' }}>
                  Numer telefonu
                </label>
                <div className="flex gap-2">
                  <div
                    className="flex items-center justify-center h-12 px-3 rounded-xl text-sm font-medium shrink-0"
                    style={{ background: 'rgba(250, 247, 242, 0.7)', border: '1px solid rgba(168, 146, 138, 0.3)', color: '#3d2c22' }}
                  >
                    +48
                  </div>
                  <Input
                    type="tel"
                    inputMode="numeric"
                    placeholder="500 111 222"
                    value={formatPhone(phone)}
                    onChange={handlePhoneChange}
                    onKeyDown={(e) => e.key === 'Enter' && handleSendCode()}
                    className="h-12 text-base rounded-xl flex-1"
                    style={{ background: 'rgba(250, 247, 242, 0.7)', borderColor: error ? '#c44a3a' : 'rgba(168, 146, 138, 0.3)' }}
                    autoFocus
                  />
                </div>
              </div>

              {error && (
                <p className="text-sm text-center" style={{ color: '#c44a3a' }}>
                  {error}
                </p>
              )}
            </div>

            <Button
              onClick={handleSendCode}
              disabled={loading || phone.length < 9}
              className="w-full h-14 text-lg font-semibold rounded-2xl border-0 text-white transition-all"
              size="lg"
              style={{ background: 'linear-gradient(135deg, #c4653a, #8b4528)' }}
            >
              {loading ? 'Wysylanie...' : 'Wyslij kod SMS'}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-4">
              <div className="flex justify-center gap-3">
                {code.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { codeRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={digit}
                    onChange={(e) => handleCodeChange(i, e.target.value)}
                    onKeyDown={(e) => handleCodeKeyDown(i, e)}
                    className="w-14 h-16 text-center text-2xl font-bold rounded-xl border-2 outline-none transition-all focus:ring-2"
                    style={{
                      background: 'rgba(250, 247, 242, 0.7)',
                      borderColor: error ? '#c44a3a' : digit ? '#c4653a' : 'rgba(168, 146, 138, 0.3)',
                      color: '#3d2c22',
                      fontFamily: 'var(--font-outfit), system-ui, sans-serif',
                    }}
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-center" style={{ color: '#c44a3a' }}>
                  {error}
                </p>
              )}

              {loading && (
                <p className="text-sm text-center animate-pulse" style={{ color: '#a8928a' }}>
                  Weryfikacja kodu...
                </p>
              )}
            </div>

            <div className="space-y-3">
              <Button
                onClick={handleVerify}
                disabled={loading || code.some((d) => !d)}
                className="w-full h-14 text-lg font-semibold rounded-2xl border-0 text-white transition-all"
                size="lg"
                style={{ background: 'linear-gradient(135deg, #c4653a, #8b4528)' }}
              >
                {loading ? 'Weryfikacja...' : 'Potwierdz'}
              </Button>

              <button
                onClick={() => {
                  setStep('phone');
                  setCode(['', '', '', '']);
                  setError(null);
                }}
                className="flex items-center justify-center gap-2 w-full text-sm font-medium min-h-[44px] transition-colors"
                style={{ color: '#a8928a' }}
              >
                <ArrowLeft className="h-4 w-4" />
                Zmien numer telefonu
              </button>
            </div>
          </>
        )}

        <div className="flex items-center justify-center gap-2 text-xs" style={{ color: '#a8928a' }}>
          <Shield className="h-3.5 w-3.5" />
          <span>Logowanie jest bezpieczne i szyfrowane</span>
        </div>
      </CardContent>
    </Card>
  );
}
