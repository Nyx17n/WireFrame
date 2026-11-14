import * as React from 'react'
import { ChevronDown, LogIn, LogOut, PlusCircle, UserCheck, UserCircle2 } from 'lucide-react'
import type { WfmPresenceStatus } from '@shared/schemas/wfm-account.schema'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useTabsStore } from '@/stores/useTabsStore'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'

const STATUS_DOT: Record<WfmPresenceStatus, string> = {
  ingame: 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.75)]',
  online: 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.75)]',
  invisible: 'bg-muted-foreground/60'
}

const STATUS_LABEL: Record<WfmPresenceStatus, string> = {
  ingame: 'En jeu',
  online: 'En ligne',
  invisible: 'Invisible'
}

export function WfmHeaderAccountPill({ isCompact }: { isCompact: boolean }): React.JSX.Element {
  const session = useWfmAccountStore((s) => s.session)
  const openSignInModal = useWfmAccountStore((s) => s.openSignInModal)
  const openCreateOrderModal = useWfmAccountStore((s) => s.openCreateOrderModal)
  const setStatus = useWfmAccountStore((s) => s.setStatus)
  const signOut = useWfmAccountStore((s) => s.signOut)
  const navigateActive = useTabsStore((s) => s.navigateActive)

  if (!session.connected || !session.user) {
    return (
      <Button
        variant="outline"
        size={isCompact ? 'icon' : 'sm'}
        onClick={() => openSignInModal()}
        className={cn(!isCompact && 'h-7 gap-1.5 px-2.5 text-[11px]')}
        title="Connexion optionnelle à votre compte Warframe Market (afficher son profil & mettre en vente)"
      >
        <LogIn className="h-3.5 w-3.5 text-primary" />
        {!isCompact && <span>Connexion WFM</span>}
      </Button>
    )
  }

  const { user, status } = session

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          title={`Connecté à Warframe Market : ${user.ingameName} (${STATUS_LABEL[status]})`}
          className="inline-flex h-7 items-center gap-1.5 rounded-md border border-primary/40 bg-primary/10 px-2 text-[11px] font-medium text-foreground transition-colors hover:border-primary hover:bg-primary/15"
        >
          <span className={cn('h-2 w-2 shrink-0 rounded-full', STATUS_DOT[status])} />
          {!isCompact ? (
            <span className="max-w-[104px] truncate font-semibold">{user.ingameName}</span>
          ) : (
            <UserCheck className="h-3.5 w-3.5 text-primary" />
          )}
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex items-center justify-between gap-2">
          <span className="truncate font-semibold text-foreground">{user.ingameName}</span>
          <span className="font-mono text-[10px] text-amber-400">★ +{user.reputation}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuLabel className="py-0.5 text-[10px] uppercase tracking-wider">
          Statut en direct
        </DropdownMenuLabel>
        {(['ingame', 'online', 'invisible'] as const).map((st) => (
          <DropdownMenuItem
            key={st}
            onClick={() => void setStatus(st)}
            className={cn(status === st && 'bg-secondary/80 font-semibold')}
          >
            <span className={cn('h-2 w-2 rounded-full', STATUS_DOT[st])} />
            <span>{STATUS_LABEL[st]}</span>
            {status === st && <span className="ml-auto text-[10px] text-primary">Actif</span>}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => navigateActive({ kind: 'wfm-account' }, `Profil WFM : ${user.ingameName}`)}
        >
          <UserCircle2 className="h-3.5 w-3.5 text-primary" />
          <span>Mon Profil & Mes Annonces</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => openCreateOrderModal({ defaultType: 'sell' })}>
          <PlusCircle className="h-3.5 w-3.5 text-emerald-400" />
          <span>Mettre un item en vente</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void signOut()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Se déconnecter</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

