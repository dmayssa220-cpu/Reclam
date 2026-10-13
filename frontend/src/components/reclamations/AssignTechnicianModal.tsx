import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { Wrench, Loader2, CheckCircle2, Calendar } from 'lucide-react';
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

export function AssignTechnicianModal({ reclamation, onClose, onSuccess }: Props) {
  const [techniciens, setTechniciens] = useState<AssignableUser[]>([]);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [datePrevue, setDatePrevue] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    reclamationService
      .getTechniciensAvecCharge()
      .then((data) => {
        // Trie par charge croissante
        const sorted = [...data].sort((a, b) => (a.en_cours ?? 0) - (b.en_cours ?? 0));
        setTechniciens(sorted);
      })
      .catch(() => toast.error('Erreur de chargement des techniciens'))
      .finally(() => setLoading(false));
  }, []);

  const submit = async () => {
    if (!selectedId) return;
    setSubmitting(true);
    try {
      const updated = await reclamationService.assignTechnician(
        reclamation.id,
        selectedId,
        datePrevue || undefined
      );
      toast.success('Technicien assigné');
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
      title="Assigner un technicien"
      subtitle={`Zone : ${reclamation.zone ?? 'Non définie'}`}
      icon={<Wrench className="h-5 w-5" />}
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
      ) : techniciens.length === 0 ? (
        <div className="py-6 text-center">
          <p className="text-sm text-slate-500">Aucun technicien disponible.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="max-h-64 overflow-y-auto space-y-2">
            {techniciens.map((t) => {
              const charge = t.en_cours ?? 0;
              const chargeColor =
                charge >= 5 ? 'text-red-600 bg-red-50' :
                charge >= 3 ? 'text-amber-600 bg-amber-50' :
                'text-emerald-600 bg-emerald-50';

              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl border p-3 text-left transition-all',
                    selectedId === t.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'border-slate-200 hover:border-slate-300'
                  )}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-sky-100 text-sky-700 font-semibold">
                    {t.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800">{t.name}</p>
                    <p className="text-xs text-slate-500 truncate">{t.email}</p>
                    {t.zone && (
                      <p className="text-[10px] text-slate-400 mt-0.5">Zone : {t.zone}</p>
                    )}
                  </div>
                  <div className={cn('rounded-full px-2 py-1 text-[10px] font-medium shrink-0', chargeColor)}>
                    {charge} en cours
                  </div>
                  {selectedId === t.id && (
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Date prévue optionnelle */}
          <div className="border-t border-slate-100 pt-3">
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600 mb-1.5">
              <Calendar className="h-3.5 w-3.5" />
              Date d'intervention prévue (optionnel)
            </label>
            <input
              type="datetime-local"
              value={datePrevue}
              onChange={(e) => setDatePrevue(e.target.value)}
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>
      )}
    </Modal>
  );
}