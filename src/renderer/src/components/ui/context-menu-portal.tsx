import * as React from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

export interface ContextMenuPosition {
  readonly x: number
  readonly y: number
}

const CLOSE_ALL_EVENT = 'wf:close-context-menus'
const VIEWPORT_MARGIN = 8

const ContextMenuCloseContext = React.createContext<() => void>(() => undefined)

export function ContextMenuPortal({
  position,
  onClose,
  className,
  children
}: {
  readonly position: ContextMenuPosition | null
  readonly onClose: () => void
  readonly className?: string
  readonly children: React.ReactNode
}): React.JSX.Element | null {
  const menuId = React.useId()
  const menuRef = React.useRef<HTMLDivElement | null>(null)
  const [clampedPos, setClampedPos] = React.useState<ContextMenuPosition | null>(position)

  React.useLayoutEffect(() => {
    if (!position) {
      setClampedPos(null)
      return
    }
    const el = menuRef.current
    if (!el) {
      setClampedPos(position)
      return
    }
    const rect = el.getBoundingClientRect()
    const maxX = Math.max(VIEWPORT_MARGIN, window.innerWidth - rect.width - VIEWPORT_MARGIN)
    const maxY = Math.max(VIEWPORT_MARGIN, window.innerHeight - rect.height - VIEWPORT_MARGIN)
    setClampedPos({
      x: Math.min(Math.max(VIEWPORT_MARGIN, position.x), maxX),
      y: Math.min(Math.max(VIEWPORT_MARGIN, position.y), maxY)
    })
  }, [position])

  React.useEffect(() => {
    if (!position) return

    window.dispatchEvent(new CustomEvent<string>(CLOSE_ALL_EVENT, { detail: menuId }))

    const handleOtherOpen = (event: Event): void => {
      const custom = event as CustomEvent<string>
      if (custom.detail !== menuId) onClose()
    }
    const handlePointerDown = (event: MouseEvent): void => {
      const target = event.target as Node | null
      if (menuRef.current && target && menuRef.current.contains(target)) return
      onClose()
    }
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') onClose()
    }
    const handleDismiss = (): void => {
      onClose()
    }

    window.addEventListener(CLOSE_ALL_EVENT, handleOtherOpen)
    window.addEventListener('mousedown', handlePointerDown, true)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('scroll', handleDismiss, true)
    window.addEventListener('resize', handleDismiss)
    window.addEventListener('blur', handleDismiss)

    return () => {
      window.removeEventListener(CLOSE_ALL_EVENT, handleOtherOpen)
      window.removeEventListener('mousedown', handlePointerDown, true)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('scroll', handleDismiss, true)
      window.removeEventListener('resize', handleDismiss)
      window.removeEventListener('blur', handleDismiss)
    }
  }, [position, menuId, onClose])

  if (!position) return null

  const coords = clampedPos ?? position

  return createPortal(
    <ContextMenuCloseContext.Provider value={onClose}>
      <div
        ref={menuRef}
        role="menu"
        style={{ left: coords.x, top: coords.y }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        className={cn(
          'wf-popover-motion fixed z-[80] min-w-[13.5rem] max-w-[19rem] overflow-hidden rounded-md border border-border bg-popover p-1 text-popover-foreground shadow-lg',
          className
        )}
      >
        {children}
      </div>
    </ContextMenuCloseContext.Provider>,
    document.body
  )
}

export function ContextMenuLabel({
  className,
  children
}: {
  readonly className?: string
  readonly children: React.ReactNode
}): React.JSX.Element {
  return (
    <div
      className={cn(
        'truncate px-2.5 py-1 text-[11px] font-semibold text-muted-foreground',
        className
      )}
    >
      {children}
    </div>
  )
}

export function ContextMenuSeparator({
  className
}: {
  readonly className?: string
}): React.JSX.Element {
  return <div role="separator" className={cn('-mx-1 my-1 h-px bg-border', className)} />
}

export function ContextMenuItem({
  onSelect,
  disabled = false,
  destructive = false,
  className,
  children
}: {
  readonly onSelect: () => void
  readonly disabled?: boolean
  readonly destructive?: boolean
  readonly className?: string
  readonly children: React.ReactNode
}): React.JSX.Element {
  const closeMenu = React.useContext(ContextMenuCloseContext)

  return (
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation()
        if (disabled) return
        closeMenu()
        onSelect()
      }}
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center gap-2 rounded-sm px-2.5 py-1.5 text-left text-xs outline-none transition-colors hover:bg-secondary hover:text-foreground focus:bg-secondary focus:text-foreground disabled:pointer-events-none disabled:opacity-40',
        destructive && 'text-destructive hover:bg-destructive/15 hover:text-destructive',
        className
      )}
    >
      {children}
    </button>
  )
}
