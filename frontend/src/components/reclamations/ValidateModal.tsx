import { useState } from 'react';
import { toast } from 'sonner';
import { ShieldCheck } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { reclamationService } from '@/services/reclamationService';
import type { Reclamation } from '@/types';

interface Props {
  reclamation: Reclamation;
  onClose: () => void;
  onSuccess: (r: Reclamation) => void;
}

export function ValidateModal({ reclamation, onClose, onSuccess }: Props) {
  const [commentaire, setCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    setSubmitting(true);
    try {
      const updated = await reclamationService.validate(
        reclamation.id,
        commentaire.trim() || undefined
      );
      toast.success('Réclamation clôturée');
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
      title="Valider et clôturer"
      subtitle="Confirmez que l'intervention est conforme"
      icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button
            onClick={submit}
            loading={submitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Valider et clôturer
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Récap preuve */}
        {reclamation.preuve_commentaire && (
          <div className="rounded-lg bg-slate-50 border border-slate-200 p-3">
            <p className="text-xs font-medium text-slate-500 mb-1">Preuve soumise :</p>
            <p className="text-sm text-slate-700 whitespace-pre-wrap">
              {reclamation.preuve_commentaire}
            </p>
            {reclamation.preuve_photo_url && (
              <img
                src={reclamation.preuve_photo_url}
                alt="Preuve"
                className="mt-2 w-full rounded-lg border border-slate-200 max-h-40 object-cover"
              />
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Commentaire de validation (optionnel)
          </label>
          <textarea
            rows={3}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Ex : Travail conforme, RAS."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>
    </Modal>
  );
}