import { Link } from 'react-router-dom';
import { ShieldX } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export function ForbiddenPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 mb-6">
        <ShieldX className="h-10 w-10 text-red-500" />
      </div>
      <h1 className="text-3xl font-bold text-slate-900 mb-2">Accès refusé</h1>
      <p className="text-slate-500 max-w-md mb-6">
        Vous n'avez pas les permissions nécessaires pour accéder à cette page.
      </p>
      <Link to="/dashboard">
        <Button>Retour au tableau de bord</Button>
      </Link>
    </div>
  );
}