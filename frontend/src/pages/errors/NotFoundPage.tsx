import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

export function NotFoundPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <p className="text-8xl font-bold water-gradient bg-clip-text text-transparent">404</p>
      <h1 className="text-2xl font-bold text-slate-900 mt-4 mb-2">Page introuvable</h1>
      <p className="text-slate-500 mb-6">La page que vous cherchez n'existe pas.</p>
      <Link to="/dashboard"><Button>Retour à l'accueil</Button></Link>
    </div>
  );
}