'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@loyalty/store';
import { useMe } from '@loyalty/api-client';
import {
  Card,
  CardContent,
  Button,
  Switch,
  Separator,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@loyalty/ui';
import { cn } from '@loyalty/ui';
import {
  User,
  Phone,
  Mail,
  MessageSquare,
  PhoneCall,
  Bell,
  Globe,
  LogOut,
  ChevronRight,
  Shield,
} from 'lucide-react';

// ---------- Types ----------
interface ConsentItem {
  id: string;
  label: string;
  description: string;
  channel: 'email' | 'sms' | 'phone';
  icon: typeof Mail;
  enabled: boolean;
}

// ---------- Component ----------
export default function ProfilePage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { data: meData, isLoading: isLoadingMe } = useMe();
  const [language, setLanguage] = useState('pl');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const [consents, setConsents] = useState<ConsentItem[]>([
    {
      id: 'email-marketing',
      label: 'Marketing e-mail',
      description:
        'Wyrazam zgode na otrzymywanie informacji handlowych za pomoca srodkow komunikacji elektronicznej (e-mail) zgodnie z art. 172 ustawy Prawo komunikacji elektronicznej.',
      channel: 'email',
      icon: Mail,
      enabled: true,
    },
    {
      id: 'sms-marketing',
      label: 'Marketing SMS',
      description:
        'Wyrazam zgode na otrzymywanie informacji handlowych za pomoca srodkow komunikacji elektronicznej (SMS/MMS) zgodnie z art. 172 ustawy Prawo komunikacji elektronicznej.',
      channel: 'sms',
      icon: MessageSquare,
      enabled: false,
    },
    {
      id: 'phone-marketing',
      label: 'Marketing telefoniczny',
      description:
        'Wyrazam zgode na wykorzystanie automatycznych systemow wywolujacych oraz telekomunikacyjnych urzadzen koncowych (telefon) w celach marketingu bezposredniego zgodnie z art. 172 PKE.',
      channel: 'phone',
      icon: PhoneCall,
      enabled: false,
    },
  ]);

  const toggleConsent = (consentId: string) => {
    setConsents((prev) =>
      prev.map((c) =>
        c.id === consentId ? { ...c, enabled: !c.enabled } : c,
      ),
    );
    // TODO: Call API to update consent
  };

  const handleLogout = async () => {
    setIsLoggingOut(true);
    logout();
    router.replace('/login');
  };

  // Use data from useMe if available, falling back to auth store
  const profileData = meData?.data ?? meData;
  const displayName = user
    ? `${user.firstName} ${user.lastName}`
    : 'Klient';

  const displayPhone = (profileData as any)?.phone
    ? (profileData as any).phone
    : user?.email
      ? ''
      : '+48 XXX XXX XXX';

  const displayEmail = user?.email || (profileData as any)?.email || '';

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="px-4 pt-12 pb-6" style={{ background: '#fdf0e7', borderBottom: '1px solid rgba(168, 146, 138, 0.15)' }}>
        <h1 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
          Profil
        </h1>
      </div>

      {/* Customer info card */}
      <div className="px-4">
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden" style={{ background: '#fdf0e7' }}>
          <CardContent className="p-5">
            {isLoadingMe ? (
              <div className="flex items-center gap-4 animate-pulse">
                <div className="h-16 w-16 shrink-0 rounded-2xl" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                <div className="space-y-2 flex-1">
                  <div className="h-5 w-32 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                  <div className="h-4 w-40 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                  <div className="h-4 w-48 rounded" style={{ background: 'rgba(168, 146, 138, 0.2)' }} />
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div
                  className="flex h-16 w-16 shrink-0 items-center justify-center"
                  style={{
                    background: 'linear-gradient(135deg, rgba(196, 101, 58, 0.12), rgba(139, 69, 40, 0.08))',
                    borderRadius: '30% 70% 70% 30% / 30% 30% 70% 70%',
                    color: '#c4653a',
                  }}
                >
                  <User className="h-8 w-8" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg font-bold truncate" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
                    {displayName}
                  </h2>
                  {displayPhone && (
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: '#a8928a' }}>
                      <Phone className="h-3.5 w-3.5" />
                      <span>{displayPhone}</span>
                    </div>
                  )}
                  {displayEmail && (
                    <div className="flex items-center gap-1.5 text-sm" style={{ color: '#a8928a' }}>
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate">{displayEmail}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Consent management */}
      <div className="px-4">
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden" style={{ background: '#fdf0e7' }}>
          <CardContent className="p-5 space-y-4">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-xl"
                style={{ background: 'linear-gradient(135deg, rgba(196, 101, 58, 0.15), rgba(139, 69, 40, 0.1))' }}
              >
                <Shield className="h-4.5 w-4.5" style={{ color: '#c4653a' }} />
              </div>
              <h3 className="text-base font-bold" style={{ fontFamily: 'var(--font-outfit), system-ui, sans-serif', color: '#3d2c22' }}>
                Zgody marketingowe (PKE)
              </h3>
            </div>

            <p className="text-xs leading-relaxed" style={{ color: '#a8928a' }}>
              Zarzadzaj swoimi zgodami na komunikacje marketingowa zgodnie z Prawem
              Komunikacji Elektronicznej.
            </p>

            <div className="space-y-1">
              {consents.map((consent, idx) => {
                const Icon = consent.icon;

                return (
                  <div key={consent.id}>
                    {idx > 0 && <div className="divider-organic my-3" />}
                    <div className="space-y-2">
                      <div className="flex items-center justify-between min-h-[44px]">
                        <div className="flex items-center gap-3">
                          <div
                            className="flex h-9 w-9 items-center justify-center rounded-xl"
                            style={{
                              background: consent.enabled
                                ? 'linear-gradient(135deg, rgba(196, 101, 58, 0.12), rgba(139, 69, 40, 0.08))'
                                : 'rgba(168, 146, 138, 0.1)',
                              color: consent.enabled ? '#c4653a' : '#a8928a',
                            }}
                          >
                            <Icon className="h-4.5 w-4.5" />
                          </div>
                          <span className="text-sm font-semibold" style={{ color: '#3d2c22' }}>
                            {consent.label}
                          </span>
                        </div>
                        <Switch
                          checked={consent.enabled}
                          onCheckedChange={() => toggleConsent(consent.id)}
                          className="scale-110"
                        />
                      </div>
                      <p className="text-xs leading-relaxed pl-12" style={{ color: '#a8928a' }}>
                        {consent.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Language selector */}
      <div className="px-4">
        <Card className="border-0 shadow-md rounded-2xl overflow-hidden" style={{ background: '#fdf0e7' }}>
          <CardContent className="p-5">
            <div className="flex items-center justify-between min-h-[44px]">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-xl"
                  style={{ background: 'rgba(168, 146, 138, 0.1)' }}
                >
                  <Globe className="h-4.5 w-4.5" style={{ color: '#a8928a' }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: '#3d2c22' }}>Jezyk</span>
              </div>
              <Select value={language} onValueChange={setLanguage}>
                <SelectTrigger className="w-36 h-10 rounded-xl" style={{ borderColor: 'rgba(168, 146, 138, 0.2)', background: 'rgba(250, 247, 242, 0.5)' }}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl" style={{ background: '#fdf0e7' }}>
                  <SelectItem value="pl">Polski</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="uk">Ukrainski</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logout */}
      <div className="px-4 pb-8">
        <Button
          onClick={handleLogout}
          disabled={isLoggingOut}
          variant="outline"
          className="w-full h-14 text-base font-semibold rounded-2xl transition-all"
          style={{
            borderColor: 'rgba(196, 58, 58, 0.25)',
            color: '#c44a3a',
            background: 'rgba(196, 58, 58, 0.04)',
          }}
        >
          <LogOut className="h-5 w-5 mr-2" />
          {isLoggingOut ? 'Wylogowywanie...' : 'Wyloguj sie'}
        </Button>
      </div>
    </div>
  );
}
