import { useState } from 'react';
import { toast } from 'sonner';
import { XCircle } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { reclamationService } from '@/services/reclamationService';
import type { Reclamation } from '@/types';

interface Props {
  reclamation: Reclamation;
  onClose: () => void;
  onSuccess: (r: Reclamation) => void;
}

export function RejectModal({ reclamation, onClose, onSuccess }: Props) {
  const [commentaire, setCommentaire] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const submit = async () => {
    if (commentaire.trim().length < 5) {
      toast.error('Motif obligatoire (min. 5 caractères)');
      return;
    }
    setSubmitting(true);
    try {
      const updated = await reclamationService.reject(reclamation.id, commentaire.trim());
      toast.success('Résolution rejetée — réclamation remise en cours');
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
      title="Rejeter la résolution"
      subtitle="La réclamation repassera en cours"
      icon={<XCircle className="h-5 w-5 text-red-600" />}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button variant="destructive" onClick={submit} loading={submitting}>
            Rejeter
          </Button>
        </>
      }
    >
      <div>
        <label className="block text-sm font-medium text-slate-700 mb-1.5">
          Motif du rejet *
        </label>
        <textarea
          rows={4}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Ex : Preuve insuffisante, intervention incomplète…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>
    </Modal>
  );
}