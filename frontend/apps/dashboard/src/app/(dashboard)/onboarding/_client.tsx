'use client';

import { useRouter } from 'next/navigation';
import { useOnboardingStore } from '@loyalty/store';
import { useCreateProgram } from '@loyalty/api-client';
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  NIPInput,
  PhoneInput,
  Progress,
  Separator,
  useToast,
} from '@loyalty/ui';
import {
  Building2,
  Star,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Stamp,
  Layers,
  Upload,
  Rocket,
} from 'lucide-react';

const STEPS = [
  { title: 'Profil firmy', icon: Building2 },
  { title: 'Program lojalnosciowy', icon: Star },
  { title: 'Gotowe', icon: CheckCircle2 },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createProgram = useCreateProgram();

  const {
    currentStep,
    businessProfile,
    loyaltyProgram,
    setStep,
    setBusinessProfile,
    setLoyaltyProgram,
    reset,
  } = useOnboardingStore();

  const progress = ((currentStep + 1) / STEPS.length) * 100;

  const canProceedStep0 = businessProfile.companyName && businessProfile.nip && businessProfile.phone;
  const canProceedStep1 = loyaltyProgram.name && loyaltyProgram.type;

  const handleNext = async () => {
    if (currentStep === 0 && canProceedStep0) {
      setStep(1);
    } else if (currentStep === 1 && canProceedStep1) {
      // Create program via API
      try {
        await createProgram.mutateAsync({
          name: loyaltyProgram.name!,
          type: loyaltyProgram.type!,
          pointsPerPLN: loyaltyProgram.pointsPerPLN,
          welcomeBonus: loyaltyProgram.welcomeBonus,
        });
        setStep(2);
      } catch {
        toast({ title: 'Blad', description: 'Nie udalo sie utworzyc programu.', variant: 'destructive' });
      }
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    reset();
    router.push('/dashboard');
  };

  const programTypeIcon = (type?: string) => {
    switch (type) {
      case 'stamps': return Stamp;
      case 'tiers': return Layers;
      default: return Star;
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Konfiguracja systemu</h1>
        <p className="text-muted-foreground">
          Skonfiguruj swoj program lojalnosciowy w 3 prostych krokach.
        </p>
      </div>

      {/* Progress */}
      <div className="space-y-3">
        <div className="flex justify-between">
          {STEPS.map((step, index) => {
            const StepIcon = step.icon;
            const isCompleted = index < currentStep;
            const isActive = index === currentStep;
            return (
              <div
                key={index}
                className={`flex items-center gap-2 text-sm ${
                  isActive ? 'text-primary font-medium' : isCompleted ? 'text-emerald-600' : 'text-muted-foreground'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : isCompleted
                        ? 'bg-emerald-100 text-emerald-600'
                        : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <StepIcon className="h-4 w-4" />
                  )}
                </div>
                <span className="hidden sm:inline">{step.title}</span>
              </div>
            );
          })}
        </div>
        <Progress value={progress} />
      </div>

      {/* Step 0: Business Profile */}
      {currentStep === 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Profil firmy
            </CardTitle>
            <CardDescription>
              Potwierdz dane firmy, dodaj logo i ustaw kolor marki.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa firmy</Label>
              <Input
                value={businessProfile.companyName ?? ''}
                onChange={(e) => setBusinessProfile({ companyName: e.target.value })}
                placeholder="Moja Firma Sp. z o.o."
              />
            </div>
            <div className="space-y-2">
              <Label>NIP</Label>
              <NIPInput
                value={businessProfile.nip ?? ''}
                onChange={(value) => setBusinessProfile({ nip: value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Adres</Label>
                <Input
                  value={businessProfile.address ?? ''}
                  onChange={(e) => setBusinessProfile({ address: e.target.value })}
                  placeholder="ul. Przykladowa 1"
                />
              </div>
              <div className="space-y-2">
                <Label>Miasto</Label>
                <Input
                  value={businessProfile.city ?? ''}
                  onChange={(e) => setBusinessProfile({ city: e.target.value })}
                  placeholder="Warszawa"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kod pocztowy</Label>
                <Input
                  value={businessProfile.postalCode ?? ''}
                  onChange={(e) => setBusinessProfile({ postalCode: e.target.value })}
                  placeholder="00-001"
                />
              </div>
              <div className="space-y-2">
                <Label>Telefon</Label>
                <PhoneInput
                  value={businessProfile.phone ?? ''}
                  onChange={(value) => setBusinessProfile({ phone: value })}
                />
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Logo firmy</Label>
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg border-2 border-dashed">
                  <Upload className="h-6 w-6 text-muted-foreground" />
                </div>
                <Button variant="outline" size="sm">
                  <Upload className="mr-2 h-4 w-4" />
                  Wgraj logo
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Kolor marki</Label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  defaultValue="#3b82f6"
                  className="h-10 w-14 cursor-pointer rounded border"
                />
                <span className="text-sm text-muted-foreground">
                  Kolor bedzie uzywany w portalu klienta i materiałach
                </span>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNext} disabled={!canProceedStep0}>
              Dalej
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 1: Loyalty Program Setup */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Konfiguracja programu lojalnosciowego
            </CardTitle>
            <CardDescription>
              Wybierz typ programu i ustaw podstawowe reguly.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Nazwa programu</Label>
              <Input
                value={loyaltyProgram.name ?? ''}
                onChange={(e) => setLoyaltyProgram({ name: e.target.value })}
                placeholder="np. Klub Lojalnosciowy"
              />
            </div>

            <div className="space-y-2">
              <Label>Typ programu</Label>
              <div className="grid grid-cols-3 gap-3">
                {(['points', 'stamps', 'tiers'] as const).map((type) => {
                  const TypeIcon = programTypeIcon(type);
                  const labels: Record<string, string> = {
                    points: 'Punktowy',
                    stamps: 'Pieczatkowy',
                    tiers: 'Tierowy',
                  };
                  const descriptions: Record<string, string> = {
                    points: 'Klienci zbieraja punkty za zakupy',
                    stamps: 'Pieczatki za wizyty, nagroda po zebraniu',
                    tiers: 'Poziomy z rosnacymi korzyściami',
                  };
                  return (
                    <div
                      key={type}
                      className={`cursor-pointer rounded-lg border-2 p-4 text-center transition-colors ${
                        loyaltyProgram.type === type
                          ? 'border-primary bg-primary/5'
                          : 'border-border hover:border-primary/50'
                      }`}
                      onClick={() => setLoyaltyProgram({ type })}
                    >
                      <TypeIcon className="mx-auto h-8 w-8 mb-2 text-primary" />
                      <p className="font-medium text-sm">{labels[type]}</p>
                      <p className="text-xs text-muted-foreground mt-1">{descriptions[type]}</p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Points-specific settings */}
            {loyaltyProgram.type === 'points' && (
              <>
                <Separator />
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Punkty za 1 PLN</Label>
                    <Input
                      type="number"
                      value={loyaltyProgram.pointsPerPLN ?? ''}
                      onChange={(e) => setLoyaltyProgram({ pointsPerPLN: Number(e.target.value) })}
                      placeholder="1"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bonus powitalny (punkty)</Label>
                    <Input
                      type="number"
                      value={loyaltyProgram.welcomeBonus ?? ''}
                      onChange={(e) => setLoyaltyProgram({ welcomeBonus: Number(e.target.value) })}
                      placeholder="100"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Stamps-specific settings */}
            {loyaltyProgram.type === 'stamps' && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Wymagane pieczatki</Label>
                  <Input
                    type="number"
                    value={loyaltyProgram.stampsRequired ?? ''}
                    onChange={(e) => setLoyaltyProgram({ stampsRequired: Number(e.target.value) })}
                    placeholder="10"
                  />
                </div>
              </>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Wstecz
            </Button>
            <Button onClick={handleNext} disabled={!canProceedStep1 || createProgram.isPending}>
              {createProgram.isPending ? 'Tworzenie programu...' : 'Dalej'}
              {!createProgram.isPending && <ArrowRight className="ml-2 h-4 w-4" />}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Step 2: Finish */}
      {currentStep === 2 && (
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
              <CheckCircle2 className="h-8 w-8 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl">Konfiguracja zakonczona!</CardTitle>
            <CardDescription>
              Twoj program lojalnosciowy jest gotowy do dzialania.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 rounded-lg border p-4">
              <h3 className="font-semibold">Podsumowanie</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Firma</p>
                  <p className="font-medium">{businessProfile.companyName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">NIP</p>
                  <p className="font-medium">{businessProfile.nip}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Program</p>
                  <p className="font-medium">{loyaltyProgram.name}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Typ programu</p>
                  <Badge variant="secondary">
                    {loyaltyProgram.type === 'points'
                      ? 'Punktowy'
                      : loyaltyProgram.type === 'stamps'
                        ? 'Pieczatkowy'
                        : 'Tierowy'}
                  </Badge>
                </div>
                {loyaltyProgram.pointsPerPLN && (
                  <div>
                    <p className="text-muted-foreground">Punkty/PLN</p>
                    <p className="font-medium">{loyaltyProgram.pointsPerPLN}</p>
                  </div>
                )}
                {loyaltyProgram.welcomeBonus && (
                  <div>
                    <p className="text-muted-foreground">Bonus powitalny</p>
                    <p className="font-medium">{loyaltyProgram.welcomeBonus} pkt</p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button size="lg" onClick={handleFinish}>
              <Rocket className="mr-2 h-5 w-5" />
              Przejdz do Dashboard
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
