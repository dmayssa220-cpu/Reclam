import { useState } from 'react';
import { toast } from 'sonner';
import { MessageSquare, Upload, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { reclamationService, uploadService } from '@/services/reclamationService';
import type { Reclamation } from '@/types';

interface Props {
  reclamation: Reclamation;
  onClose: () => void;
  onSuccess: (r: Reclamation) => void;
}

export function CommentModal({ reclamation, onClose, onSuccess }: Props) {
  const [commentaire, setCommentaire] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file, 'commentaire');
      setPhotoUrl(res.url);
      toast.success('Photo uploadée');
    } catch {
      toast.error('Erreur upload');
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (commentaire.trim().length < 2) {
      toast.error('Commentaire trop court');
      return;
    }
    setSubmitting(true);
    try {
      await reclamationService.addComment(reclamation.id, commentaire.trim(), photoUrl || undefined);
      const fresh = await reclamationService.get(reclamation.id);
      toast.success('Commentaire ajouté');
      onSuccess(fresh);
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
      title="Ajouter un commentaire"
      subtitle="Sans changement de statut"
      icon={<MessageSquare className="h-5 w-5" />}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button onClick={submit} loading={submitting}>Publier</Button>
        </>
      }
    >
      <div className="space-y-4">
        <textarea
          rows={4}
          value={commentaire}
          onChange={(e) => setCommentaire(e.target.value)}
          placeholder="Votre commentaire terrain…"
          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm resize-none focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />

        {photoUrl ? (
          <div className="relative">
            <img src={photoUrl} alt="Aperçu" className="w-full rounded-lg max-h-40 object-cover" />
            <button
              onClick={() => setPhotoUrl('')}
              className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow hover:bg-white"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <label className="flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-dashed border-slate-300 p-4 text-xs font-medium text-slate-600 hover:border-primary hover:bg-primary/5">
            <input type="file" accept="image/*" onChange={handleFile} className="hidden" disabled={uploading} />
            {uploading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            ) : (
              <>
                <Upload className="h-4 w-4" />
                Joindre une photo (optionnel)
              </>
            )}
          </label>
        )}
      </div>
    </Modal>
  );
}