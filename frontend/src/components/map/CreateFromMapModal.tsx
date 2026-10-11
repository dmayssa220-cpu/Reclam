import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { X, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { reclamationService } from '@/services/reclamationService';
import type { Gravite, Reclamation } from '@/types';

const schema = z.object({
  titre: z.string().min(3, 'Titre requis (min. 3 caractères)').max(255),
  description: z.string().min(10, 'Description trop courte (min. 10 caractères)'),
  adresse: z.string().max(255).optional(),
  zone: z.string().max(100).optional(),
  gravite: z.enum(['faible', 'moyenne', 'critique']),
});

type FormData = z.infer<typeof schema>;

interface Props {
  latitude: number;
  longitude: number;
  onClose: () => void;
  onCreated: (r: Reclamation) => void;
  zones?: string[];
}

export function CreateFromMapModal({ latitude, longitude, onClose, onCreated, zones = [] }: Props) {
  const [submitting, setSubmitting] = useState(false);
  const { register, handleSubmit, formState: { errors }, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { gravite: 'moyenne' },
  });

  const gravite = watch('gravite');

  const onSubmit = async (data: FormData) => {
    setSubmitting(true);
    try {
      const created = await reclamationService.create({
        ...data,
        latitude,
        longitude,
      });
      toast.success(`Réclamation ${created.reference} créée`);
      onCreated(created);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Erreur lors de la création');
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
    <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl overflow-hidden">
        {/* En-tête */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-slate-900">Nouvelle réclamation</h3>
              <p className="text-xs text-slate-500">Signalement depuis la carte</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Coordonnées */}
        <div className="bg-slate-50 border-b border-slate-100 px-5 py-3">
          <div className="flex items-center gap-2 text-xs text-slate-600">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            <span>
              Coordonnées :{' '}
              <span className="font-mono font-medium text-slate-800">
                {latitude.toFixed(5)}, {longitude.toFixed(5)}
              </span>
            </span>
          </div>
        </div>

        {/* Formulaire */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-5 space-y-4">
          <Input
            label="Titre"
            placeholder="Ex : Fuite sur canalisation principale"
            error={errors.titre?.message}
            {...register('titre')}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Description</label>
            <textarea
              rows={3}
              placeholder="Décrivez la fuite (ampleur, aspect, durée)…"
              className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 resize-none"
              {...register('description')}
            />
            {errors.description && (
              <p className="text-xs text-destructive">{errors.description.message}</p>
            )}
          </div>

          <Input
            label="Adresse (optionnel)"
            placeholder="Ex : 12 Avenue Habib Bourguiba"
            {...register('adresse')}
          />

          <div className="space-y-1.5">
            <label className="block text-sm font-medium text-slate-700">Zone (optionnel)</label>
            <select
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              {...register('zone')}
            >
              <option value="">Sélectionner une zone</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </div>

          {/* Gravité */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">Gravité</label>
            <div className="grid grid-cols-3 gap-2">
              {gravites.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => setValue('gravite', g.value)}
                  className={`flex items-center justify-center gap-2 rounded-lg border px-3 py-2.5 text-sm font-medium transition-all ${
                    gravite === g.value
                      ? `border-transparent ring-2 ${g.ring} bg-slate-50`
                      : 'border-slate-200 text-slate-600 hover:border-slate-300'
                  }`}
                >
                  <span className={`h-2.5 w-2.5 rounded-full ${g.color}`} />
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-100 p-3">
            <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800">
              L'IA analysera automatiquement la gravité et détectera les doublons dès l'étape 9.
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Annuler
            </Button>
            <Button type="submit" loading={submitting}>
              Créer la réclamation
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}