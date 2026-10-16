import { useState } from 'react';
import { toast } from 'sonner';
import { User as UserIcon, Lock, Save } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { api } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function ProfilePage() {
  const { user, fetchMe } = useAuthStore();

  const [profile, setProfile] = useState({
    name: user?.name ?? '',
    email: user?.email ?? '',
    zone: user?.zone ?? '',
    telephone: user?.telephone ?? '',
  });

  const [pwd, setPwd] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPwd, setSavingPwd] = useState(false);

  const saveProfile = async () => {
    setSavingProfile(true);
    try {
      await api.put('/profile', profile);
      await fetchMe();
      toast.success('Profil mis à jour');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur');
    } finally {
      setSavingProfile(false);
    }
  };

  const savePassword = async () => {
    setSavingPwd(true);
    try {
      await api.put('/profile/password', pwd);
      setPwd({ current_password: '', password: '', password_confirmation: '' });
      toast.success('Mot de passe mis à jour');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur');
    } finally {
      setSavingPwd(false);
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Mon profil</h1>
        <p className="text-sm text-slate-500 mt-1">Gérez vos informations personnelles</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserIcon className="h-4 w-4 text-primary" /> Informations
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Nom complet" value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          <Input label="Email" type="email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
          <Input label="Zone" value={profile.zone} onChange={(e) => setProfile({ ...profile, zone: e.target.value })} />
          <Input label="Téléphone" value={profile.telephone} onChange={(e) => setProfile({ ...profile, telephone: e.target.value })} />
          <Button onClick={saveProfile} loading={savingProfile}>
            <Save className="h-4 w-4" /> Enregistrer
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-4 w-4 text-primary" /> Mot de passe
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Mot de passe actuel" type="password" value={pwd.current_password} onChange={(e) => setPwd({ ...pwd, current_password: e.target.value })} />
          <Input label="Nouveau mot de passe" type="password" value={pwd.password} onChange={(e) => setPwd({ ...pwd, password: e.target.value })} />
          <Input label="Confirmer" type="password" value={pwd.password_confirmation} onChange={(e) => setPwd({ ...pwd, password_confirmation: e.target.value })} />
          <Button onClick={savePassword} loading={savingPwd}>
            <Save className="h-4 w-4" /> Changer le mot de passe
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}