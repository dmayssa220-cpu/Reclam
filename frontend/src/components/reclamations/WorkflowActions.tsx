import { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import {
  UserCheck, Wrench, Play, CheckCircle2, XCircle, RotateCcw,
  MessageSquare, ShieldCheck,
} from 'lucide-react';
import { AssignSupervisorModal } from './AssignSupervisorModal';
import { AssignTechnicianModal } from './AssignTechnicianModal';
import { ResolveModal } from './ResolveModal';
import { ValidateModal } from './ValidateModal';
import { RejectModal } from './RejectModal';
import { ReopenModal } from './ReopenModal';
import { CommentModal } from './CommentModal';
import type { Reclamation } from '@/types';

interface Props {
  reclamation: Reclamation;
  onUpdate: (r: Reclamation) => void;
}

export function WorkflowActions({ reclamation: r, onUpdate }: Props) {
  const { user, hasRole } = useAuthStore();
  const [modal, setModal] = useState<
    'assign-sup' | 'assign-tech' | 'resolve' | 'validate' | 'reject' | 'reopen' | 'comment' | null
  >(null);

  const isAdmin       = hasRole('ADMIN');
  const isSuperviseur = hasRole('SUPERVISEUR');
  const isTechnicien  = hasRole('TECHNICIEN');
  const isCreateur    = user?.id === r.user_id;

  // ---------- Règles d'affichage ----------

  // ADMIN peut assigner un superviseur si pas encore assigné
  const canAssignSupervisor = isAdmin && !r.superviseur_id
    && ['NOUVEAU', 'QUALIFIE'].includes(r.statut);

  // SUPERVISEUR peut assigner un technicien
  const canAssignTechnician = (isSuperviseur || isAdmin) && !r.technicien_id
    && r.superviseur_id && r.statut === 'ASSIGNE';

  // TECHNICIEN démarre
  const canDemarrer = isTechnicien && r.technicien_id === user?.id
    && r.statut === 'ASSIGNE';

  // TECHNICIEN résout
  const canResolve = isTechnicien && r.technicien_id === user?.id
    && r.statut === 'EN_COURS';

  // SUPERVISEUR valide ou rejette
  const canValidate = (isSuperviseur || isAdmin) && r.statut === 'A_VALIDER';
  const canReject   = canValidate;

  // SUPERVISEUR rouvre
  const canReopen = (isSuperviseur || isAdmin)
    && ['RESOLU', 'CLOTURE', 'A_VALIDER'].includes(r.statut);

  // Commentaire : tout le monde sauf cas spéciaux
  const canComment = !['CLOTURE', 'REJETE', 'DOUBLON'].includes(r.statut)
    && (isAdmin || isSuperviseur || isTechnicien || isCreateur);

  const hasAnyAction =
    canAssignSupervisor || canAssignTechnician || canDemarrer ||
    canResolve || canValidate || canReject || canReopen || canComment;

  if (!hasAnyAction) return null;

  return (
    <>
      <div className="flex flex-wrap items-center gap-2">
        {canAssignSupervisor && (
          <Button size="sm" onClick={() => setModal('assign-sup')}>
            <UserCheck className="h-4 w-4" />
            Assigner superviseur
          </Button>
        )}

        {canAssignTechnician && (
          <Button size="sm" onClick={() => setModal('assign-tech')}>
            <Wrench className="h-4 w-4" />
            Assigner technicien
          </Button>
        )}

        {canDemarrer && (
          <Button
            size="sm"
            onClick={async () => {
              if (!confirm('Démarrer l\'intervention ?')) return;
              try {
                const { reclamationService } = await import('@/services/reclamationService');
                const updated = await reclamationService.demarrer(r.id);
                onUpdate(updated);
              } catch {
                alert('Erreur');
              }
            }}
          >
            <Play className="h-4 w-4" />
            Démarrer l'intervention
          </Button>
        )}

        {canResolve && (
          <Button size="sm" onClick={() => setModal('resolve')}>
            <CheckCircle2 className="h-4 w-4" />
            Marquer résolue
          </Button>
        )}

        {canValidate && (
          <Button
            size="sm"
            variant="default"
            onClick={() => setModal('validate')}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            <ShieldCheck className="h-4 w-4" />
            Valider et clôturer
          </Button>
        )}

        {canReject && (
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setModal('reject')}
          >
            <XCircle className="h-4 w-4" />
            Rejeter
          </Button>
        )}

        {canReopen && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModal('reopen')}
          >
            <RotateCcw className="h-4 w-4" />
            Rouvrir
          </Button>
        )}

        {canComment && (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setModal('comment')}
          >
            <MessageSquare className="h-4 w-4" />
            Commenter
          </Button>
        )}
      </div>

      {/* Modals */}
      {modal === 'assign-sup' && (
        <AssignSupervisorModal
          reclamation={r}
          onClose={() => setModal(null)}
          onSuccess={(updated) => { onUpdate(updated); setModal(null); }}
        />
      )}
      {modal === 'assign-tech' && (
        <AssignTechnicianModal
          reclamation={r}
          onClose={() => setModal(null)}
          onSuccess={(updated) => { onUpdate(updated); setModal(null); }}
        />
      )}
      {modal === 'resolve' && (
        <ResolveModal
          reclamation={r}
          onClose={() => setModal(null)}
          onSuccess={(updated) => { onUpdate(updated); setModal(null); }}
        />
      )}
      {modal === 'validate' && (
        <ValidateModal
          reclamation={r}
          onClose={() => setModal(null)}
          onSuccess={(updated) => { onUpdate(updated); setModal(null); }}
        />
      )}
      {modal === 'reject' && (
        <RejectModal
          reclamation={r}
          onClose={() => setModal(null)}
          onSuccess={(updated) => { onUpdate(updated); setModal(null); }}
        />
      )}
      {modal === 'reopen' && (
        <ReopenModal
          reclamation={r}
          onClose={() => setModal(null)}
          onSuccess={(updated) => { onUpdate(updated); setModal(null); }}
        />
      )}
      {modal === 'comment' && (
        <CommentModal
          reclamation={r}
          onClose={() => setModal(null)}
          onSuccess={(updated) => { onUpdate(updated); setModal(null); }}
        />
      )}
    </>
  );
}