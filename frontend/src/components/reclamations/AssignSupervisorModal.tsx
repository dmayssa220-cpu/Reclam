import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { UserCheck, Loader2, CheckCircle2 } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { reclamationService } from '@/services/reclamationService';
import { cn } from '@/lib/utils';
import type { Reclamation, AssignableUser } from '@/types';

interface Props {
  reclamation: Reclamation;
  onClose: () => void;
  onSuccess: (r: Reclamation) => void;
}

export function AssignSupervisorModal({ reclamation, onClose, onSuccess }: Props) {
  const [superviseurs, setSuperviseurs] = useState<AssignableUser[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    reclamationService
      .getSuperviseurs(reclamation.zone ?? undefined)
      .then(setSuperviseurs)
      .catch(() => toast.error('Erreur de chargement des superviseurs'))
      .finally(() => setLoading(false));
  }, [reclamation.zone]);

  const submit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const updated = await reclamationService.assignSupervisor(reclamation.id, selectedId);
      toast.success('Superviseur assigné');
      onSuccess(updated);
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
      title="Assigner un superviseur"
      subtitle={reclamation.zone ? `Zone : ${reclamation.zone}` : 'Sélectionnez un superviseur'}
      icon={<UserCheck className="h-5 w-5" />}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button onClick={submit} loading={submitting} disabled={!selectedId}>
            Assigner
          </Button>
        </>
      }
    >
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : superviseurs.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-500">
            Aucun superviseur disponible pour cette zone.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {superviseurs.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelectedId(s.id)}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                selectedId === s.id
                  ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                  : 'border-slate-200 hover:border-slate-300'
              )}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full water-gradient text-white font-semibold">
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-800">{s.name}</p>
                <p className="text-xs text-slate-500 truncate">{s.email}</p>
                {s.zone && (
                  <p className="text-[10px] text-slate-400 mt-0.5">Zone : {s.zone}</p>
                )}
              </div>
              {selectedId === s.id && (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}
    </Modal>
  );
}