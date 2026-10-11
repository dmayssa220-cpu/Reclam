import type { HTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import type { Gravite, Statut } from '@/types';

type BadgeVariant = 'default' | 'outline' | 'success' | 'warning' | 'destructive' | 'info';

export function Badge({ className, variant = 'default', ...props }: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    outline: 'bg-transparent text-slate-700 border-slate-300',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border-amber-200',
    destructive: 'bg-red-50 text-red-700 border-red-200',
    info: 'bg-sky-50 text-sky-700 border-sky-200',
  };
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium',
        variants[variant],
        className
      )}
      {...props}
    />
  );
}

export function GraviteBadge({ gravite }: { gravite: Gravite }) {
  const map: Record<Gravite, { variant: BadgeVariant; label: string }> = {
    faible:   { variant: 'success',     label: 'Faible' },
    moyenne:  { variant: 'warning',     label: 'Moyenne' },
    critique: { variant: 'destructive', label: 'Critique' },
  };
  const cfg = map[gravite];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}

export function StatutBadge({ statut }: { statut: Statut }) {
  const map: Record<Statut, { variant: BadgeVariant; label: string }> = {
    NOUVEAU:   { variant: 'info',        label: 'Nouveau' },
    QUALIFIE:  { variant: 'info',        label: 'Qualifié' },
    ASSIGNE:   { variant: 'warning',     label: 'Assigné' },
    EN_COURS:  { variant: 'warning',     label: 'En cours' },
    RESOLU:    { variant: 'success',     label: 'Résolu' },
    CLOTURE:   { variant: 'success',     label: 'Clôturé' },
    REJETE:    { variant: 'destructive', label: 'Rejeté' },
    DOUBLON:   { variant: 'default',     label: 'Doublon' },
  };
  const cfg = map[statut];
  return <Badge variant={cfg.variant}>{cfg.label}</Badge>;
}