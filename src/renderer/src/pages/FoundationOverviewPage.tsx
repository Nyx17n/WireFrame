import * as React from 'react'
import { AlertTriangle, CheckCircle2, RefreshCw, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { ThemePlaygroundCard } from '@/components/foundation/ThemePlaygroundCard'
import { WindowAudioCard } from '@/components/foundation/WindowAudioCard'
import { useAppStore } from '@/stores/useAppStore'

export function FoundationOverviewPage(): React.JSX.Element {
  const isLoading = useAppStore((s) => s.isLoading)
  const errorMessage = useAppStore((s) => s.errorMessage)
  const windowState = useAppStore((s) => s.windowState)
  const initialize = useAppStore((s) => s.initialize)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-5xl space-y-4 p-4">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    )
  }

  if (errorMessage) {
    return (
      <div className="mx-auto flex max-w-lg flex-col items-center justify-center gap-3 p-8 text-center">
        <AlertTriangle className="h-8 w-8 text-destructive" />
        <h2 className="text-sm font-semibold">Erreur de communication IPC</h2>
        <p className="text-xs text-muted-foreground">{errorMessage}</p>
        <Button onClick={() => void initialize()}>
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Réessayer</span>
        </Button>
      </div>
    )
  }

  return (
    <main className="mx-auto max-w-5xl space-y-4 p-4">
      <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-card to-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge variant="success">
                <CheckCircle2 className="h-3 w-3" />
                <span>Jalon 1 Opérationnel</span>
              </Badge>
              <Badge variant="outline">
                <Shield className="h-3 w-3 text-primary" />
                <span>Zéro serveur HTTP · Zod · TLS Strict</span>
              </Badge>
            </div>
            <h1 className="text-base font-bold tracking-tight">
              Socle Technique WireFrame v2 (Electron + React 19 + TypeScript Strict)
            </h1>
            <p className="text-xs text-muted-foreground">
              Teste ci-dessous en temps réel les thèmes, le Mode Compact 460×660 (Alt+M),
              l’épinglage en jeu (Alt+P), le zoom natif et les sons d’alerte.
            </p>
          </div>
        </CardContent>
      </Card>

      <div
        className={
          windowState.isCompactMode
            ? 'grid grid-cols-1 gap-3'
            : 'grid grid-cols-1 gap-4 lg:grid-cols-2'
        }
      >
        <ThemePlaygroundCard />
        <WindowAudioCard />
      </div>
    </main>
  )
}

