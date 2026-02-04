'use client';

import { useState } from 'react';
import {
  useCampaigns,
  useCreateCampaign,
  useUpdateCampaign,
  useDeleteCampaign,
} from '@loyalty/api-client';
import { formatDatePL } from '@loyalty/utils';
import {
  Card,
  CardContent,
  Button,
  Input,
  Label,
  Badge,
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  useToast,
} from '@loyalty/ui';
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Clock,
  XCircle,
  Megaphone,
  Mail,
  MessageSquare,
} from 'lucide-react';

export default function CampaignsPage() {
  const { toast } = useToast();
  const { data: campaigns, isLoading } = useCampaigns();
  const createCampaign = useCreateCampaign();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [channel, setChannel] = useState('email');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [targetAudience, setTargetAudience] = useState('all');
  const [startDate, setStartDate] = useState('');

  const resetForm = () => {
    setName('');
    setChannel('email');
    setSubject('');
    setMessage('');
    setTargetAudience('all');
    setStartDate('');
  };

  const handleCreate = async () => {
    try {
      await createCampaign.mutateAsync({
        name,
        channel,
        type: 'promotional',
        startDate: startDate || new Date().toISOString(),
        targetAudience,
        message,
        description: subject,
      });
      toast({ title: 'Kampania utworzona', description: `"${name}" zostala utworzona.` });
      setDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie utworzyc kampanii.', variant: 'destructive' });
    }
  };

  const handleSchedule = async (id: string) => {
    try {
      await updateCampaign.mutateAsync({ id, type: 'scheduled' });
      toast({ title: 'Kampania zaplanowana', description: 'Kampania zostala zaplanowana do wyslania.' });
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie zaplanowac kampanii.', variant: 'destructive' });
    }
  };

  const handleCancel = async (id: string) => {
    try {
      await deleteCampaign.mutateAsync(id);
      toast({ title: 'Kampania anulowana', description: 'Kampania zostala anulowana.' });
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie anulowac kampanii.', variant: 'destructive' });
    }
  };

  const channelBadge = (ch: string) => {
    switch (ch) {
      case 'email':
        return (
          <Badge variant="secondary" className="gap-1">
            <Mail className="h-3 w-3" />
            Email
          </Badge>
        );
      case 'sms':
        return (
          <Badge variant="secondary" className="gap-1">
            <MessageSquare className="h-3 w-3" />
            SMS
          </Badge>
        );
      default:
        return <Badge variant="secondary">{ch}</Badge>;
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'draft': return <Badge variant="secondary">Szkic</Badge>;
      case 'scheduled': return <Badge className="bg-blue-100 text-blue-800">Zaplanowana</Badge>;
      case 'sending': return <Badge className="bg-amber-100 text-amber-800">Wysylanie</Badge>;
      case 'sent': return <Badge variant="default">Wyslana</Badge>;
      case 'cancelled': return <Badge variant="destructive">Anulowana</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kampanie</h1>
          <p className="text-muted-foreground">
            Tworzenie i zarzadzanie kampaniami marketingowymi.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nowa kampania
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nazwa</TableHead>
                  <TableHead>Kanal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Odbiorcy</TableHead>
                  <TableHead>Data wyslania</TableHead>
                  <TableHead className="w-[50px]">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns && campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <Megaphone className="h-4 w-4 text-muted-foreground" />
                          {campaign.name}
                        </div>
                      </TableCell>
                      <TableCell>{channelBadge(campaign.channel)}</TableCell>
                      <TableCell>{statusBadge(campaign.status)}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaign.targetAudience || 'Wszyscy'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {campaign.startDate ? formatDatePL(campaign.startDate) : '-'}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edytuj
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleSchedule(campaign.id)}>
                              <Clock className="mr-2 h-4 w-4" />
                              Zaplanuj
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleCancel(campaign.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Anuluj
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Brak kampanii. Kliknij &quot;Nowa kampania&quot; aby utworzyc pierwsza.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nowa kampania</DialogTitle>
            <DialogDescription>
              Skonfiguruj nowa kampanie marketingowa.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa kampanii</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Zimowa promocja" />
            </div>
            <div className="space-y-2">
              <Label>Kanal</Label>
              <Select value={channel} onValueChange={setChannel}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="sms">SMS</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Temat</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Temat wiadomosci" />
            </div>
            <div className="space-y-2">
              <Label>Tresc wiadomosci</Label>
              <textarea
                className="flex min-h-[100px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Napisz tresc kampanii..."
              />
            </div>
            <div className="space-y-2">
              <Label>Grupa docelowa</Label>
              <Select value={targetAudience} onValueChange={setTargetAudience}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Wszyscy klienci</SelectItem>
                  <SelectItem value="active">Aktywni klienci</SelectItem>
                  <SelectItem value="inactive">Nieaktywni klienci</SelectItem>
                  <SelectItem value="gold">Tier Gold</SelectItem>
                  <SelectItem value="silver">Tier Silver</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Data wyslania</Label>
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button onClick={handleCreate} disabled={!name || !channel || createCampaign.isPending}>
              {createCampaign.isPending ? 'Tworzenie...' : 'Utworz kampanie'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
