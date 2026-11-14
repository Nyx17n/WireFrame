import * as React from 'react'
import { ChevronDown, ExternalLink, Globe, KeyRound, RefreshCw, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { ipcClient } from '@/services/ipc-client'

const WFM_EXTERNAL_SIGNIN_URL = 'https://warframe.market/fr/auth/signin'

interface WfmWebSignInPanelProps {
  readonly webPending: boolean
  readonly manualSubmitting: boolean
  readonly onLaunchWebLogin: () => Promise<void>
  readonly onSubmitManualToken: (jwtToken: string) => Promise<void>
}

export function WfmWebSignInPanel({
  webPending,
  manualSubmitting,
  onLaunchWebLogin,
  onSubmitManualToken
}: WfmWebSignInPanelProps): React.JSX.Element {
  const [showExternalFallback, setShowExternalFallback] = React.useState(false)
  const [jwtToken, setJwtToken] = React.useState('')

  const handleOpenOsBrowser = async (): Promise<void> => {
    await ipcClient.window.openExternalUrl(WFM_EXTERNAL_SIGNIN_URL)
  }

  const handleManualSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    if (!jwtToken.trim()) return
    await onSubmitManualToken(jwtToken)
    setJwtToken('')
  }

  const busy = webPending || manualSubmitting

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-primary/35 bg-primary/10 p-3.5 space-y-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span>Connexion Web Automatique (Steam, Discord, Google, Console, E-mail)</span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              Ouvre la page officielle <span className="font-mono text-foreground">warframe.market</span>{' '}
              dans une fenêtre sécurisée isolée. Dès que vous êtes connecté, TennoFrame récupère votre
              profil, chiffre la session et referme la fenêtre tout seul.
            </p>
          </div>
        </div>

        <Button
          type="button"
          className="w-full gap-2"
          onClick={() => void onLaunchWebLogin()}
          disabled={manualSubmitting}
        >
          {webPending ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Globe className="h-4 w-4" />
          )}
          <span>
            {webPending
              ? 'Fenêtre ouverte — connectez-vous sur Warframe Market…'
              : 'Ouvrir la page de connexion Warframe Market'}
          </span>
        </Button>

        {webPending && (
          <p className="text-center text-[11px] text-primary">
            Astuce : si la fenêtre est passée en arrière-plan, cliquez à nouveau sur le bouton ci-dessus
            pour la ramener au premier plan, ou fermez-la pour annuler.
          </p>
        )}
      </div>

      <div className="rounded-md border border-border/80 bg-secondary/25">
        <button
          type="button"
          onClick={() => setShowExternalFallback((v) => !v)}
          className="flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <span className="flex items-center gap-1.5">
            <ExternalLink className="h-3.5 w-3.5 text-primary" />
            <span>Préférer mon navigateur principal Windows (Chrome / Edge / Firefox…)</span>
          </span>
          <ChevronDown
            className={cn(
              'h-3.5 w-3.5 transition-transform',
              showExternalFallback && 'rotate-180'
            )}
          />
        </button>

        {showExternalFallback && (
          <form
            onSubmit={(e) => void handleManualSubmit(e)}
            className="space-y-2.5 border-t border-border/60 px-3 py-2.5"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-[11px] text-muted-foreground">
                Les navigateurs externes isolent leurs cookies de Windows : ouvrez la page ci-dessous puis
                collez une seule fois votre jeton <code className="font-mono text-foreground">JWT</code>.
              </p>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="h-7 gap-1.5 text-xs"
                onClick={() => void handleOpenOsBrowser()}
              >
                <ExternalLink className="h-3 w-3" />
                <span>Ouvrir warframe.market dans mon navigateur</span>
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Input
                type="password"
                required
                placeholder="Collez la valeur du cookie JWT (F12 → Application → Cookies → JWT)…"
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                disabled={busy}
                className="h-8 font-mono text-xs"
              />
              <Button
                type="submit"
                size="sm"
                variant="secondary"
                disabled={busy || !jwtToken.trim()}
                className="h-8 shrink-0 gap-1.5 text-xs"
              >
                {manualSubmitting ? (
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <KeyRound className="h-3.5 w-3.5" />
                )}
                <span>Valider JWT</span>
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
