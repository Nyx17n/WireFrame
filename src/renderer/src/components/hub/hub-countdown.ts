import * as React from 'react'

export function useNowTick(intervalMs = 1000): number {
  const [now, setNow] = React.useState(() => Date.now())

  React.useEffect(() => {
    const timer = window.setInterval(() => {
      setNow(Date.now())
    }, intervalMs)
    return () => window.clearInterval(timer)
  }, [intervalMs])

  return now
}

export function formatCountdown(targetIso: string, nowMs: number): string {
  const target = Date.parse(targetIso)
  if (!Number.isFinite(target)) return '—'
  const diffSec = Math.floor((target - nowMs) / 1000)
  if (diffSec <= 0) return 'Rotation...'

  const days = Math.floor(diffSec / 86_400)
  const hours = Math.floor((diffSec % 86_400) / 3600)
  const minutes = Math.floor((diffSec % 3600) / 60)
  const seconds = diffSec % 60

  if (days > 0) {
    return `${days}j ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`
  }
  return `${minutes}m ${String(seconds).padStart(2, '0')}s`
}

export function computeCycleProgress(activationIso: string, expiryIso: string, nowMs: number): number {
  const start = Date.parse(activationIso)
  const end = Date.parse(expiryIso)
  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) return 50
  const ratio = ((nowMs - start) / (end - start)) * 100
  return Math.max(2, Math.min(100, Math.round(ratio)))
}

