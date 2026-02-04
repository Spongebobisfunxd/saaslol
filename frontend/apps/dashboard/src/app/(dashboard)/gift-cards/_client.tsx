'use client';

import { useState } from 'react';
import {
  useGiftCards,
  useCreateGiftCard,
  useActivateGiftCard,
} from '@loyalty/api-client';
import { formatPLN, formatDatePL } from '@loyalty/utils';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  CurrencyInput,
  useToast,
} from '@loyalty/ui';
import {
  Plus,
  MoreHorizontal,
  CreditCard,
  Eye,
  XCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function GiftCardsPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const { data, isLoading } = useGiftCards({ page, limit: 20 });
  const createGiftCard = useCreateGiftCard();
  const activateGiftCard = useActivateGiftCard();

  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [initialAmount, setInitialAmount] = useState(0);
  const [expiresAt, setExpiresAt] = useState('');
  const [customerId, setCustomerId] = useState('');

  const resetForm = () => {
    setInitialAmount(0);
    setExpiresAt('');
    setCustomerId('');
  };

  const handleCreate = async () => {
    try {
      await createGiftCard.mutateAsync({
        initialAmountGrosze: initialAmount,
        expiresAt: expiresAt || undefined,
        customerId: customerId || undefined,
      });
      toast({ title: 'Karta podarunkowa utworzona', description: 'Nowa karta podarunkowa zostala utworzona.' });
      setDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie utworzyc karty podarunkowej.', variant: 'destructive' });
    }
  };

  const handleActivate = async (id: string) => {
    try {
      await activateGiftCard.mutateAsync(id);
      toast({ title: 'Karta aktywowana', description: 'Karta podarunkowa zostala aktywowana.' });
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie aktywowac karty.', variant: 'destructive' });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default">Aktywna</Badge>;
      case 'inactive': return <Badge variant="secondary">Nieaktywna</Badge>;
      case 'expired': return <Badge variant="destructive">Wygasla</Badge>;
      case 'depleted': return <Badge className="bg-amber-100 text-amber-800">Wyczerpana</Badge>;
      case 'cancelled': return <Badge variant="destructive">Anulowana</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Karty podarunkowe</h1>
          <p className="text-muted-foreground">
            Zarzadzaj kartami podarunkowymi (gift cards).
          </p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nowa karta
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
            </div>
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Kod</TableHead>
                    <TableHead>Kwota poczatkowa</TableHead>
                    <TableHead>Saldo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Wazna do</TableHead>
                    <TableHead>Klient</TableHead>
                    <TableHead className="w-[50px]">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data && data.data.length > 0 ? (
                    data.data.map((card) => (
                      <TableRow key={card.id}>
                        <TableCell className="font-mono font-medium">
                          <div className="flex items-center gap-2">
                            <CreditCard className="h-4 w-4 text-muted-foreground" />
                            {card.code}
                          </div>
                        </TableCell>
                        <TableCell>{formatPLN(card.initialAmountGrosze)}</TableCell>
                        <TableCell className="font-semibold">
                          {formatPLN(card.currentAmountGrosze)}
                        </TableCell>
                        <TableCell>{statusBadge(card.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {card.expiresAt ? formatDatePL(card.expiresAt) : 'Bezterminowa'}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {card.customerId ? card.customerId.slice(0, 8) + '...' : '-'}
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
                                <Eye className="mr-2 h-4 w-4" />
                                Transakcje
                              </DropdownMenuItem>
                              {card.status === 'inactive' && (
                                <DropdownMenuItem onClick={() => handleActivate(card.id)}>
                                  <CreditCard className="mr-2 h-4 w-4" />
                                  Aktywuj
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem className="text-destructive">
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
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Brak kart podarunkowych.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Strona {data.page} z {data.totalPages} (lacznie {data.total})
                  </p>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                      Poprzednia
                    </Button>
                    <Button variant="outline" size="sm" disabled={page >= data.totalPages} onClick={() => setPage((p) => p + 1)}>
                      Nastepna
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Create dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nowa karta podarunkowa</DialogTitle>
            <DialogDescription>
              Utworz nowa karte podarunkowa z okreslona kwota.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Kwota poczatkowa (PLN)</Label>
              <CurrencyInput
                value={initialAmount}
                onChange={setInitialAmount}
              />
            </div>
            <div className="space-y-2">
              <Label>Data wygasniecia</Label>
              <Input
                type="date"
                value={expiresAt}
                onChange={(e) => setExpiresAt(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>ID klienta (opcjonalne)</Label>
              <Input
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                placeholder="Przypisz do klienta"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button
              onClick={handleCreate}
              disabled={!initialAmount || createGiftCard.isPending}
            >
              {createGiftCard.isPending ? 'Tworzenie...' : 'Utworz karte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
