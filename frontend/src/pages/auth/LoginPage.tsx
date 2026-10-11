import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { isAxiosError } from 'axios';
import { z } from 'zod';
import { toast } from 'sonner';
import { Droplets, Mail, Lock, ArrowRight } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

const schema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
});

type FormData = z.infer<typeof schema>;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuthStore();
  const [submitting, setSubmitting] = useState(false);

  const { register, handleSubmit, formState: { errors }, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      await login(data.email, data.password);
      toast.success('Connexion réussie');
      const state = location.state as { from?: { pathname?: string } } | null;
      const from = state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const msg = isAxiosError<{ message?: string }>(err)
        ? err.response?.data?.message
        : undefined;
      toast.error(msg || 'Identifiants invalides');
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = (email: string) => {
    setValue('email', email);
    setValue('password', 'password');
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ===== Colonne gauche — Branding ===== */}
      <div className="relative hidden lg:flex flex-col justify-between water-gradient p-12 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -left-20 h-96 w-96 rounded-full bg-white/30 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-cyan-200/40 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/20 backdrop-blur">
            <Droplets className="h-6 w-6" />
          </div>
          <div>
            <p className="text-lg font-bold">WaterLeaks</p>
            <p className="text-xs text-white/80">Gestion des fuites d'eau</p>
          </div>
        </div>

        <div className="relative z-10 space-y-6">
          <h1 className="text-4xl font-bold leading-tight">
            Signalez, suivez et résolvez les fuites d'eau en temps réel.
          </h1>
          <p className="text-white/80 max-w-md">
            Une plateforme unifiée pour les citoyens, les techniciens et les superviseurs.
            Cartographie interactive, KPIs et notifications automatisées.
          </p>

          <div className="grid grid-cols-3 gap-4 pt-6">
            {[
              { value: '24/7', label: 'Suivi continu' },
              { value: '48h',  label: 'SLA moyen' },
              { value: '100%', label: 'Traçabilité' },
            ].map((s) => (
              <div key={s.label} className="rounded-xl bg-white/10 backdrop-blur p-4">
                <p className="text-2xl font-bold">{s.value}</p>
                <p className="text-xs text-white/70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-xs text-white/60">
          © {new Date().getFullYear()} WaterLeaks — Tous droits réservés
        </p>
      </div>

      {/* ===== Colonne droite — Formulaire ===== */}
      <div className="flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden mb-8 flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl water-gradient">
              <Droplets className="h-6 w-6 text-white" />
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">WaterLeaks</p>
              <p className="text-xs text-slate-500">Gestion des fuites d'eau</p>
            </div>
          </div>

          <div className="space-y-2 mb-8">
            <h2 className="text-3xl font-bold text-slate-900">Connexion</h2>
            <p className="text-slate-500">Accédez à votre espace de gestion</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Adresse email"
              type="email"
              placeholder="vous@exemple.com"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Mot de passe"
              type="password"
              placeholder="••••••••"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600">
                <input type="checkbox" className="rounded border-slate-300 text-primary focus:ring-primary" />
                Se souvenir de moi
              </label>
              <Link to="#" className="text-primary hover:underline font-medium">
                Mot de passe oublié ?
              </Link>
            </div>

            <Button type="submit" className="w-full" size="lg" loading={submitting}>
              Se connecter <ArrowRight className="h-4 w-4" />
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-slate-600">
            Pas encore de compte ?{' '}
            <Link to="/register" className="font-medium text-primary hover:underline">
              Créer un compte
            </Link>
          </div>

          {/* Comptes de démonstration */}
          <div className="mt-8 rounded-xl border border-dashed border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Comptes de démonstration
            </p>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Admin',       email: 'admin@waterleaks.local' },
                { label: 'Superviseur', email: 'superviseur@waterleaks.local' },
                { label: 'Technicien',  email: 'technicien@waterleaks.local' },
                { label: 'Citoyen',     email: 'citoyen@waterleaks.local' },
              ].map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => fillDemo(u.email)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-xs hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <p className="font-medium text-slate-800">{u.label}</p>
                  <p className="text-[10px] text-slate-500 truncate">{u.email}</p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}