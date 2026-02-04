'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  useCustomer,
  useUpdateCustomer,
  useTransactions,
  useStampCards,
} from '@loyalty/api-client';
import { formatPLN, formatDatePL, formatDateTimePL, formatPhone } from '@loyalty/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
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
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Avatar,
  AvatarFallback,
  Progress,
  Separator,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  useToast,
  PhoneInput,
} from '@loyalty/ui';
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Coins,
  TrendingUp,
  CreditCard,
  Tag,
  ShieldCheck,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from 'lucide-react';

export default function CustomerProfilePage() {
  const params = useParams();
  const id = params.id as string;
  const { toast } = useToast();

  const { data: customer, isLoading } = useCustomer(id);
  const updateCustomer = useUpdateCustomer();

  // Transaction pagination
  const [txPage, setTxPage] = useState(1);
  const { data: txData, isLoading: txLoading } = useTransactions({
    customerId: id,
    page: txPage,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Points ledger (using transactions filtered for points)
  const [pointsPage, setPointsPage] = useState(1);
  const { data: pointsData, isLoading: pointsLoading } = useTransactions({
    customerId: id,
    page: pointsPage,
    limit: 10,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  });

  // Stamp cards
  const { data: stampCards, isLoading: stampsLoading } = useStampCards(id);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editFirst, setEditFirst] = useState('');
  const [editLast, setEditLast] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPhone, setEditPhone] = useState('');

  const openEdit = () => {
    if (customer) {
      setEditFirst(customer.firstName);
      setEditLast(customer.lastName);
      setEditEmail(customer.email || '');
      setEditPhone(customer.phone || '');
    }
    setEditOpen(true);
  };

  const handleUpdate = async () => {
    try {
      await updateCustomer.mutateAsync({
        id,
        firstName: editFirst,
        lastName: editLast,
        email: editEmail || undefined,
        phone: editPhone,
      });
      toast({ title: 'Zaktualizowano', description: 'Dane klienta zostaly zapisane.' });
      setEditOpen(false);
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie zaktualizowac danych.', variant: 'destructive' });
    }
  };

  const tierColor = (tier?: string) => {
    switch (tier?.toLowerCase()) {
      case 'gold': return 'bg-yellow-100 text-yellow-800';
      case 'silver': return 'bg-gray-100 text-gray-800';
      case 'platinum': return 'bg-purple-100 text-purple-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" asChild>
          <Link href="/customers">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Powrot do listy
          </Link>
        </Button>
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            Klient nie zostal znaleziony.
          </CardContent>
        </Card>
      </div>
    );
  }

  const initials = `${customer.firstName?.[0] ?? ''}${customer.lastName?.[0] ?? ''}`.toUpperCase();

  return (
    <div className="space-y-6">
      {/* Back link */}
      <Button variant="ghost" asChild>
        <Link href="/customers">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Powrot do listy klientow
        </Link>
      </Button>

      {/* Customer info card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start gap-6">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="text-lg">{initials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold">
                  {customer.firstName} {customer.lastName}
                </h1>
                <Badge className={tierColor(customer.tier)} variant="secondary">
                  {customer.tier || 'Standard'}
                </Badge>
                <Badge variant={customer.status === 'active' ? 'default' : 'secondary'}>
                  {customer.status}
                </Badge>
              </div>
              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                {customer.email && (
                  <span className="flex items-center gap-1">
                    <Mail className="h-4 w-4" />
                    {customer.email}
                  </span>
                )}
                {customer.phone && (
                  <span className="flex items-center gap-1">
                    <Phone className="h-4 w-4" />
                    {formatPhone(customer.phone)}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  Dolaczyl: {formatDatePL(customer.createdAt)}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-muted-foreground">Saldo punktow</p>
              <p className="text-3xl font-bold text-primary">
                {customer.points.toLocaleString('pl-PL')}
              </p>
              <Button variant="outline" size="sm" className="mt-2" onClick={openEdit}>
                <Pencil className="mr-2 h-4 w-4" />
                Edytuj
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Przegladaj</TabsTrigger>
          <TabsTrigger value="transactions">Transakcje</TabsTrigger>
          <TabsTrigger value="points">Historia punktow</TabsTrigger>
          <TabsTrigger value="stamps">Karty pieczkowe</TabsTrigger>
          <TabsTrigger value="consents">Zgody</TabsTrigger>
        </TabsList>

        {/* Overview tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Coins className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Punkty</p>
                    <p className="text-xl font-bold">{customer.points.toLocaleString('pl-PL')}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="h-8 w-8 text-emerald-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Transakcje</p>
                    <p className="text-xl font-bold">{txData?.total ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Karty pieczatkowe</p>
                    <p className="text-xl font-bold">{stampCards?.length ?? 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Tag className="h-8 w-8 text-amber-600" />
                  <div>
                    <p className="text-sm text-muted-foreground">Tier</p>
                    <p className="text-xl font-bold">{customer.tier || 'Standard'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent activity */}
          <Card>
            <CardHeader>
              <CardTitle>Ostatnia aktywnosc</CardTitle>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="flex h-16 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : txData?.data && txData.data.length > 0 ? (
                <div className="space-y-3">
                  {txData.data.slice(0, 5).map((tx) => (
                    <div key={tx.id} className="flex items-center justify-between rounded-lg border p-3">
                      <div>
                        <p className="font-medium">{tx.description || tx.type}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateTimePL(tx.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatPLN(tx.amountGrosze)}</p>
                        <div className="flex gap-2 text-sm">
                          {tx.pointsEarned > 0 && (
                            <span className="text-emerald-600">+{tx.pointsEarned} pkt</span>
                          )}
                          {tx.pointsSpent > 0 && (
                            <span className="text-destructive">-{tx.pointsSpent} pkt</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground">Brak aktywnosci.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions tab */}
        <TabsContent value="transactions">
          <Card>
            <CardHeader>
              <CardTitle>Transakcje</CardTitle>
              <CardDescription>Historia transakcji klienta</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {txLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Typ</TableHead>
                        <TableHead>Kwota</TableHead>
                        <TableHead>Punkty +</TableHead>
                        <TableHead>Punkty -</TableHead>
                        <TableHead>Opis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {txData?.data && txData.data.length > 0 ? (
                        txData.data.map((tx) => (
                          <TableRow key={tx.id}>
                            <TableCell>{formatDateTimePL(tx.createdAt)}</TableCell>
                            <TableCell>
                              <Badge variant="secondary">{tx.type}</Badge>
                            </TableCell>
                            <TableCell>{formatPLN(tx.amountGrosze)}</TableCell>
                            <TableCell className="text-emerald-600">
                              {tx.pointsEarned > 0 ? `+${tx.pointsEarned}` : '-'}
                            </TableCell>
                            <TableCell className="text-destructive">
                              {tx.pointsSpent > 0 ? `-${tx.pointsSpent}` : '-'}
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                              {tx.description || '-'}
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                            Brak transakcji.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {txData && txData.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        Strona {txData.page} z {txData.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={txPage <= 1} onClick={() => setTxPage((p) => p - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled={txPage >= txData.totalPages} onClick={() => setTxPage((p) => p + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Points history tab */}
        <TabsContent value="points">
          <Card>
            <CardHeader>
              <CardTitle>Historia punktow</CardTitle>
              <CardDescription>Ledger punktow lojalnosciowych</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {pointsLoading ? (
                <div className="flex h-32 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
                </div>
              ) : (
                <>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Operacja</TableHead>
                        <TableHead>Punkty naliczone</TableHead>
                        <TableHead>Punkty wydane</TableHead>
                        <TableHead>Opis</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {pointsData?.data && pointsData.data.length > 0 ? (
                        pointsData.data
                          .filter((tx) => tx.pointsEarned > 0 || tx.pointsSpent > 0)
                          .map((tx) => (
                            <TableRow key={tx.id}>
                              <TableCell>{formatDateTimePL(tx.createdAt)}</TableCell>
                              <TableCell>
                                <Badge variant={tx.pointsEarned > 0 ? 'default' : 'secondary'}>
                                  {tx.pointsEarned > 0 ? 'Naliczenie' : 'Wydanie'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-emerald-600 font-semibold">
                                {tx.pointsEarned > 0 ? `+${tx.pointsEarned}` : '-'}
                              </TableCell>
                              <TableCell className="text-destructive font-semibold">
                                {tx.pointsSpent > 0 ? `-${tx.pointsSpent}` : '-'}
                              </TableCell>
                              <TableCell className="text-muted-foreground">
                                {tx.description || tx.type}
                              </TableCell>
                            </TableRow>
                          ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            Brak wpisow w historii punktow.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                  {pointsData && pointsData.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        Strona {pointsData.page} z {pointsData.totalPages}
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={pointsPage <= 1} onClick={() => setPointsPage((p) => p - 1)}>
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" disabled={pointsPage >= pointsData.totalPages} onClick={() => setPointsPage((p) => p + 1)}>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stamp cards tab */}
        <TabsContent value="stamps">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stampsLoading ? (
              <div className="col-span-full flex h-32 items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-4 border-primary border-t-transparent" />
              </div>
            ) : stampCards && stampCards.length > 0 ? (
              stampCards.map((card) => (
                <Card key={card.id}>
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">Karta #{card.id.slice(0, 8)}</p>
                      <Badge variant={card.isCompleted ? 'default' : 'secondary'}>
                        {card.isCompleted ? 'Ukonczona' : 'W toku'}
                      </Badge>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Pieczatki</span>
                        <span className="font-semibold">{card.currentStamps} / {card.stampsRequired}</span>
                      </div>
                      <Progress value={(card.currentStamps / card.stampsRequired) * 100} />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Utworzona: {formatDatePL(card.createdAt)}
                      {card.completedAt && ` | Ukonczona: ${formatDatePL(card.completedAt)}`}
                    </p>
                  </CardContent>
                </Card>
              ))
            ) : (
              <Card className="col-span-full">
                <CardContent className="flex h-24 items-center justify-center text-muted-foreground">
                  Brak kart pieczatkowych.
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* Consents tab */}
        <TabsContent value="consents">
          <Card>
            <CardHeader>
              <CardTitle>Zgody marketingowe (RODO)</CardTitle>
              <CardDescription>
                Status zgod klienta na komunikacje marketingowa.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">Zgoda na email marketing</p>
                      <p className="text-sm text-muted-foreground">Wysylanie ofert i promocji droga mailowa</p>
                    </div>
                  </div>
                  <Badge variant="default">Wyrazona</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-emerald-600" />
                    <div>
                      <p className="font-medium">Zgoda na SMS</p>
                      <p className="text-sm text-muted-foreground">Powiadomienia SMS o nowych promocjach</p>
                    </div>
                  </div>
                  <Badge variant="default">Wyrazona</Badge>
                </div>
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Zgoda na profilowanie</p>
                      <p className="text-sm text-muted-foreground">Personalizacja ofert na podstawie historii zakupow</p>
                    </div>
                  </div>
                  <Badge variant="secondary">Brak zgody</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edytuj klienta</DialogTitle>
            <DialogDescription>Zmien dane klienta.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Imie</Label>
                <Input value={editFirst} onChange={(e) => setEditFirst(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Nazwisko</Label>
                <Input value={editLast} onChange={(e) => setEditLast(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={editEmail} onChange={(e) => setEditEmail(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Telefon</Label>
              <PhoneInput value={editPhone} onChange={setEditPhone} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Anuluj</Button>
            <Button onClick={handleUpdate} disabled={updateCustomer.isPending}>
              {updateCustomer.isPending ? 'Zapisywanie...' : 'Zapisz zmiany'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
