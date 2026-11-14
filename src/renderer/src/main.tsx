import * as React from 'react'
import { createRoot } from 'react-dom/client'
import { App } from '@/App'
import { CodexFarmOverlayWindow } from '@/components/overlay/CodexFarmOverlayWindow'
import '@/styles/globals.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Élément #root introuvable dans index.html')
}

const isCodexFarmOverlayView =
  new URLSearchParams(window.location.search).get('view') === 'codex-farm-overlay'

if (isCodexFarmOverlayView) {
  document.documentElement.style.background = 'transparent'
  document.body.style.background = 'transparent'
}

createRoot(rootElement).render(
  <React.StrictMode>
    {isCodexFarmOverlayView ? <CodexFarmOverlayWindow /> : <App />}
  </React.StrictMode>
)
