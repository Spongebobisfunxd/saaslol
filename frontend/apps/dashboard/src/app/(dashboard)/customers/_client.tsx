'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  useCustomers,
  useCreateCustomer,
  useDeleteCustomer,
} from '@loyalty/api-client';
import { formatDatePL, formatPhone } from '@loyalty/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
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
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  PhoneInput,
  useToast,
} from '@loyalty/ui';
import {
  Plus,
  Search,
  MoreHorizontal,
  User,
  Pencil,
  Trash2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

export default function CustomersPage() {
  const { toast } = useToast();

  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const { data, isLoading } = useCustomers({
    page,
    limit: pageSize,
    search: search || undefined,
  });

  const createCustomer = useCreateCustomer();
  const deleteCustomer = useDeleteCustomer();

  const handleSearch = () => {
    setSearch(searchInput);
    setPage(1);
  };

  const handleCreate = async () => {
    try {
      await createCustomer.mutateAsync({
        firstName,
        lastName,
        email: email || undefined,
        phone,
      });
      toast({ title: 'Klient utworzony', description: `${firstName} ${lastName} zostal dodany.` });
      setCreateOpen(false);
      setFirstName('');
      setLastName('');
      setEmail('');
      setPhone('');
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie utworzyc klienta.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteCustomer.mutateAsync(deleteId);
      toast({ title: 'Klient usuniety', description: 'Klient zostal usuniety z systemu.' });
      setDeleteId(null);
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie usunac klienta.', variant: 'destructive' });
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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Klienci</h1>
          <p className="text-muted-foreground">
            Zarzadzaj baza klientow programu lojalnosciowego.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Dodaj klienta
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowy klient</DialogTitle>
              <DialogDescription>
                Wypelnij dane klienta, aby dodac go do programu lojalnosciowego.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Imie</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Jan"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Nazwisko</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Kowalski"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="jan@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <PhoneInput
                  value={phone}
                  onChange={setPhone}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Anuluj
              </Button>
              <Button
                onClick={handleCreate}
                disabled={!firstName || !lastName || !phone || createCustomer.isPending}
              >
                {createCustomer.isPending ? 'Tworzenie...' : 'Dodaj klienta'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Szukaj po imieniu, nazwisku, emailu lub telefonie..."
                className="pl-9"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button variant="secondary" onClick={handleSearch}>
              Szukaj
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Customers table */}
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
                    <TableHead>Imie i nazwisko</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Telefon</TableHead>
                    <TableHead>Punkty</TableHead>
                    <TableHead>Tier</TableHead>
                    <TableHead>Dolaczyl</TableHead>
                    <TableHead className="w-[50px]">Akcje</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data?.data && data.data.length > 0 ? (
                    data.data.map((customer) => (
                      <TableRow key={customer.id}>
                        <TableCell className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{customer.phone ? formatPhone(customer.phone) : '-'}</TableCell>
                        <TableCell className="font-semibold">
                          {customer.points.toLocaleString('pl-PL')}
                        </TableCell>
                        <TableCell>
                          <Badge className={tierColor(customer.tier)} variant="secondary">
                            {customer.tier || 'Standard'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">
                          {formatDatePL(customer.createdAt)}
                        </TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}`}>
                                  <User className="mr-2 h-4 w-4" />
                                  Profil
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/customers/${customer.id}?edit=true`}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Edytuj
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setDeleteId(customer.id)}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Usun
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center text-muted-foreground">
                        Brak klientow do wyswietlenia.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>

              {/* Pagination */}
              {data && data.totalPages > 1 && (
                <div className="flex items-center justify-between border-t px-4 py-3">
                  <p className="text-sm text-muted-foreground">
                    Strona {data.page} z {data.totalPages} (lacznie {data.total})
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => p - 1)}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Poprzednia
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= data.totalPages}
                      onClick={() => setPage((p) => p + 1)}
                    >
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

      {/* Delete confirmation dialog */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Potwierdzenie usuniecia</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunac tego klienta? Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Anuluj
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteCustomer.isPending}
            >
              {deleteCustomer.isPending ? 'Usuwanie...' : 'Usun klienta'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
