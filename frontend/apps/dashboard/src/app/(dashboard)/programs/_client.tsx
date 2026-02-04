'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  usePrograms,
  useCreateProgram,
  useDeleteProgram,
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
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
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
  Trash2,
  Star,
  Stamp,
  Layers,
  ArrowRightLeft,
  Combine,
} from 'lucide-react';

const programTypeLabels: Record<string, string> = {
  points: 'Punktowy',
  stamps: 'Pieczatkowy',
  tiers: 'Tierowy',
  cashback: 'Cashback',
  hybrid: 'Hybrydowy',
};

const programTypeIcons: Record<string, typeof Star> = {
  points: Star,
  stamps: Stamp,
  tiers: Layers,
  cashback: ArrowRightLeft,
  hybrid: Combine,
};

export default function ProgramsPage() {
  const { toast } = useToast();
  const { data: programs, isLoading } = usePrograms();
  const createProgram = useCreateProgram();
  const deleteProgram = useDeleteProgram();

  const [createOpen, setCreateOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [name, setName] = useState('');
  const [type, setType] = useState<'points' | 'stamps' | 'tiers' | 'cashback' | 'hybrid'>('points');
  const [description, setDescription] = useState('');

  const handleCreate = async () => {
    try {
      await createProgram.mutateAsync({ name, type, description: description || undefined });
      toast({ title: 'Program utworzony', description: `Program "${name}" zostal utworzony.` });
      setCreateOpen(false);
      setName('');
      setType('points');
      setDescription('');
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie utworzyc programu.', variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteProgram.mutateAsync(deleteId);
      toast({ title: 'Program usuniety', description: 'Program zostal usuniety.' });
      setDeleteId(null);
    } catch {
      toast({ title: 'Blad', description: 'Nie udalo sie usunac programu.', variant: 'destructive' });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Programy lojalnosciowe</h1>
          <p className="text-muted-foreground">
            Tworzenie i zarzadzanie programami lojalnosciowymi.
          </p>
        </div>

        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nowy program
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Nowy program lojalnosciowy</DialogTitle>
              <DialogDescription>
                Skonfiguruj podstawowe informacje o programie.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="prog-name">Nazwa programu</Label>
                <Input
                  id="prog-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="np. Program punktowy"
                />
              </div>
              <div className="space-y-2">
                <Label>Typ programu</Label>
                <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="points">Punktowy</SelectItem>
                    <SelectItem value="stamps">Pieczatkowy</SelectItem>
                    <SelectItem value="tiers">Tierowy</SelectItem>
                    <SelectItem value="cashback">Cashback</SelectItem>
                    <SelectItem value="hybrid">Hybrydowy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="prog-desc">Opis</Label>
                <Input
                  id="prog-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Krotki opis programu..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>
                Anuluj
              </Button>
              <Button onClick={handleCreate} disabled={!name || createProgram.isPending}>
                {createProgram.isPending ? 'Tworzenie...' : 'Utworz program'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Programs grid */}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      ) : programs && programs.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {programs.map((program) => {
            const TypeIcon = programTypeIcons[program.type] || Star;
            return (
              <Card key={program.id} className="transition-shadow hover:shadow-md">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <TypeIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{program.name}</CardTitle>
                        <div className="flex gap-2 mt-1">
                          <Badge variant="secondary">
                            {programTypeLabels[program.type] || program.type}
                          </Badge>
                          <Badge variant={program.status === 'active' ? 'default' : 'secondary'}>
                            {program.status === 'active' ? 'Aktywny' : program.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/programs/${program.id}`}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edytuj
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => setDeleteId(program.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Usun
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {program.description || 'Brak opisu.'}
                  </p>
                  {program.pointsPerPLN && (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">Punkty za 1 PLN:</span> {program.pointsPerPLN}
                    </p>
                  )}
                  {program.welcomeBonus && program.welcomeBonus > 0 && (
                    <p className="text-sm">
                      <span className="font-medium">Bonus powitalny:</span> {program.welcomeBonus} pkt
                    </p>
                  )}
                </CardContent>
                <CardFooter className="text-xs text-muted-foreground">
                  Utworzony: {formatDatePL(program.createdAt)}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex h-32 items-center justify-center text-muted-foreground">
            Brak programow lojalnosciowych. Kliknij &quot;Nowy program&quot; aby utworzyc pierwszy.
          </CardContent>
        </Card>
      )}

      {/* Delete confirmation */}
      <Dialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Usun program</DialogTitle>
            <DialogDescription>
              Czy na pewno chcesz usunac ten program lojalnosciowy? Ta operacja jest nieodwracalna.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Anuluj</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteProgram.isPending}>
              {deleteProgram.isPending ? 'Usuwanie...' : 'Usun program'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
