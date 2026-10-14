import { useState } from 'react';
import { Sparkles, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import type { Reclamation } from '@/types';

interface Props {
  reclamation: Reclamation;
  onUpdate: (r: Reclamation) => void;
}

export function IaSummaryCard({ reclamation, onUpdate }: Props) {
  const [loading, setLoading] = useState(false);

  const regenerate = async () => {
    setLoading(true);
    try {
      const { data } = await api.post(`/ia/analyze/${reclamation.id}`);
      onUpdate(data.reclamation);
      toast.success('Analyse IA régénérée');
    } catch {
      toast.error('Service IA indisponible');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-violet-100 bg-gradient-to-br from-violet-50/40 to-white">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-100">
              <Sparkles className="h-4 w-4 text-violet-600" />
            </div>
            <CardTitle className="text-violet-900">Analyse IA</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={regenerate}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {reclamation.ia_resume ? (
          <div className="rounded-lg bg-white/70 border border-violet-100 p-3">
            <p className="text-sm leading-relaxed text-slate-700">
              {reclamation.ia_resume}
            </p>
          </div>
        ) : (
          <p className="text-sm text-slate-500 italic text-center py-3">
            Aucun résumé IA disponible. Cliquez sur ⟳ pour générer.
          </p>
        )}
      </CardContent>
    </Card>
  );
}