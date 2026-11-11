import * as React from 'react'

export function SafeAssetImage({
  src,
  alt = '',
  className,
  fallback = null
}: {
  src: string | null | undefined
  alt?: string
  className?: string
  fallback?: React.ReactNode
}): React.JSX.Element | null {
  const [failedSrc, setFailedSrc] = React.useState<string | null>(null)

  if (!src || failedSrc === src) {
    return fallback ? <>{fallback}</> : null
  }

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={className}
      onError={() => setFailedSrc(src)}
    />
  )
}

