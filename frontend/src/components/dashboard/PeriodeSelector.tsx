import { Calendar, Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface Props {
  periode: number;
  onChange: (periode: number) => void;
  onExport: () => void;
  exporting?: boolean;
}

const OPTIONS = [
  { value: 7,   label: '7 jours' },
  { value: 30,  label: '30 jours' },
  { value: 90,  label: '90 jours' },
  { value: 365, label: '1 an' },
];

export function PeriodeSelector({ periode, onChange, onExport, exporting }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-1">
        <Calendar className="h-4 w-4 text-slate-400 ml-2" />
        {OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'rounded-md px-3 py-1.5 text-xs font-medium transition-all',
              periode === opt.value
                ? 'bg-primary text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
            )}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <Button variant="outline" size="sm" onClick={onExport} disabled={exporting}>
        {exporting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Download className="h-4 w-4" />
        )}
        Exporter CSV
      </Button>
    </div>
  );
}