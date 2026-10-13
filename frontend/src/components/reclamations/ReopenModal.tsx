import { useState } from 'react';
import { toast } from 'sonner';
import { RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { reclamationService } from '@/services/reclamationService';
import { cn } from '@/lib/utils';
import type { Reclamation, Gravite } from '@/types';

interface Props {
  reclamation: Reclamation;
  onClose: () => void;
  onSuccess: (r: Reclamation) => void;
}

export function ReopenModal({ reclamation, onClose, onSuccess }: Props) {
  const [commentaire, setCommentaire] = useState('');
  const [gravite, setGravite] = useState<Gravite>(reclamation.gravite);
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (commentaire.trim().length < 5) {
      toast.error('Motif obligatoire (min. 5 caractères)');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await reclamationService.reopen(
        reclamation.id,
        commentaire.trim(),
        gravite
      );
      toast.success('Réclamation rouverte');
      onSuccess(updated);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur');
    } finally {
      setSubmitting(false);
    }
  };

  const gravites: { value: Gravite; label: string; color: string; ring: string }[] = [
    { value: 'faible',   label: 'Faible',   color: 'bg-emerald-500', ring: 'ring-emerald-500' },
    { value: 'moyenne',  label: 'Moyenne',  color: 'bg-amber-500',   ring: 'ring-amber-500' },
    { value: 'critique', label: 'Critique', color: 'bg-red-500',     ring: 'ring-red-500' },
  ];

  return (
    <Modal
      open
      onClose={onClose}
      title="Rouvrir la réclamation"
      subtitle="La réclamation repassera en cours"
      icon={<RotateCcw className="h-5 w-5 text-amber-600" />}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button onClick={submit} loading={submitting}>Rouvrir</Button>
        </>
      }
    >
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Motif de réouverture *
          </label>
          <textarea
            rows={3}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Ex : Le problème persiste après intervention."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nouvelle gravité
          </label>
          <div className="grid grid-cols-3 gap-2">
            {gravites.map((g) => (
              <button
                key={g.value}
                type="button"
                onClick={() => setGravite(g.value)}
                className={cn(
                  'flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all',
                  gravite === g.value
                    ? `border-transparent ring-2 ${g.ring} bg-slate-50`
                    : 'border-slate-200 text-slate-600 hover:border-slate-300'
                )}
              >
                <span className={cn('h-2.5 w-2.5 rounded-full', g.color)} />
                {g.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
}