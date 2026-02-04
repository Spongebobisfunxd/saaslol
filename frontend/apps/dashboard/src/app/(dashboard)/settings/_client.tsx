'use client';

import { useState } from 'react';
import { useMe } from '@loyalty/api-client';
import { apiClient } from '@loyalty/api-client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
  Button,
  Input,
  Label,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  NIPInput,
  useToast,
} from '@loyalty/ui';
import {
  User,
  Building2,
  Users,
  CreditCard,
  ShieldCheck,
  Plus,
  Trash2,
  Upload,
  Check,
} from 'lucide-react';

interface TeamMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: string;
}

export default function SettingsPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { data: me } = useMe();

  // Profile tab state
  const [profileName, setProfileName] = useState(me?.firstName ?? '');
  const [profileLastName, setProfileLastName] = useState(me?.lastName ?? '');
  const [profileEmail, setProfileEmail] = useState(me?.email ?? '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Business tab state
  const [companyName, setCompanyName] = useState('');
  const [nip, setNip] = useState('');
  const [brandColor, setBrandColor] = useState('#3b82f6');

  // Team tab state
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('member');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);

  // Billing
  const [selectedPlan, setSelectedPlan] = useState('pro');

  // Consents
  const [consentDialogOpen, setConsentDialogOpen] = useState(false);
  const [consentTitle, setConsentTitle] = useState('');
  const [consentContent, setConsentContent] = useState('');

  // Team members query
  const { data: teamMembers, isLoading: teamLoading } = useQuery({
    queryKey: ['team'],
    queryFn: async () => {
      const { data } = await apiClient.get<TeamMember[]>('/team');
      return data;
    },
  });

  const updateProfile = useMutation({
    mutationFn: async (payload: { firstName: string; lastName: string; email: string }) => {
      const { data } = await apiClient.patch('/auth/profile', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['auth', 'me'] });
      toast({ title: 'Profil zaktualizowany' });
    },
  });

  const changePassword = useMutation({
    mutationFn: async (payload: { currentPassword: string; newPassword: string }) => {
      await apiClient.post('/auth/change-password', payload);
    },
    onSuccess: () => {
      toast({ title: 'Haslo zmienione', description: 'Twoje haslo zostalo zaktualizowane.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
  });

  const updateBusiness = useMutation({
    mutationFn: async (payload: { companyName: string; nip: string; brandColor: string }) => {
      const { data } = await apiClient.patch('/settings/business', payload);
      return data;
    },
    onSuccess: () => {
      toast({ title: 'Dane firmowe zaktualizowane' });
    },
  });

  const inviteMember = useMutation({
    mutationFn: async (payload: { email: string; role: string }) => {
      const { data } = await apiClient.post('/team/invite', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast({ title: 'Zaproszenie wyslane', description: `Zaproszenie wyslane na ${inviteEmail}` });
      setInviteDialogOpen(false);
      setInviteEmail('');
    },
  });

  const removeMember = useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/team/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['team'] });
      toast({ title: 'Czlonek zespolu usuniety' });
    },
  });

  const handleSaveProfile = () => {
    updateProfile.mutate({
      firstName: profileName,
      lastName: profileLastName,
      email: profileEmail,
    });
  };

  const handleChangePassword = () => {
    if (newPassword !== confirmPassword) {
      toast({ title: 'Blad', description: 'Hasla nie sa identyczne.', variant: 'destructive' });
      return;
    }
    changePassword.mutate({ currentPassword, newPassword });
  };

  const handleSaveBusiness = () => {
    updateBusiness.mutate({ companyName, nip, brandColor });
  };

  const roleLabel = (role: string) => {
    switch (role) {
      case 'owner': return 'Wlasciciel';
      case 'admin': return 'Administrator';
      case 'member': return 'Czlonek';
      default: return role;
    }
  };

  const roleBadge = (role: string) => {
    switch (role) {
      case 'owner': return <Badge className="bg-purple-100 text-purple-800">Wlasciciel</Badge>;
      case 'admin': return <Badge className="bg-blue-100 text-blue-800">Admin</Badge>;
      default: return <Badge variant="secondary">Czlonek</Badge>;
    }
  };

  const plans = [
    { id: 'starter', name: 'Starter', price: '99 zl/mies.', features: ['Do 500 klientow', '1 lokalizacja', 'Email support'] },
    { id: 'pro', name: 'Pro', price: '299 zl/mies.', features: ['Do 5000 klientow', '5 lokalizacji', 'Priorytetowe wsparcie', 'API'] },
    { id: 'enterprise', name: 'Enterprise', price: '799 zl/mies.', features: ['Bez limitu klientow', 'Bez limitu lokalizacji', 'Dedykowany opiekun', 'SLA'] },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Ustawienia</h1>
        <p className="text-muted-foreground">
          Zarzadzaj kontem, firma, zespolem i rozliczeniami.
        </p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="business" className="gap-2">
            <Building2 className="h-4 w-4" />
            Firma
          </TabsTrigger>
          <TabsTrigger value="team" className="gap-2">
            <Users className="h-4 w-4" />
            Zespol
          </TabsTrigger>
          <TabsTrigger value="billing" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Rozliczenia
          </TabsTrigger>
          <TabsTrigger value="consents" className="gap-2">
            <ShieldCheck className="h-4 w-4" />
            Zgody
          </TabsTrigger>
        </TabsList>

        {/* Profile tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dane osobowe</CardTitle>
              <CardDescription>Zaktualizuj swoje dane osobowe.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Imie</Label>
                  <Input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label>Nazwisko</Label>
                  <Input value={profileLastName} onChange={(e) => setProfileLastName(e.target.value)} />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={profileEmail} onChange={(e) => setProfileEmail(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveProfile} disabled={updateProfile.isPending}>
                {updateProfile.isPending ? 'Zapisywanie...' : 'Zapisz profil'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Zmiana hasla</CardTitle>
              <CardDescription>Zaktualizuj swoje haslo dostepu.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Obecne haslo</Label>
                <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nowe haslo</Label>
                <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Potwierdz nowe haslo</Label>
                <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleChangePassword}
                disabled={!currentPassword || !newPassword || !confirmPassword || changePassword.isPending}
              >
                {changePassword.isPending ? 'Zmienianie...' : 'Zmien haslo'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Business tab */}
        <TabsContent value="business">
          <Card>
            <CardHeader>
              <CardTitle>Dane firmowe</CardTitle>
              <CardDescription>Informacje o Twojej firmie.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Nazwa firmy</Label>
                <Input value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="Moja Firma Sp. z o.o." />
              </div>
              <div className="space-y-2">
                <Label>NIP</Label>
                <NIPInput value={nip} onChange={setNip} />
              </div>
              <Separator />
              <div className="space-y-2">
                <Label>Kolor marki</Label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="h-10 w-14 cursor-pointer rounded border"
                  />
                  <Input
                    value={brandColor}
                    onChange={(e) => setBrandColor(e.target.value)}
                    className="w-32 font-mono"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Logo firmy</Label>
                <div className="flex items-center gap-4">
                  <div className="flex h-20 w-20 items-center justify-center rounded-lg border-2 border-dashed">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Wgraj logo
                  </Button>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveBusiness} disabled={updateBusiness.isPending}>
                {updateBusiness.isPending ? 'Zapisywanie...' : 'Zapisz dane firmowe'}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        {/* Team tab */}
        <TabsContent value="team" className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">Czlonkowie zespolu</h2>
            <Button size="sm" onClick={() => setInviteDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Zapros
            </Button>
          </div>

          {teamLoading ? (
            <div className="flex h-32 items-center justify-center">
              <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <div className="space-y-3">
              {/* Current user */}
              {me && (
                <Card>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                        {me.firstName?.[0]}{me.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">{me.firstName} {me.lastName}</p>
                        <p className="text-sm text-muted-foreground">{me.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {roleBadge(me.role)}
                      <Badge variant="secondary">Ty</Badge>
                    </div>
                  </CardContent>
                </Card>
              )}

              {teamMembers?.map((member) => (
                <Card key={member.id}>
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-sm font-bold">
                        {member.firstName?.[0]}{member.lastName?.[0]}
                      </div>
                      <div>
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {roleBadge(member.role)}
                      <Badge variant={member.status === 'active' ? 'default' : 'secondary'}>
                        {member.status === 'active' ? 'Aktywny' : 'Oczekujacy'}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => removeMember.mutate(member.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* Billing tab */}
        <TabsContent value="billing" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-3">
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-shadow hover:shadow-md ${
                  selectedPlan === plan.id ? 'ring-2 ring-primary' : ''
                }`}
                onClick={() => setSelectedPlan(plan.id)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {selectedPlan === plan.id && (
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-4 w-4 text-primary-foreground" />
                      </div>
                    )}
                  </div>
                  <p className="text-2xl font-bold">{plan.price}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-emerald-600" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Historia platnosci</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Plan Pro - Styczen 2026</p>
                    <p className="text-sm text-muted-foreground">Faktura VAT #2026/01/001</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">299,00 zl</p>
                    <Badge variant="default">Oplacona</Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-3">
                  <div>
                    <p className="font-medium">Plan Pro - Grudzien 2025</p>
                    <p className="text-sm text-muted-foreground">Faktura VAT #2025/12/001</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">299,00 zl</p>
                    <Badge variant="default">Oplacona</Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Consents tab */}
        <TabsContent value="consents" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Szablony zgod (RODO)</h2>
              <p className="text-sm text-muted-foreground">
                Zarzadzaj szablonami zgod wymaganych od klientow.
              </p>
            </div>
            <Button size="sm" onClick={() => { setConsentTitle(''); setConsentContent(''); setConsentDialogOpen(true); }}>
              <Plus className="mr-2 h-4 w-4" />
              Nowy szablon
            </Button>
          </div>

          <div className="space-y-3">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Zgoda na przetwarzanie danych osobowych</p>
                    <p className="text-sm text-muted-foreground">
                      Wyrazam zgode na przetwarzanie moich danych osobowych w celach zwiazanych z programem lojalnosciowym...
                    </p>
                  </div>
                  <Badge variant="default">Wymagana</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Zgoda na komunikacje marketingowa (email)</p>
                    <p className="text-sm text-muted-foreground">
                      Wyrazam zgode na otrzymywanie informacji handlowych droga elektroniczna...
                    </p>
                  </div>
                  <Badge variant="secondary">Opcjonalna</Badge>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Zgoda na komunikacje SMS</p>
                    <p className="text-sm text-muted-foreground">
                      Wyrazam zgode na otrzymywanie wiadomosci SMS z ofertami i promocjami...
                    </p>
                  </div>
                  <Badge variant="secondary">Opcjonalna</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Invite member dialog */}
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Zapros czlonka zespolu</DialogTitle>
            <DialogDescription>
              Wyslij zaproszenie na adres email.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="kolega@firma.pl"
              />
            </div>
            <div className="space-y-2">
              <Label>Rola</Label>
              <div className="flex gap-2">
                {['admin', 'member'].map((role) => (
                  <Button
                    key={role}
                    variant={inviteRole === role ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setInviteRole(role)}
                  >
                    {roleLabel(role)}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInviteDialogOpen(false)}>Anuluj</Button>
            <Button
              onClick={() => inviteMember.mutate({ email: inviteEmail, role: inviteRole })}
              disabled={!inviteEmail || inviteMember.isPending}
            >
              {inviteMember.isPending ? 'Wysylanie...' : 'Wyslij zaproszenie'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Consent template dialog */}
      <Dialog open={consentDialogOpen} onOpenChange={setConsentDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nowy szablon zgody</DialogTitle>
            <DialogDescription>
              Zdefiniuj nowy szablon zgody RODO.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Tytul</Label>
              <Input
                value={consentTitle}
                onChange={(e) => setConsentTitle(e.target.value)}
                placeholder="np. Zgoda na profilowanie"
              />
            </div>
            <div className="space-y-2">
              <Label>Tresc zgody</Label>
              <textarea
                className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={consentContent}
                onChange={(e) => setConsentContent(e.target.value)}
                placeholder="Pelna tresc zgody wyswietlana klientowi..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConsentDialogOpen(false)}>Anuluj</Button>
            <Button
              onClick={() => {
                toast({ title: 'Szablon zgody utworzony' });
                setConsentDialogOpen(false);
              }}
              disabled={!consentTitle || !consentContent}
            >
              Zapisz szablon
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
