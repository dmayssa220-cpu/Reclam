import { useState } from 'react';
import { ChevronDown, ChevronUp, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

export function MapLegend() {
  const [open, setOpen] = useState(true);

  return (
    <div className="absolute bottom-4 right-4 z-[1000] w-56 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm shadow-lg">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between px-3 py-2.5 border-b border-slate-100"
      >
        <div className="flex items-center gap-2">
          <Info className="h-3.5 w-3.5 text-slate-500" />
          <span className="text-xs font-semibold text-slate-700">Légende</span>
        </div>
        {open ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400" />
        )}
      </button>

      {open && (
        <div className="p-3 space-y-2.5">
          <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400">
            Gravité
          </p>
          {[
            { color: 'bg-red-500', label: 'Critique' },
            { color: 'bg-amber-500', label: 'Moyenne' },
            { color: 'bg-emerald-500', label: 'Faible' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <span className={cn('h-3 w-3 rounded-full border-2 border-white shadow-sm', item.color)} />
              <span className="text-xs text-slate-600">{item.label}</span>
            </div>
          ))}

          <div className="pt-2 mt-2 border-t border-slate-100">
            <p className="text-[10px] font-medium uppercase tracking-wider text-slate-400 mb-2">
              Astuce
            </p>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Cliquez sur la carte pour créer une nouvelle réclamation à cet emplacement.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}