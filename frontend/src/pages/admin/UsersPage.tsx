import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Users, Plus, Search, Loader2, Pencil, Trash2, Power } from 'lucide-react';
import { userService } from '@/services/userService';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import type { Role, User } from '@/types';

const ROLES: Role[] = ['ADMIN', 'SUPERVISEUR', 'TECHNICIEN', 'CITOYEN', 'ANALYSTE'];

export function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [editing, setEditing] = useState<User | null>(null);
  const [creating, setCreating] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await userService.list({ search });
      setUsers(res.data);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchData, 400);
    return () => clearTimeout(t);
  }, [search]);

  const handleDelete = async (user: User) => {
    if (!confirm(`Supprimer ${user.name} ?`)) return;
    try {
      await userService.remove(user.id);
      toast.success('Utilisateur supprimé');
      fetchData();
    } catch {
      toast.error('Erreur');
    }
  };

  const handleToggle = async (user: User) => {
    try {
      await userService.toggleActive(user.id);
      toast.success(user.is_active ? 'Désactivé' : 'Activé');
      fetchData();
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Users className="h-6 w-6 text-primary" />
            Utilisateurs
          </h1>
          <p className="text-sm text-slate-500 mt-1">{users.length} utilisateur(s)</p>
        </div>
        <Button onClick={() => setCreating(true)}>
          <Plus className="h-4 w-4" /> Nouvel utilisateur
        </Button>
      </div>

      <div className="max-w-md">
        <Input
          placeholder="Rechercher…"
          icon={<Search className="h-4 w-4" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
          ) : (
            <div className="divide-y divide-slate-100">
              {users.map((u) => (
                <div key={u.id} className="flex items-center gap-4 p-4 hover:bg-slate-50">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full water-gradient text-white font-semibold">
                    {u.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{u.name}</p>
                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                  </div>
                  <Badge variant={u.is_active ? 'success' : 'destructive'}>
                    {u.is_active ? 'Actif' : 'Inactif'}
                  </Badge>
                  <Badge variant="info">{u.roles?.[0]?.name ?? '—'}</Badge>
                  {u.zone && <span className="text-xs text-slate-500">{u.zone}</span>}
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" onClick={() => setEditing(u)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleToggle(u)}>
                      <Power className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(u)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {(creating || editing) && (
        <UserFormModal
          user={editing}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSuccess={() => { setCreating(false); setEditing(null); fetchData(); }}
        />
      )}
    </div>
  );
}

function UserFormModal({ user, onClose, onSuccess }: { user: User | null; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    password: '',
    password_confirmation: '',
    role: user?.roles?.[0]?.name ?? 'CITOYEN',
    zone: user?.zone ?? '',
    telephone: user?.telephone ?? '',
  });
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      if (user) {
        const payload: any = { ...form };
        if (!payload.password) { delete payload.password; delete payload.password_confirmation; }
        await userService.update(user.id, payload);
        toast.success('Utilisateur mis à jour');
      } else {
        await userService.create(form);
        toast.success('Utilisateur créé');
      }
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={user ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur'}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button onClick={submit} loading={submitting}>Enregistrer</Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Input label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
        <Input label={user ? 'Nouveau mot de passe (optionnel)' : 'Mot de passe'} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
        <Input label="Confirmer" type="password" value={form.password_confirmation} onChange={(e) => setForm({ ...form, password_confirmation: e.target.value })} />
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">Rôle</label>
          <select
            value={form.role}
            onChange={(e) => {
              const role = ROLES.find((allowedRole) => allowedRole === e.target.value);
              if (role) setForm({ ...form, role });
            }}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
          >
            {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <Input label="Zone" value={form.zone} onChange={(e) => setForm({ ...form, zone: e.target.value })} />
        <Input label="Téléphone" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} />
      </div>
    </Modal>
  );
}