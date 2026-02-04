'use client';

import { useState } from 'react';
import {
  useStampDefinitions,
  useCreateStampDefinition,
  useUpdateStampDefinition,
} from '@loyalty/api-client';
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
  useToast,
} from '@loyalty/ui';
import {
  Plus,
  MoreVertical,
  Pencil,
  Stamp,
  Gift,
  Hash,
} from 'lucide-react';

export default function StampsPage() {
  const { toast } = useToast();
  const { data: definitions, isLoading } = useStampDefinitions();
  const createDefinition = useCreateStampDefinition();
  const updateDefinition = useUpdateStampDefinition();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [stampsRequired, setStampsRequired] = useState('');
  const [rewardDescription, setRewardDescription] = useState('');

  const resetForm = () => {
    setName('');
    setDescription('');
    setStampsRequired('');
    setRewardDescription('');
    setEditingId(null);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const openEdit = (def: { id: string; name: string; description?: string; stampsRequired: number; rewardDescription: string }) => {
    setEditingId(def.id);
    setName(def.name);
    setDescription(def.description || '');
    setStampsRequired(def.stampsRequired.toString());
    setRewardDescription(def.rewardDescription);
    setDialogOpen(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateDefinition.mutateAsync({
          id: editingId,
          name,
          description: description || undefined,
          stampsRequired: Number(stampsRequired),
          rewardDescription,
        });
        toast({ title: 'Karta zaktualizowana', description: `"${name}" zostala zapisana.` });
      } else {
        await createDefinition.mutateAsync({
          name,
          description: description || undefined,
          stampsRequired: Number(stampsRequired),
          rewardDescription,
        });
        toast({ title: 'Karta utworzona', description: `"${name}" zostala dodana.` });
      }
      setDialogOpen(false);
      resetForm();
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie zapisac karty pieczatkowej.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Karty pieczatkowe</h1>
          <p className="text-muted-foreground">
            Definiuj szablony kart pieczatkowych dla klientow.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nowa karta
        </Button>
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : definitions && definitions.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {definitions.map((def) => (
            <Card key={def.id} className="transition-shadow hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Stamp className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{def.name}</CardTitle>
                      <Badge variant={def.status === 'active' ? 'default' : 'secondary'} className="mt-1">
                        {def.status === 'active' ? 'Aktywna' : def.status}
                      </Badge>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(def)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edytuj
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {def.description && (
                  <p className="text-sm text-muted-foreground">{def.description}</p>
                )}
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Wymagane pieczatki: <strong>{def.stampsRequired}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">
                    Nagroda: <strong>{def.rewardDescription}</strong>
                  </span>
                </div>
              </CardContent>
              <CardFooter className="text-xs text-muted-foreground">
                Utworzona: {formatDatePL(def.createdAt)}
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            Brak kart pieczatkowych. Kliknij &quot;Nowa karta&quot; aby utworzyc pierwsza.
          </CardContent>
        </Card>
      )}

      {/* Create / Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edytuj karte pieczatkowa' : 'Nowa karta pieczatkowa'}</DialogTitle>
            <DialogDescription>
              {editingId ? 'Zmien dane karty pieczatkowej.' : 'Zdefiniuj nowy szablon karty pieczatkowej.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Nazwa</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="np. Karta kawowa" />
            </div>
            <div className="space-y-2">
              <Label>Opis</Label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Krotki opis karty" />
            </div>
            <div className="space-y-2">
              <Label>Wymagane pieczatki</Label>
              <Input
                type="number"
                value={stampsRequired}
                onChange={(e) => setStampsRequired(e.target.value)}
                placeholder="10"
              />
            </div>
            <div className="space-y-2">
              <Label>Opis nagrody</Label>
              <Input
                value={rewardDescription}
                onChange={(e) => setRewardDescription(e.target.value)}
                placeholder="np. Darmowa kawa"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Anuluj</Button>
            <Button
              onClick={handleSave}
              disabled={!name || !stampsRequired || !rewardDescription || createDefinition.isPending || updateDefinition.isPending}
            >
              {createDefinition.isPending || updateDefinition.isPending
                ? 'Zapisywanie...'
                : editingId ? 'Zapisz zmiany' : 'Utworz karte'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
