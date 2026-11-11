import * as React from 'react'
import { useAppStore } from '@/stores/useAppStore'

const SUFFIX_STEPS = ['Frame', 'Doc', 'Companion', 'Market', 'Index', 'Codex', ''] as const

const STEP_DELAYS_MS = [340, 290, 290, 290, 290, 320, 620] as const

export function StartupSplashOverlay(): React.JSX.Element | null {
  const splashRunId = useAppStore((s) => s.splashRunId)
  const isBootLoading = useAppStore((s) => s.isLoading)
  const startupEnabled = useAppStore((s) => s.settings.appearance.startupAnimationEnabled)
  const isCompactMode = useAppStore((s) => s.windowState.isCompactMode)

  const [visible, setVisible] = React.useState(true)
  const [fadingOut, setFadingOut] = React.useState(false)
  const [activeStep, setActiveStep] = React.useState(0)

  // Skip immediately if the user disabled startup animation (unless manually replayed via splashRunId > 1)
  React.useEffect(() => {
    if (!isBootLoading && !startupEnabled && splashRunId === 1) {
      setVisible(false)
    }
  }, [isBootLoading, startupEnabled, splashRunId])

  React.useEffect(() => {
    if (splashRunId === 1 && !startupEnabled && !isBootLoading) return

    setVisible(true)
    setFadingOut(false)
    setActiveStep(0)

    const timers: number[] = []
    let elapsed = 0

    for (let nextIdx = 1; nextIdx < SUFFIX_STEPS.length; nextIdx++) {
      elapsed += STEP_DELAYS_MS[nextIdx - 1] ?? 290
      timers.push(
        window.setTimeout(() => {
          setActiveStep(nextIdx)
        }, elapsed)
      )
    }

    elapsed += STEP_DELAYS_MS[SUFFIX_STEPS.length - 1] ?? 600
    timers.push(
      window.setTimeout(() => {
        setFadingOut(true)
      }, elapsed)
    )
    timers.push(
      window.setTimeout(() => {
        setVisible(false)
      }, elapsed + 380)
    )

    return () => {
      for (const id of timers) window.clearTimeout(id)
    }
  }, [splashRunId, startupEnabled])

  if (!visible) return null

  const isCenteredFinal = activeStep >= SUFFIX_STEPS.length - 1
  const progressPct = Math.round(((activeStep + 1) / SUFFIX_STEPS.length) * 100)

  const dismissNow = (): void => {
    setFadingOut(true)
    window.setTimeout(() => setVisible(false), 240)
  }

  return (
    <div
      onClick={dismissNow}
      role="status"
      aria-label="Animation de lancement WireFrame"
      title="Cliquer pour passer l'intro"
      className={`fixed inset-0 z-50 flex select-none flex-col items-center justify-center overflow-hidden bg-background transition-all duration-300 ${
        fadingOut ? 'pointer-events-none scale-[1.03] opacity-0' : 'opacity-100'
      }`}
    >
      {/* Proposition 3 — Concentric Lotus Ripples dynamically tinted by active theme */}
      <div className="pointer-events-none relative flex items-center justify-center">
        <div className="wf-lotus-ring-1 absolute h-44 w-44 rounded-full border border-primary/50" />
        <div className="wf-lotus-ring-2 absolute h-44 w-44 rounded-full border border-primary/35" />
        <div className="wf-lotus-ring-3 absolute h-44 w-44 rounded-full border border-dashed border-primary/25" />

        <div
          className={`absolute rounded-full bg-primary/15 blur-2xl transition-all duration-500 ${
            isCenteredFinal ? 'h-48 w-48 bg-primary/25' : 'h-32 w-32'
          }`}
        />

        <div className="relative z-10 flex flex-col items-center gap-5">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-full border border-primary/50 bg-card/90 shadow-lg transition-transform duration-500 ${
              isCenteredFinal ? 'scale-110 border-primary' : 'scale-100'
            }`}
          >
            <img src="./images/logo.png" alt="WireFrame" className="h-7 w-7 object-contain" />
          </div>

          {/* Kinetic Word Row: "Wire" stays anchored, suffixes slide Top -> Center -> Bottom, then "Wire" centers! */}
          <div className="flex items-center justify-center">
            <span
              className={`font-extrabold tracking-tight text-foreground transition-all duration-500 ${
                isCompactMode ? 'text-3xl' : 'text-4xl sm:text-5xl'
              }`}
              style={
                isCenteredFinal
                  ? { textShadow: '0 0 28px hsl(var(--primary) / 0.65)' }
                  : undefined
              }
            >
              Wire
            </span>

            <div
              className="relative overflow-hidden"
              style={{
                height: isCompactMode ? '2.75rem' : '3.75rem',
                width: isCenteredFinal ? '0rem' : isCompactMode ? '10.5rem' : '15.5rem',
                marginLeft: isCenteredFinal ? '0rem' : '0.65rem',
                opacity: isCenteredFinal ? 0 : 1,
                transition:
                  'width 540ms cubic-bezier(0.22, 1, 0.36, 1), margin-left 540ms cubic-bezier(0.22, 1, 0.36, 1), opacity 320ms ease',
                WebkitMaskImage:
                  'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)',
                maskImage:
                  'linear-gradient(to bottom, transparent 0%, black 18%, black 82%, transparent 100%)'
              }}
            >
              {SUFFIX_STEPS.map((word, idx) => {
                if (!word) return null
                const offsetState =
                  idx > activeStep
                    ? 'translateY(-115%)'
                    : idx === activeStep
                      ? 'translateY(0%)'
                      : 'translateY(115%)'
                const wordOpacity = idx === activeStep ? 1 : 0

                return (
                  <span
                    key={word}
                    style={{
                      transform: offsetState,
                      opacity: wordOpacity,
                      transition:
                        'transform 280ms cubic-bezier(0.22, 1, 0.36, 1), opacity 220ms ease'
                    }}
                    className={`absolute inset-0 flex items-center whitespace-nowrap font-extrabold tracking-tight text-primary ${
                      isCompactMode ? 'text-3xl' : 'text-4xl sm:text-5xl'
                    }`}
                  >
                    {word}
                  </span>
                )
              })}
            </div>
          </div>

          {/* Thin Proposition 3 Glowing Progress Line */}
          <div className="flex flex-col items-center gap-2 pt-2">
            <div className="h-1 w-48 overflow-hidden rounded-full bg-secondary/80 sm:w-56">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300 ease-out"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className="text-[11px] tracking-wide text-muted-foreground">
              {isCenteredFinal
                ? 'Réveillez-vous, Tenno.'
                : 'Synchronisation du Marché, Hub & Codex…'}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

