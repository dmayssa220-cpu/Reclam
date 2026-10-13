import { cn } from '@/lib/utils';
import type { Statut } from '@/types';

interface Props {
  statut: Statut;
  compact?: boolean;
}

const STEPS: { key: Statut; label: string }[] = [
  { key: 'NOUVEAU',   label: 'Créée' },
  { key: 'ASSIGNE',   label: 'Assignée' },
  { key: 'EN_COURS',  label: 'En cours' },
  { key: 'A_VALIDER', label: 'À valider' },
  { key: 'CLOTURE',   label: 'Clôturée' },
];

export function StatutProgress({ statut, compact }: Props) {
  // Cas spéciaux
  if (['REJETE', 'DOUBLON'].includes(statut)) {
    return (
      <div className="flex items-center gap-2 text-xs text-red-600">
        <span className="h-2 w-2 rounded-full bg-red-500" />
        {statut === 'REJETE' ? 'Rejetée' : 'Doublon'}
      </div>
    );
  }

  const currentIdx = STEPS.findIndex((s) => s.key === statut);
  const effectiveIdx = currentIdx === -1 ? 0 : currentIdx;

  if (compact) {
    const pct = ((effectiveIdx + 1) / STEPS.length) * 100;
    return (
      <div className="flex items-center gap-2">
        <div className="h-1.5 flex-1 rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full rounded-full bg-primary transition-all"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-medium text-slate-500">
          {effectiveIdx + 1}/{STEPS.length}
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {STEPS.map((step, idx) => {
        const done = idx <= effectiveIdx;
        const active = idx === effectiveIdx;

        return (
          <div key={step.key} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={cn(
                  'flex h-7 w-7 items-center justify-center rounded-full text-[10px] font-bold transition-all',
                  done
                    ? active
                      ? 'bg-primary text-white ring-4 ring-primary/20'
                      : 'bg-primary/80 text-white'
                    : 'bg-slate-200 text-slate-400'
                )}
              >
                {done && !active ? '✓' : idx + 1}
              </div>
              <span
                className={cn(
                  'mt-1 text-[9px] font-medium whitespace-nowrap',
                  active ? 'text-primary' : done ? 'text-slate-600' : 'text-slate-400'
                )}
              >
                {step.label}
              </span>
            </div>

            {idx < STEPS.length - 1 && (
              <div
                className={cn(
                  'h-0.5 w-8 mx-1 mb-4',
                  idx < effectiveIdx ? 'bg-primary' : 'bg-slate-200'
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}