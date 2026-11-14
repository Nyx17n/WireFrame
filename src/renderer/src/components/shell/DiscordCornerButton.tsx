import * as React from 'react'
import { Check } from 'lucide-react'
import { DISCORD_INVITE_URL } from '@shared/constants'
import { ipcClient } from '@/services/ipc-client'
import { useAppStore } from '@/stores/useAppStore'
import { notify } from '@/stores/useNotificationStore'

function DiscordLogoIcon({ className }: { className?: string }): React.JSX.Element {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028ZM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418Zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418Z" />
    </svg>
  )
}

export function DiscordCornerButton(): React.JSX.Element | null {
  const isCompactMode = useAppStore((s) => s.windowState.isCompactMode)
  const [copiedFallback, setCopiedFallback] = React.useState(false)

  React.useEffect(() => {
    if (!copiedFallback) return
    const timer = window.setTimeout(() => setCopiedFallback(false), 2600)
    return () => window.clearTimeout(timer)
  }, [copiedFallback])

  if (isCompactMode) {
    return null
  }

  const handleOpenDiscord = async (): Promise<void> => {
    const opened = await ipcClient.window.openExternalUrl(DISCORD_INVITE_URL)
    if (!opened) {
      await ipcClient.clipboard.writeText(DISCORD_INVITE_URL)
      setCopiedFallback(true)
      notify({
        kind: 'info',
        title: 'Lien Discord copié',
        message: DISCORD_INVITE_URL
      })
    }
  }

  return (
    <button
      type="button"
      onClick={() => void handleOpenDiscord()}
      title={copiedFallback ? 'Lien Discord copié !' : 'Rejoindre le serveur Discord TennoFrame'}
      aria-label="Rejoindre le serveur Discord officiel TennoFrame"
      className="wf-interactive-btn group absolute bottom-3.5 right-5 z-30 inline-flex h-10 w-10 select-none items-center justify-center rounded-full border border-[#5865F2]/45 bg-card/90 shadow-lg backdrop-blur-md transition-all duration-200 hover:-translate-y-0.5 hover:border-[#5865F2] hover:bg-[#5865F2] hover:shadow-[0_6px_20px_rgba(88,101,242,0.4)] active:translate-y-0"
    >
      {copiedFallback ? (
        <Check className="h-5 w-5 text-emerald-400 group-hover:text-white" />
      ) : (
        <DiscordLogoIcon className="h-5 w-5 text-[#5865F2] transition-colors group-hover:text-white" />
      )}
    </button>
  )
}
