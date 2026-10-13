import { useState } from 'react';
import { toast } from 'sonner';
import { CheckCircle2, Clock, Upload, X } from 'lucide-react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { reclamationService, uploadService } from '@/services/reclamationService';
import { cn } from '@/lib/utils';
import type { Reclamation } from '@/types';

interface Props {
  reclamation: Reclamation;
  onClose: () => void;
  onSuccess: (r: Reclamation) => void;
}

export function ResolveModal({ reclamation, onClose, onSuccess }: Props) {
  const [commentaire, setCommentaire] = useState('');
  const [duree, setDuree] = useState<number>(30);
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image trop volumineuse (max 5 Mo)');
      return;
    }
    setUploading(true);
    try {
      const res = await uploadService.uploadFile(file, 'preuve');
      setPhotoUrl(res.url);
      toast.success('Photo uploadée');
    } catch {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const submit = async () => {
    if (commentaire.trim().length < 10) {
      toast.error('Le commentaire doit faire au moins 10 caractères');
      return;
    }
    if (duree < 1) {
      toast.error('Durée invalide');
      return;
    }

    setSubmitting(true);
    try {
      const updated = await reclamationService.resolve(reclamation.id, {
        preuve_commentaire: commentaire.trim(),
        duree_intervention: duree,
        preuve_photo_url: photoUrl || undefined,
      });
      toast.success('Réclamation marquée comme résolue');
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
      title="Marquer comme résolue"
      subtitle="Ajoutez une preuve d'intervention"
      icon={<CheckCircle2 className="h-5 w-5" />}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={submitting}>Annuler</Button>
          <Button
            onClick={submit}
            loading={submitting}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            Valider la résolution
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        {/* Durée */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-1.5">
            <Clock className="h-4 w-4 text-slate-500" />
            Durée d'intervention (minutes) *
          </label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              min={1}
              max={10000}
              value={duree}
              onChange={(e) => setDuree(parseInt(e.target.value) || 0)}
              className="w-32"
            />
            <span className="text-sm text-slate-500">
              {duree >= 60
                ? `≈ ${Math.floor(duree / 60)}h${duree % 60 ? ` ${duree % 60}min` : ''}`
                : `${duree} min`}
            </span>
          </div>
        </div>

        {/* Commentaire */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Commentaire de résolution *
          </label>
          <textarea
            rows={4}
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            placeholder="Décrivez l'intervention effectuée, les pièces remplacées, l'état final…"
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
          />
          <p className="mt-1 text-xs text-slate-500">
            {commentaire.length} / 5000 caractères
          </p>
        </div>

        {/* Photo de preuve */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1.5">
            Photo d'intervention (optionnelle)
          </label>

          {photoUrl ? (
            <div className="relative">
              <img
                src={photoUrl}
                alt="Preuve"
                className="w-full rounded-lg border border-slate-200 max-h-48 object-cover"
              />
              <button
                onClick={() => setPhotoUrl('')}
                className="absolute top-2 right-2 rounded-full bg-white/90 p-1.5 shadow-md hover:bg-white"
              >
                <X className="h-4 w-4 text-slate-600" />
              </button>
            </div>
          ) : (
            <label
              className={cn(
                'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 transition-colors',
                uploading
                  ? 'border-slate-200 bg-slate-50'
                  : 'border-slate-300 hover:border-primary hover:bg-primary/5'
              )}
            >
              <input
                type="file"
                accept="image/*"
                onChange={handleFile}
                disabled={uploading}
                className="hidden"
              />
              {uploading ? (
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              ) : (
                <>
                  <Upload className="h-6 w-6 text-slate-400" />
                  <p className="text-xs font-medium text-slate-600">
                    Cliquez pour uploader
                  </p>
                  <p className="text-[10px] text-slate-400">JPG, PNG, WEBP · max 5 Mo</p>
                </>
              )}
            </label>
          )}
        </div>

        <div className="rounded-lg bg-amber-50 border border-amber-100 p-3">
          <p className="text-xs text-amber-800">
            ⚠️ Après validation, la réclamation passera en statut <strong>A_VALIDER</strong> et
            devra être approuvée par un superviseur pour être clôturée.
          </p>
        </div>
      </div>
    </Modal>
  );
}