import * as React from 'react'
import { CheckCircle2, Sparkles } from 'lucide-react'
import { CHANGELOG_RELEASES } from '@shared/data/changelog'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog'
import { useAppStore } from '@/stores/useAppStore'

export function ChangelogModal(): React.JSX.Element {
  const isOpen = useAppStore((s) => s.isChangelogOpen)
  const setOpen = useAppStore((s) => s.setChangelogOpen)

  return (
    <Dialog open={isOpen} onOpenChange={setOpen}>
      <DialogContent className="max-h-[82vh] max-w-2xl overflow-y-auto p-5">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base font-bold">
            <Sparkles className="h-4 w-4 text-primary" />
            <span>Notes de Patch & Historique WireFrame</span>
          </DialogTitle>
          <DialogDescription className="text-xs">
            Journal des nouveautés et améliorations de sécurité de ton compagnon Warframe.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {CHANGELOG_RELEASES.map((rel) => (
            <div
              key={rel.version}
              className="space-y-2.5 rounded-lg border border-border bg-card/60 p-4 text-xs"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="font-mono">
                    v{rel.version}
                  </Badge>
                  <span className="font-bold text-foreground">{rel.titleFr}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{rel.badgeFr}</Badge>
                  <span className="text-[11px] text-muted-foreground">{rel.date}</span>
                </div>
              </div>

              <ul className="space-y-1.5 pt-1 text-muted-foreground">
                {rel.highlightsFr.map((line, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-400" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}

