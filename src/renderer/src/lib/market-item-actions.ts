import { ipcClient } from '@/services/ipc-client'
import { useMarketStore } from '@/stores/useMarketStore'
import { notify } from '@/stores/useNotificationStore'
import { useTabsStore } from '@/stores/useTabsStore'

export interface MarketContextItemTarget {
  readonly slug: string
  readonly nameFr: string
  readonly nameEn: string
  readonly thumb: string | null
}

const PART_SUFFIX_PATTERN =
  /\s+(?:Set|Blueprint|Chassis|Neuroptics|Systems|Cerebrum|Carapace|Barrel|Receiver|Stock|Blade|Handle|Hilt|Pouch|Stars|Link|Grip|String|Limb|Guard|Boot|Gauntlet|Ornament|Harness|Wings|Collar\s+Band|Collar\s+Buckle|Upper\s+Limb|Lower\s+Limb)$/i

export function cleanMarketBaseItemName(nameEn: string): string {
  return nameEn
    .replace(/\s+Blueprint$/i, '')
    .replace(PART_SUFFIX_PATTERN, '')
    .replace(/\s+Blueprint$/i, '')
    .trim()
}

export async function snipeMarketItemQuick(target: MarketContextItemTarget): Promise<void> {
  let cheapestIngame = 50
  try {
    const orders = await ipcClient.market.getItemOrders(target.slug, false)
    const best = orders
      .filter((o) => o.type === 'sell' && o.user?.status === 'ingame')
      .sort((a, b) => a.platinum - b.platinum)[0]
    if (best && best.platinum > 0) {
      cheapestIngame = best.platinum
    }
  } catch {
    // Repli gracieux sur un seuil par défaut de 45p si hors-ligne
  }

  await useMarketStore.getState().addPriceAlert({
    slug: target.slug,
    nameFr: target.nameFr || target.slug,
    nameEn: target.nameEn || target.slug,
    thumb: target.thumb,
    maxPlatinum: Math.max(1, cheapestIngame - 5)
  })
}

export async function openMarketItemInCodex(target: MarketContextItemTarget): Promise<void> {
  const cleanedEn = cleanMarketBaseItemName(target.nameEn || target.slug.replace(/_/g, ' '))
  try {
    const hits = await ipcClient.codex.quickSearch(cleanedEn, 8)
    const exact =
      hits.find((h) => h.nameEn.toLowerCase() === target.nameEn.trim().toLowerCase()) ??
      hits.find((h) => h.nameEn.toLowerCase() === cleanedEn.toLowerCase()) ??
      hits[0]

    if (exact) {
      useTabsStore.getState().navigateActive(
        {
          kind: 'codex-detail',
          category: exact.category,
          slug: exact.id
        },
        `Codex : ${exact.nameFr}`
      )
      return
    }
  } catch {
    // Bascule sur la recherche Codex ci-dessous
  }

  useTabsStore
    .getState()
    .navigateActive({ kind: 'codex-home', query: cleanedEn }, `Codex : ${cleanedEn}`)
  notify({
    kind: 'info',
    title: 'Recherche ouverte dans le Codex',
    message: `Résultats filtrés pour « ${cleanedEn} ».`
  })
}

export async function openMarketItemOnWiki(target: MarketContextItemTarget): Promise<void> {
  try {
    const detail = await ipcClient.market.getItemDetail(target.slug)
    if (detail.wikiLink && detail.wikiLink.startsWith('https://wiki.warframe.com')) {
      await ipcClient.window.openExternalUrl(detail.wikiLink)
      return
    }
  } catch {
    // Repli sur l'URL canonique du Wiki Officiel Warframe
  }

  const baseTitle = cleanMarketBaseItemName(target.nameEn || target.slug.replace(/_/g, ' '))
  const wikiSlug = encodeURIComponent(baseTitle.replace(/\s+/g, '_'))
  await ipcClient.window.openExternalUrl(`https://wiki.warframe.com/w/${wikiSlug}`)
}
