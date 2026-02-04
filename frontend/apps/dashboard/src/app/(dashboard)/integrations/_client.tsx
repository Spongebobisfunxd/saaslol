'use client';

import { useState } from 'react';
import { apiClient } from '@loyalty/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Switch,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Checkbox,
  useToast,
} from '@loyalty/ui';
import {
  Plus,
  Settings,
  Webhook,
  CreditCard,
  Monitor,
  Trash2,
  ExternalLink,
  Check,
  X,
} from 'lucide-react';

interface WebhookEndpoint {
  id: string;
  url: string;
  events: string[];
  active: boolean;
  createdAt: string;
}

function useWebhooks() {
  return useQuery({
    queryKey: ['webhooks'],
    queryFn: async () => {
      const { data } = await apiClient.get<WebhookEndpoint[]>('/webhooks');
      return data;
    },
  });
}

function useCreateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { url: string; events: string[] }) => {
      const { data } = await apiClient.post<WebhookEndpoint>('/webhooks', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

function useUpdateWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<WebhookEndpoint> & { id: string }) => {
      const { data } = await apiClient.patch<WebhookEndpoint>(`/webhooks/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

function useDeleteWebhook() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/webhooks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webhooks'] });
    },
  });
}

const WEBHOOK_EVENTS = [
  'customer.created',
  'customer.updated',
  'transaction.created',
  'reward.redeemed',
  'points.earned',
  'points.spent',
  'campaign.sent',
  'stamp.added',
];

const posIntegrations = [
  {
    name: 'Novitus',
    description: 'Integracja z kasami fiskalnymi Novitus',
    icon: Monitor,
    configured: false,
  },
  {
    name: 'Posnet',
    description: 'Integracja z terminalami Posnet',
    icon: Monitor,
    configured: false,
  },
  {
    name: 'Elzab',
    description: 'Integracja z drukarkami fiskalnymi Elzab',
    icon: Monitor,
    configured: false,
  },
];

const paymentIntegrations = [
  {
    name: 'PayU',
    description: 'Platnosci online PayU z obsluga BLIK',
    icon: CreditCard,
    configured: false,
    fields: ['merchantPosId', 'signatureKey', 'oAuthClientId', 'oAuthClientSecret'],
  },
  {
    name: 'Tpay',
    description: 'Platnosci Tpay z BLIK',
    icon: CreditCard,
    configured: false,
    fields: ['merchantId', 'apiKey', 'apiPassword', 'securityCode'],
  },
];

export default function IntegrationsPage() {
  const { toast } = useToast();
  const { data: webhooks, isLoading: webhooksLoading } = useWebhooks();
  const createWebhook = useCreateWebhook();
  const updateWebhook = useUpdateWebhook();
  const deleteWebhook = useDeleteWebhook();

  // POS config dialog
  const [posConfigOpen, setPosConfigOpen] = useState(false);
  const [posConfigName, setPosConfigName] = useState('');
  const [posApiKey, setPosApiKey] = useState('');
  const [posEndpoint, setPosEndpoint] = useState('');

  // Payment config dialog
  const [paymentConfigOpen, setPaymentConfigOpen] = useState(false);
  const [paymentConfigName, setPaymentConfigName] = useState('');
  const [paymentField1, setPaymentField1] = useState('');
  const [paymentField2, setPaymentField2] = useState('');

  // Webhook dialog
  const [webhookDialogOpen, setWebhookDialogOpen] = useState(false);
  const [webhookUrl, setWebhookUrl] = useState('');
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);

  const handlePosConfig = (name: string) => {
    setPosConfigName(name);
    setPosApiKey('');
    setPosEndpoint('');
    setPosConfigOpen(true);
  };

  const handleSavePosConfig = () => {
    toast({ title: 'Konfiguracja zapisana', description: `Integracja z ${posConfigName} zostala skonfigurowana.` });
    setPosConfigOpen(false);
  };

  const handlePaymentConfig = (name: string) => {
    setPaymentConfigName(name);
    setPaymentField1('');
    setPaymentField2('');
    setPaymentConfigOpen(true);
  };

  const handleSavePaymentConfig = () => {
    toast({ title: 'Konfiguracja zapisana', description: `Integracja z ${paymentConfigName} zostala skonfigurowana.` });
    setPaymentConfigOpen(false);
  };

  const toggleWebhookEvent = (event: string) => {
    setWebhookEvents((prev) =>
      prev.includes(event)
        ? prev.filter((e) => e !== event)
        : [...prev, event]
    );
  };

  const handleCreateWebhook = async () => {
    try {
      await createWebhook.mutateAsync({ url: webhookUrl, events: webhookEvents });
      toast({ title: 'Webhook utworzony', description: 'Nowy endpoint webhook zostal dodany.' });
      setWebhookDialogOpen(false);
      setWebhookUrl('');
      setWebhookEvents([]);
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie utworzyc webhooka.', variant: 'destructive' });
    }
  };

  const handleToggleWebhook = async (webhook: WebhookEndpoint) => {
    try {
      await updateWebhook.mutateAsync({ id: webhook.id, active: !webhook.active });
      toast({
        title: webhook.active ? 'Webhook dezaktywowany' : 'Webhook aktywowany',
      });
    } catch {
      toast({ title: 'Blad', variant: 'destructive' });
    }
  };

  const handleDeleteWebhook = async (id: string) => {
    try {
      await deleteWebhook.mutateAsync(id);
      toast({ title: 'Webhook usuniety' });
    } catch {
      toast({ title: 'Blad', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Integracje</h1>
        <p className="text-muted-foreground">
          Polacz system lojalnosciowy z urzadzeniami POS, platnosciami i zewnetrznymi serwisami.
        </p>
      </div>

      {/* POS Integrations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Integracje POS</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posIntegrations.map((pos) => (
            <Card key={pos.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <pos.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{pos.name}</CardTitle>
                    <Badge variant={pos.configured ? 'default' : 'secondary'}>
                      {pos.configured ? 'Skonfigurowana' : 'Nieskonfigurowana'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{pos.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handlePosConfig(pos.name)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Konfiguruj
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Payment Integrations */}
      <div className="space-y-4">
        <h2 className="text-lg font-semibold">Integracje platnosci</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {paymentIntegrations.map((payment) => (
            <Card key={payment.name}>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <payment.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base">{payment.name}</CardTitle>
                    <Badge variant={payment.configured ? 'default' : 'secondary'}>
                      {payment.configured ? 'Skonfigurowana' : 'Nieskonfigurowana'}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{payment.description}</p>
              </CardContent>
              <CardFooter>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handlePaymentConfig(payment.name)}
                >
                  <Settings className="mr-2 h-4 w-4" />
                  Konfiguruj
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Webhook Endpoints */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Webhook Endpoints</h2>
          <Button size="sm" onClick={() => { setWebhookUrl(''); setWebhookEvents([]); setWebhookDialogOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj webhook
          </Button>
        </div>

        {webhooksLoading ? (
          <div className="flex h-32 items-center justify-center">
            <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        ) : webhooks && webhooks.length > 0 ? (
          <div className="space-y-3">
            {webhooks.map((webhook) => (
              <Card key={webhook.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Webhook className="h-5 w-5 shrink-0 text-muted-foreground" />
                      <div className="min-w-0">
                        <p className="font-mono text-sm truncate">{webhook.url}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {webhook.events.map((event) => (
                            <Badge key={event} variant="secondary" className="text-xs">
                              {event}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <Switch
                        checked={webhook.active}
                        onCheckedChange={() => handleToggleWebhook(webhook)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-destructive"
                        onClick={() => handleDeleteWebhook(webhook.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="flex h-24 items-center justify-center text-muted-foreground">
              Brak skonfigurowanych webhookow.
            </CardContent>
          </Card>
        )}
      </div>

      {/* POS Config Dialog */}
      <Dialog open={posConfigOpen} onOpenChange={setPosConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfiguracja {posConfigName}</DialogTitle>
            <DialogDescription>
              Wprowadz dane do integracji z {posConfigName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Klucz API</Label>
              <Input
                value={posApiKey}
                onChange={(e) => setPosApiKey(e.target.value)}
                placeholder="Klucz API z panelu producenta"
                type="password"
              />
            </div>
            <div className="space-y-2">
              <Label>Endpoint URL</Label>
              <Input
                value={posEndpoint}
                onChange={(e) => setPosEndpoint(e.target.value)}
                placeholder="https://api.example.com/pos"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPosConfigOpen(false)}>Anuluj</Button>
            <Button onClick={handleSavePosConfig}>Zapisz konfiguracje</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Payment Config Dialog */}
      <Dialog open={paymentConfigOpen} onOpenChange={setPaymentConfigOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfiguracja {paymentConfigName}</DialogTitle>
            <DialogDescription>
              Wprowadz dane uwierzytelniajace dla {paymentConfigName}.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Merchant ID / POS ID</Label>
              <Input
                value={paymentField1}
                onChange={(e) => setPaymentField1(e.target.value)}
                placeholder="ID sprzedawcy"
              />
            </div>
            <div className="space-y-2">
              <Label>Klucz API / Signature Key</Label>
              <Input
                value={paymentField2}
                onChange={(e) => setPaymentField2(e.target.value)}
                placeholder="Klucz autoryzacyjny"
                type="password"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentConfigOpen(false)}>Anuluj</Button>
            <Button onClick={handleSavePaymentConfig}>Zapisz konfiguracje</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Webhook Dialog */}
      <Dialog open={webhookDialogOpen} onOpenChange={setWebhookDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nowy webhook</DialogTitle>
            <DialogDescription>
              Skonfiguruj endpoint do otrzymywania powiadomien.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>URL</Label>
              <Input
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://your-app.com/webhook"
              />
            </div>
            <div className="space-y-2">
              <Label>Zdarzenia</Label>
              <div className="grid grid-cols-2 gap-2">
                {WEBHOOK_EVENTS.map((event) => (
                  <label
                    key={event}
                    className="flex items-center gap-2 rounded-lg border p-2 text-sm cursor-pointer hover:bg-muted"
                  >
                    <Checkbox
                      checked={webhookEvents.includes(event)}
                      onCheckedChange={() => toggleWebhookEvent(event)}
                    />
                    {event}
                  </label>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setWebhookDialogOpen(false)}>Anuluj</Button>
            <Button
              onClick={handleCreateWebhook}
              disabled={!webhookUrl || webhookEvents.length === 0 || createWebhook.isPending}
            >
              {createWebhook.isPending ? 'Tworzenie...' : 'Dodaj webhook'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
