'use client';

import { useState } from 'react';
import {
  useRewards,
  useCreateReward,
  useUpdateReward,
  useDeleteReward,
} from '@loyalty/api-client';
import { formatDatePL } from '@loyalty/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
  Button,
  Input,
  Label,
  Badge,
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
  useToast,
} from '@loyalty/ui';
import {
  Plus,
  MoreVertical,
  Pencil,
  Archive,
  Gift,
  Coins,
  Package,
} from 'lucide-react';

export default function RewardsPage() {
  const { toast } = useToast();
  const [page] = useState(1);

  const { data, isLoading } = useRewards({ page, limit: 50 });
  const createReward = useCreateReward();
  const updateReward = useUpdateReward();
  const deleteReward = useDeleteReward();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointsCost, setPointsCost] = useState('');
  const [stock, setStock] = useState('');
  const [category, setCategory] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setPointsCost('');
    setStock('');
    setCategory('');
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (reward: { id: string; name: string; description?: string; pointsCost: number; stock?: number; category?: string }) => {
    setEditingId(reward.id);
    setName(reward.name);
    setDescription(reward.description || '');
    setPointsCost(reward.pointsCost.toString());
    setStock(reward.stock?.toString() || '');
    setCategory(reward.category || '');
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateReward.mutateAsync({
          id: editingId,
          name,
          description: description || undefined,
          pointsCost: Number(pointsCost),
          stock: stock ? Number(stock) : undefined,
          category: category || undefined,
        });
        toast({ title: 'Nagroda zaktualizowana', description: `"${name}" zostala zapisana.` });
      } else {
        await createReward.mutateAsync({
          name,
          description: description || undefined,
          pointsCost: Number(pointsCost),
          stock: stock ? Number(stock) : undefined,
          category: category || undefined,
          type: 'physical',
        });
        toast({ title: 'Nagroda utworzona', description: `"${name}" zostala dodana.` });
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie zapisac nagrody.', variant: 'destructive' });
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await deleteReward.mutateAsync(id);
      toast({ title: 'Nagroda zarchiwizowana', description: 'Nagroda zostala zarchiwizowana.' });
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie zarchiwizowac nagrody.', variant: 'destructive' });
    }
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'active': return <Badge variant="default">Aktywna</Badge>;
      case 'out_of_stock': return <Badge variant="destructive">Brak w magazynie</Badge>;
      case 'archived': return <Badge variant="secondary">Zarchiwizowana</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Nagrody</h1>
          <p className="text-muted-foreground">
            Zarzadzaj katalogiem nagrod programu lojalnosciowego.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nowa nagroda
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : data?.data && data.data.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {data.data.map((reward) => (
            <Card key={reward.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  {/* Image placeholder */}
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-muted">
                    {reward.imageUrl ? (
                      <img
                        src={reward.imageUrl}
                        alt={reward.name}
                        className="h-12 w-12 rounded-lg object-cover"
                      />
                    ) : (
                      <Gift className="h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(reward)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edytuj
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleArchive(reward.id)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archiwizuj
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <CardTitle className="text-base">{reward.name}</CardTitle>
                {reward.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {reward.description}
                  </p>
                )}
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-amber-500" />
                  <span className="font-bold text-lg">{reward.pointsCost.toLocaleString('pl-PL')}</span>
                  <span className="text-sm text-muted-foreground">pkt</span>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Package className="h-4 w-4" />
                  {reward.stock != null ? `${reward.stock} szt.` : 'Nieograniczony'}
                </div>
                {statusBadge(reward.status)}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            Brak nagrod. Kliknij &quot;Nowa nagroda&quot; aby dodac pierwsza.
          </CardContent>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edytuj nagrode' : 'Nowa nagroda'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Zmien dane nagrody.' : 'Wypelnij dane nowej nagrody.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Kubek firmowy" />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Krotki opis nagrody" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Koszt (punkty)</Label>
                <Input type="number" value={pointsCost} onChange={(e) => setPointsCost(e.target.value)} placeholder="500" />
              </div>
              <div className="space-y-2">
                <Label>Magazyn (szt.)</Label>
                <Input type="number" value={stock} onChange={(e) => setStock(e.target.value)} placeholder="100" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Kategoria</Label>
              <Input value={category} onChange={(e) => setCategory(e.target.value)} placeholder="np. gadgety, vouchery" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button
              onClick={handleSave}
              disabled={!name || !pointsCost || createReward.isPending || updateReward.isPending}
            >
              {createReward.isPending || updateReward.isPending ? 'Zapisywanie...' : editingId ? 'Zapisz zmiany' : 'Dodaj nagrode'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
