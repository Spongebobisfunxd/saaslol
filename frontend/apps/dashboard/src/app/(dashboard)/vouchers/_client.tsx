'use client';

import { useState } from 'react';
import {
  useVouchers,
  useCreateVoucher,
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
  XCircle,
  Ticket,
  Percent,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function VouchersPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const { data, isLoading } = useVouchers({ page, limit: 20 });
  const createVoucher = useCreateVoucher();

  const [dialogOpen, setDialogOpen] = useState(false);

  // Form state
  const [code, setCode] = useState('');
  const [type, setType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountPercent, setDiscountPercent] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [maxUses, setMaxUses] = useState('1');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');

  const resetForm = () => {
    setCode('');
    setType('percentage');
    setDiscountPercent('');
    setDiscountAmount('');
    setMaxUses('1');
    setValidFrom('');
    setValidUntil('');
  };

  const handleCreate = async () => {
    try {
      await createVoucher.mutateAsync({
        code: code || undefined,
        type,
        discountPercent: type === 'percentage' ? Number(discountPercent) : undefined,
        discountAmountGrosze: type === 'fixed' ? Math.round(Number(discountAmount) * 100) : undefined,
        maxUses: Number(maxUses),
        validFrom: validFrom || new Date().toISOString(),
        validUntil: validUntil || undefined,
      });
      toast({ title: 'Voucher utworzony', description: 'Nowy voucher zostal utworzony.' });
      setDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie utworzyc vouchera.', variant: 'destructive' });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default">Aktywny</Badge>;
      case 'used': return <Badge variant="secondary">Wykorzystany</Badge>;
      case 'expired': return <Badge variant="destructive">Wygasly</Badge>;
      case 'cancelled': return <Badge variant="destructive">Anulowany</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const discountDisplay = (voucher: {
    type: string;
    discountPercent?: number;
    discountAmountGrosze?: number;
  }) => {
    if (voucher.type === 'percentage' && voucher.discountPercent != null) {
      return `${voucher.discountPercent}%`;
    }
    if (voucher.type === 'fixed' && voucher.discountAmountGrosze != null) {
      return formatPLN(voucher.discountAmountGrosze);
    }
    if (voucher.type === 'free_product') {
      return 'Darmowy produkt';
    }
    return '-';
  };

  const typeLabel = (t: string) => {
    switch (t) {
      case 'percentage': return 'Procentowy';
      case 'fixed': return 'Kwotowy';
      case 'free_product': return 'Darmowy produkt';
      default: return t;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Vouchery</h1>
          <p className="text-muted-foreground">
            Zarzadzaj kodami rabatowymi i voucherami.
          </p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nowy voucher
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
                    <TableHead>Typ</TableHead>
                    <TableHead>Znizka</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Uzycia</TableHead>
                    <TableHead>Wazny do</TableHead>
                    <TableHead className="w-[50px]">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data && data.data.length > 0 ? (
                    data.data.map((voucher) => (
                      <TableRow key={voucher.id}>
                        <TableCell className="font-mono font-medium">
                          <div className="flex items-center gap-2">
                            <Ticket className="h-4 w-4 text-muted-foreground" />
                            {voucher.code}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{typeLabel(voucher.type)}</Badge>
                        </TableCell>
                        <TableCell className="font-semibold">
                          <div className="flex items-center gap-1">
                            {voucher.type === 'percentage' && <Percent className="h-3 w-3" />}
                            {discountDisplay(voucher)}
                          </div>
                        </TableCell>
                        <TableCell>{statusBadge(voucher.status)}</TableCell>
                        <TableCell className="text-muted-foreground">
                          {voucher.currentUses} / {voucher.maxUses}
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {voucher.validUntil ? formatDatePL(voucher.validUntil) : 'Bezterminowy'}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
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
                        Brak voucherow.
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
            <DialogTitle>Nowy voucher</DialogTitle>
            <DialogDescription>
              Utworz nowy kod rabatowy.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Kod (opcjonalny, auto-generowany)</Label>
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="np. ZIMA2024"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label>Typ znizki</Label>
              <Select value={type} onValueChange={(v) => setType(v as 'percentage' | 'fixed')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">Procentowa</SelectItem>
                  <SelectItem value="fixed">Kwotowa (PLN)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {type === 'percentage' ? (
              <div className="space-y-2">
                <Label>Procent znizki (%)</Label>
                <Input
                  type="number"
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                  placeholder="10"
                  min="1"
                  max="100"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Kwota znizki (PLN)</Label>
                <Input
                  type="number"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  placeholder="50.00"
                  step="0.01"
                />
              </div>
            )}
            <div className="space-y-2">
              <Label>Max uzyc</Label>
              <Input
                type="number"
                value={maxUses}
                onChange={(e) => setMaxUses(e.target.value)}
                placeholder="1"
                min="1"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Wazny od</Label>
                <Input type="date" value={validFrom} onChange={(e) => setValidFrom(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Wazny do</Label>
                <Input type="date" value={validUntil} onChange={(e) => setValidUntil(e.target.value)} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button
              onClick={handleCreate}
              disabled={
                createVoucher.isPending ||
                (type === 'percentage' && !discountPercent) ||
                (type === 'fixed' && !discountAmount)
              }
            >
              {createVoucher.isPending ? 'Tworzenie...' : 'Utworz voucher'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
