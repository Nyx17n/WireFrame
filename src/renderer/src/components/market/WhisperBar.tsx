import * as React from 'react'
import { Check, Copy, Languages, MessageSquare, User, X } from 'lucide-react'
import { buildWhisperCommand } from '@shared/schemas/market.schema'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { useMarketStore } from '@/stores/useMarketStore'
import { notify } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'

export function WhisperBar(): React.JSX.Element | null {
  const activeWhisper = useMarketStore((s) => s.activeWhisper)
  const whisperCopiedAt = useMarketStore((s) => s.whisperCopiedAt)
  const dismissWhisper = useMarketStore((s) => s.dismissWhisper)
  const whisperLanguage = useAppStore((s) => s.settings.market.whisperLanguage)
  const updateSettings = useAppStore((s) => s.updateSettings)
  const openTab = useTabsStore((s) => s.openTab)

  const [justCopied, setJustCopied] = React.useState(true)

  React.useEffect(() => {
    if (!whisperCopiedAt) return
    setJustCopied(true)
    const timer = window.setTimeout(() => setJustCopied(false), 2500)
    return () => window.clearTimeout(timer)
  }, [whisperCopiedAt])

  if (!activeWhisper) return null

  const commandText = buildWhisperCommand(activeWhisper, whisperLanguage)

  const handleCopyAgain = async (): Promise<void> => {
    await ipcClient.clipboard.writeText(commandText)
    setJustCopied(true)
    notify({ kind: 'info', title: 'Commande /w copiée', message: 'Colle en jeu avec Ctrl+V' })
  }

  const handleToggleLanguage = async (): Promise<void> => {
    const nextLang = whisperLanguage === 'en' ? 'fr' : 'en'
    await updateSettings({ market: { whisperLanguage: nextLang } })
    const nextCmd = buildWhisperCommand(activeWhisper, nextLang)
    await ipcClient.clipboard.writeText(nextCmd)
    setJustCopied(true)
    notify({
      kind: 'info',
      title: `Commande /w copiée (${nextLang.toUpperCase()})`,
      message: 'Colle en jeu avec Ctrl+V'
    })
  }

  return (
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t border-primary/40 bg-primary/10 px-3 py-1.5 text-xs">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Badge variant="success" className="shrink-0">
          {justCopied ? <Check className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
          <span>{justCopied ? 'Copié ! Colle en jeu (Ctrl+V)' : 'Commande /w prête'}</span>
        </Badge>
        <code className="truncate font-mono text-[11px] text-foreground">{commandText}</code>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <Button size="sm" variant="secondary" onClick={() => void handleToggleLanguage()}>
          <Languages className="h-3.5 w-3.5 text-primary" />
          <span className="uppercase">{whisperLanguage}</span>
        </Button>

        <Button size="sm" variant="default" onClick={() => void handleCopyAgain()}>
          <Copy className="h-3.5 w-3.5" />
          <span>Copier</span>
        </Button>

        <Button
          size="sm"
          variant="outline"
          title="Voir le profil Warframe Market du joueur"
          onClick={() =>
            openTab(
              { kind: 'market-user', slug: activeWhisper.ingameName.toLowerCase() },
              { title: `Profil : ${activeWhisper.ingameName}` }
            )
          }
        >
          <User className="h-3.5 w-3.5" />
        </Button>

        <Button size="icon" variant="ghost" onClick={dismissWhisper} aria-label="Fermer bandeau /w">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}

