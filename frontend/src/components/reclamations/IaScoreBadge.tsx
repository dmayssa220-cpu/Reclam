import { Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Props {
  score: number | null;
  compact?: boolean;
}

export function IaScoreBadge({ score, compact }: Props) {
  if (score == null) return null;

  const pct = Math.round(score * 100);

  const config =
    pct >= 75 ? { label: 'Critique', color: 'bg-red-50 text-red-700 border-red-200', bar: 'bg-red-500' } :
    pct >= 45 ? { label: 'Moyen',    color: 'bg-amber-50 text-amber-700 border-amber-200', bar: 'bg-amber-500' } :
                { label: 'Faible',   color: 'bg-emerald-50 text-emerald-700 border-emerald-200', bar: 'bg-emerald-500' };

  if (compact) {
    return (
      <span className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-medium', config.color)}>
        <Sparkles className="h-2.5 w-2.5" />
        IA {pct}%
      </span>
    );
  }

  return (
    <div className={cn('rounded-lg border p-3', config.color)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5" />
          <span className="text-xs font-semibold">Analyse IA</span>
        </div>
        <span className="text-sm font-bold">{pct}%</span>
      </div>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/60">
        <div className={cn('h-full rounded-full transition-all', config.bar)} style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-1 text-[10px] opacity-80">Score de criticité estimé par IA</p>
    </div>
  );
}