'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProgram, useUpdateProgram } from '@loyalty/api-client';
import { formatDatePL } from '@loyalty/utils';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Separator,
  useToast,
} from '@loyalty/ui';
import {
  ArrowLeft,
  Pencil,
  Plus,
  Trash2,
  Star,
  Shield,
  TrendingUp,
  Award,
} from 'lucide-react';

interface EarnRule {
  id: string;
  type: string;
  value: number;
  conditions?: string;
}

interface BurnRule {
  id: string;
  type: string;
  value: number;
  conditions?: string;
}

interface Tier {
  id: string;
  name: string;
  minPoints: number;
  multiplier: number;
  benefits: string[];
}

export default function ProgramDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const { data: program, isLoading } = useProgram(id);
  const updateProgram = useUpdateProgram();

  // Sample data structures for rules/tiers (populated from program.rules in real app)
  const [earnRules, setEarnRules] = useState<EarnRule[]>([
    { id: '1', type: 'purchase', value: 1, conditions: '1 punkt za kazde 1 PLN' },
    { id: '2', type: 'birthday', value: 100, conditions: 'Bonus urodzinowy' },
    { id: '3', type: 'referral', value: 50, conditions: 'Za polecenie znajomego' },
  ]);

  const [burnRules, setBurnRules] = useState<BurnRule[]>([
    { id: '1', type: 'discount', value: 100, conditions: '100 pkt = 1 PLN znizki' },
    { id: '2', type: 'reward', value: 500, conditions: 'Wymiana na nagrode' },
  ]);

  const [tiers, setTiers] = useState<Tier[]>([
    { id: '1', name: 'Standard', minPoints: 0, multiplier: 1.0, benefits: ['Podstawowe naliczanie punktow'] },
    { id: '2', name: 'Silver', minPoints: 1000, multiplier: 1.5, benefits: ['1.5x punkty', 'Darmowa dostawa'] },
    { id: '3', name: 'Gold', minPoints: 5000, multiplier: 2.0, benefits: ['2x punkty', 'Darmowa dostawa', 'Priorytetowa obsluga'] },
    { id: '4', name: 'Platinum', minPoints: 15000, multiplier: 3.0, benefits: ['3x punkty', 'VIP dostep', 'Personal shopper'] },
  ]);

  // Edit rule dialog
  const [editRuleOpen, setEditRuleOpen] = useState(false);
  const [editRuleType, setEditRuleType] = useState('');
  const [editRuleValue, setEditRuleValue] = useState('');
  const [editRuleConditions, setEditRuleConditions] = useState('');
  const [editRuleKind, setEditRuleKind] = useState<'earn' | 'burn'>('earn');

  const handleAddRule = () => {
    const newRule = {
      id: Date.now().toString(),
      type: editRuleType,
      value: Number(editRuleValue),
      conditions: editRuleConditions,
    };
    if (editRuleKind === 'earn') {
      setEarnRules((prev) => [...prev, newRule]);
    } else {
      setBurnRules((prev) => [...prev, newRule]);
    }
    setEditRuleOpen(false);
    setEditRuleType('');
    setEditRuleValue('');
    setEditRuleConditions('');
    toast({ title: 'Regula dodana', description: 'Nowa regula zostala dodana do programu.' });
  };

  const removeEarnRule = (ruleId: string) => {
    setEarnRules((prev) => prev.filter((r) => r.id !== ruleId));
    toast({ title: 'Regula usunieta' });
  };

  const removeBurnRule = (ruleId: string) => {
    setBurnRules((prev) => prev.filter((r) => r.id !== ruleId));
    toast({ title: 'Regula usunieta' });
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!program) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/programs">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrot do listy
          </Link>
        </Button>
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            Program nie zostal znaleziony.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" asChild>
        <Link href="/programs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrot do programow
        </Link>
      </Button>

      {/* Program header */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">{program.name}</h1>
                <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                  {program.status === 'active' ? 'Aktywny' : program.status}
                </Badge>
              </div>
              <p className="text-muted-foreground">{program.description || 'Brak opisu'}</p>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <span>Typ: <strong>{program.type}</strong></span>
                {program.pointsPerPLN && (
                  <span>Punkty/PLN: <strong>{program.pointsPerPLN}</strong></span>
                )}
                {program.welcomeBonus && (
                  <span>Bonus powitalny: <strong>{program.welcomeBonus} pkt</strong></span>
                )}
                <span>Utworzony: {formatDatePL(program.createdAt)}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs: Rules & Tiers */}
      <Tabs defaultValue="rules">
        <TabsList>
          <TabsTrigger value="rules">Reguly</TabsTrigger>
          <TabsTrigger value="tiers">Tiery</TabsTrigger>
        </TabsList>

        {/* Rules tab */}
        <TabsContent value="rules" className="space-y-6">
          {/* Earn rules */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-emerald-600" />
                  Reguly naliczania punktow
                </CardTitle>
                <CardDescription>
                  Konfiguruj jak klienci zdobywaja punkty.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditRuleKind('earn');
                  setEditRuleOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj regule
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {earnRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
                      <Star className="h-5 w-5 text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{rule.type}</p>
                      <p className="text-sm text-muted-foreground">{rule.conditions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-lg">
                      +{rule.value} pkt
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => removeEarnRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {earnRules.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Brak regul naliczania. Dodaj pierwsza regule.
                </p>
              )}
            </CardContent>
          </Card>

          {/* Burn rules */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-blue-600" />
                  Reguly wydawania punktow
                </CardTitle>
                <CardDescription>
                  Konfiguruj jak klienci moga wykorzystac punkty.
                </CardDescription>
              </div>
              <Button
                size="sm"
                onClick={() => {
                  setEditRuleKind('burn');
                  setEditRuleOpen(true);
                }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Dodaj regule
              </Button>
            </CardHeader>
            <CardContent className="space-y-3">
              {burnRules.map((rule) => (
                <div key={rule.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                      <Award className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium capitalize">{rule.type}</p>
                      <p className="text-sm text-muted-foreground">{rule.conditions}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-lg">
                      -{rule.value} pkt
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-destructive"
                      onClick={() => removeBurnRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {burnRules.length === 0 && (
                <p className="text-center text-muted-foreground py-4">
                  Brak regul wydawania. Dodaj pierwsza regule.
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tiers tab */}
        <TabsContent value="tiers">
          <div className="grid gap-4 sm:grid-cols-2">
            {tiers.map((tier, index) => (
              <Card key={tier.id} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5 text-primary" />
                      {tier.name}
                    </CardTitle>
                    <Badge variant="secondary">#{index + 1}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Min. punkty</p>
                      <p className="text-lg font-bold">{tier.minPoints.toLocaleString('pl-PL')}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Mnoznik</p>
                      <p className="text-lg font-bold">{tier.multiplier}x</p>
                    </div>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm font-medium mb-2">Korzysc:</p>
                    <ul className="space-y-1">
                      {tier.benefits.map((benefit, i) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                          <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add rule dialog */}
      <Dialog open={editRuleOpen} onOpenChange={setEditRuleOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Dodaj regule {editRuleKind === 'earn' ? 'naliczania' : 'wydawania'}
            </DialogTitle>
            <DialogDescription>
              Skonfiguruj nowa regule dla programu.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Typ reguly</Label>
              <Input
                value={editRuleType}
                onChange={(e) => setEditRuleType(e.target.value)}
                placeholder="np. purchase, birthday, referral"
              />
            </div>
            <div className="space-y-2">
              <Label>Wartosc (punkty)</Label>
              <Input
                type="number"
                value={editRuleValue}
                onChange={(e) => setEditRuleValue(e.target.value)}
                placeholder="np. 10"
              />
            </div>
            <div className="space-y-2">
              <Label>Warunki / opis</Label>
              <Input
                value={editRuleConditions}
                onChange={(e) => setEditRuleConditions(e.target.value)}
                placeholder="Opis warunkow reguly"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditRuleOpen(false)}>Anuluj</Button>
            <Button onClick={handleAddRule} disabled={!editRuleType || !editRuleValue}>
              Dodaj regule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
