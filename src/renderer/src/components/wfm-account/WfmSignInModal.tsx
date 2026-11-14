import * as React from 'react'
import { AlertTriangle, Eye, EyeOff, KeyRound, Lock, RefreshCw, ShieldCheck } from 'lucide-react'
import type { WfmPresenceStatus } from '@shared/schemas/wfm-account.schema'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { useWfmAccountStore } from '@/stores/useWfmAccountStore'

export function WfmSignInModal(): React.JSX.Element {
  const open = useWfmAccountStore((s) => s.signInModalOpen)
  const closeSignInModal = useWfmAccountStore((s) => s.closeSignInModal)
  const signInCredentials = useWfmAccountStore((s) => s.signInCredentials)
  const signInToken = useWfmAccountStore((s) => s.signInToken)

  const [authTab, setAuthTab] = React.useState<'credentials' | 'token'>('credentials')
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [showPwd, setShowPwd] = React.useState(false)
  const [jwtToken, setJwtToken] = React.useState('')
  const [initialStatus, setInitialStatus] = React.useState<WfmPresenceStatus>('ingame')
  const [submitting, setSubmitting] = React.useState(false)
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!open) {
      setPassword('')
      setJwtToken('')
      setErrorMsg(null)
      setSubmitting(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setErrorMsg(null)
    setSubmitting(true)
    try {
      if (authTab === 'credentials') {
        await signInCredentials({ email, password, initialStatus })
      } else {
        await signInToken({ jwtToken, initialStatus })
      }
      setPassword('')
      setJwtToken('')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Échec de la connexion à Warframe Market.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(next) => !next && closeSignInModal()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <KeyRound className="h-4 w-4 text-primary" />
            <span>Connexion Optionnelle à Warframe Market</span>
          </DialogTitle>
          <DialogDescription>
            Connectez votre compte pour consulter tout votre profil, piloter votre statut en direct et
            mettre vos items en vente. Le reste de TennoFrame fonctionne à 100 % sans compte.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-1.5 rounded-md border border-border bg-secondary/40 p-1">
          <button
            type="button"
            onClick={() => {
              setAuthTab('credentials')
              setErrorMsg(null)
            }}
            className={cn(
              'rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
              authTab === 'credentials'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            1. E-mail & Mot de passe WFM
          </button>
          <button
            type="button"
            onClick={() => {
              setAuthTab('token')
              setErrorMsg(null)
            }}
            className={cn(
              'rounded px-2.5 py-1.5 text-xs font-medium transition-colors',
              authTab === 'token'
                ? 'bg-primary text-primary-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            2. Steam / Console / Discord (Jeton)
          </button>
        </div>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-3.5">
          {authTab === 'credentials' ? (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="wfm-email">
                  Adresse e-mail Warframe Market
                </label>
                <Input
                  id="wfm-email"
                  type="email"
                  autoComplete="username"
                  required
                  placeholder="tenno@exemple.fr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground" htmlFor="wfm-password">
                  Mot de passe (transmis une seule fois en TLS 1.3, jamais stocké)
                </label>
                <div className="relative">
                  <Input
                    id="wfm-password"
                    type={showPwd ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    placeholder="••••••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pr-9"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    title={showPwd ? 'Masquer' : 'Afficher'}
                  >
                    {showPwd ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground" htmlFor="wfm-jwt">
                Jeton de session <code className="font-mono text-primary">JWT</code> (pour comptes liés
                via Steam / PSN / Xbox / Discord)
              </label>
              <Input
                id="wfm-jwt"
                type="password"
                required
                placeholder="Collez la valeur du cookie JWT de warframe.market…"
                value={jwtToken}
                onChange={(e) => setJwtToken(e.target.value)}
                className="font-mono text-xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Sur <span className="font-mono">warframe.market</span> connecté : ouvrez{' '}
                <kbd className="rounded border px-1 font-mono text-[10px]">F12</kbd> →{' '}
                <span className="font-medium">Application / Stockage</span> →{' '}
                <span className="font-medium">Cookies</span> → copiez la valeur de{' '}
                <code className="font-mono text-foreground">JWT</code>.
              </p>
            </div>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-border/70 bg-background/60 px-3 py-2">
            <span className="text-xs text-muted-foreground">Statut initial à la connexion :</span>
            <div className="flex items-center gap-1">
              {(
                [
                  ['ingame', '🟢 En jeu'],
                  ['online', '🟣 En ligne'],
                  ['invisible', '⚫ Invisible']
                ] as const
              ).map(([st, label]) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setInitialStatus(st)}
                  className={cn(
                    'rounded border px-2 py-1 text-[11px] font-medium transition-colors',
                    initialStatus === st
                      ? 'border-primary bg-primary/15 text-foreground'
                      : 'border-border bg-card text-muted-foreground hover:text-foreground'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {errorMsg && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/50 bg-destructive/10 p-2.5 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="rounded-md border border-emerald-500/30 bg-emerald-500/10 p-2.5 text-[11px] text-muted-foreground">
            <div className="mb-1 flex items-center gap-1.5 font-semibold text-emerald-400">
              <ShieldCheck className="h-3.5 w-3.5" />
              <span>Garanties de sécurité TennoFrame (« Security by Design »)</span>
            </div>
            <p>
              Votre mot de passe n’est jamais conservé. Le jeton de session est chiffré sur votre PC via{' '}
              <span className="font-medium text-foreground">Windows DPAPI (Electron safeStorage)</span>,
              isolé dans le processus principal et exclu des exports JSON.
            </p>
          </div>

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button type="button" variant="outline" onClick={closeSignInModal} disabled={submitting}>
              Continuer sans compte
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Lock className="h-3.5 w-3.5" />
              )}
              <span>{submitting ? 'Vérification…' : 'Se connecter'}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
