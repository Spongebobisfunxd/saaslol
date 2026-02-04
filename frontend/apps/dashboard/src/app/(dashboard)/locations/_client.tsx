'use client';

import { useState } from 'react';
import { apiClient } from '@loyalty/api-client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Switch,
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
  MapPin,
  Trash2,
} from 'lucide-react';

interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  status: string;
  createdAt: string;
}

function useLocations() {
  return useQuery({
    queryKey: ['locations'],
    queryFn: async () => {
      const { data } = await apiClient.get<Location[]>('/locations');
      return data;
    },
  });
}

function useCreateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: Omit<Location, 'id' | 'createdAt' | 'status'>) => {
      const { data } = await apiClient.post<Location>('/locations', payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

function useUpdateLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }: Partial<Location> & { id: string }) => {
      const { data } = await apiClient.patch<Location>(`/locations/${id}`, payload);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

function useDeleteLocation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/locations/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['locations'] });
    },
  });
}

export default function LocationsPage() {
  const { toast } = useToast();
  const { data: locations, isLoading } = useLocations();
  const createLocation = useCreateLocation();
  const updateLocation = useUpdateLocation();
  const deleteLocation = useDeleteLocation();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const resetForm = () => {
    setName('');
    setAddress('');
    setCity('');
    setPostalCode('');
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (loc: Location) => {
    setEditingId(loc.id);
    setName(loc.name);
    setAddress(loc.address);
    setCity(loc.city);
    setPostalCode(loc.postalCode);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateLocation.mutateAsync({
          id: editingId,
          name,
          address,
          city,
          postalCode,
        });
        toast({ title: 'Lokalizacja zaktualizowana', description: `"${name}" zostala zapisana.` });
      } else {
        await createLocation.mutateAsync({ name, address, city, postalCode });
        toast({ title: 'Lokalizacja utworzona', description: `"${name}" zostala dodana.` });
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie zapisac lokalizacji.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteLocation.mutateAsync(deleteId);
      toast({ title: 'Lokalizacja usunieta' });
      setDeleteId(null);
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie usunac lokalizacji.', variant: 'destructive' });
    }
  };

  const handleToggleStatus = async (loc: Location) => {
    const newStatus = loc.status === 'active' ? 'inactive' : 'active';
    try {
      await updateLocation.mutateAsync({ id: loc.id, status: newStatus });
      toast({ title: `Lokalizacja ${newStatus === 'active' ? 'aktywowana' : 'dezaktywowana'}` });
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie zmienic statusu.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lokalizacje</h1>
          <p className="text-muted-foreground">
            Zarzadzaj punktami sprzedazy i lokalizacjami.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nowa lokalizacja
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
                  <TableHead>Adres</TableHead>
                  <TableHead>Miasto</TableHead>
                  <TableHead>Kod pocztowy</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Aktywna</TableHead>
                  <TableHead className="w-[50px]">Akcje</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {locations && locations.length > 0 ? (
                  locations.map((loc) => (
                    <TableRow key={loc.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          {loc.name}
                        </div>
                      </TableCell>
                      <TableCell>{loc.address}</TableCell>
                      <TableCell>{loc.city}</TableCell>
                      <TableCell className="font-mono">{loc.postalCode}</TableCell>
                      <TableCell>
                        <Badge variant={loc.status === 'active' ? 'default' : 'secondary'}>
                          {loc.status === 'active' ? 'Aktywna' : 'Nieaktywna'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={loc.status === 'active'}
                          onCheckedChange={() => handleToggleStatus(loc)}
                        />
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEdit(loc)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edytuj
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => setDeleteId(loc.id)}
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
                      Brak lokalizacji.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edytuj lokalizacje' : 'Nowa lokalizacja'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Zmien dane lokalizacji.' : 'Dodaj nowy punkt sprzedazy.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Sklep Centrum" />
            </div>
            <div className="space-y-2">
              <Label>Adres</Label>
              <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="ul. Przykladowa 1" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Miasto</Label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Warszawa" />
              </div>
              <div className="space-y-2">
                <Label>Kod pocztowy</Label>
                <Input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="00-001" />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button
              onClick={handleSave}
              disabled={!name || !address || !city || !postalCode || createLocation.isPending || updateLocation.isPending}
            >
              {createLocation.isPending || updateLocation.isPending
                ? 'Zapisywanie...'
                : editingId ? 'Zapisz zmiany' : 'Dodaj lokalizacje'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usun lokalizacje</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunac te lokalizacje?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Anuluj</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteLocation.isPending}>
              {deleteLocation.isPending ? 'Usuwanie...' : 'Usun'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
