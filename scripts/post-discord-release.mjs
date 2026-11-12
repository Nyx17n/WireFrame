import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const REPO_OWNER = 'Nyx17n'
const REPO_NAME = 'WireFrame'
const ALLOWED_DISCORD_HOSTS = new Set([
  'discord.com',
  'discordapp.com',
  'canary.discord.com',
  'ptb.discord.com'
])

function resolveTargetVersion() {
  const cliArg = process.argv.find((arg) => arg.startsWith('--version='))
  const rawTag = cliArg ? cliArg.slice('--version='.length) : process.env.RELEASE_TAG || ''
  const cleaned = rawTag.replace(/^refs\/tags\//, '').replace(/^v/i, '').trim()
  if (cleaned) return cleaned

  const pkg = JSON.parse(readFileSync(resolve('package.json'), 'utf8'))
  return String(pkg.version).trim()
}

function validateDiscordWebhookUrl(rawUrl) {
  const parsed = new URL(rawUrl)
  if (parsed.protocol !== 'https:') {
    throw new Error('Sécurité TLS : DISCORD_WEBHOOK_URL doit obligatoirement utiliser https://')
  }
  if (!ALLOWED_DISCORD_HOSTS.has(parsed.hostname.toLowerCase())) {
    throw new Error(`Domaine Webhook Discord non autorisé : ${parsed.hostname}`)
  }
  if (!parsed.pathname.startsWith('/api/webhooks/')) {
    throw new Error('Chemin Webhook Discord invalide (attendu : /api/webhooks/...)')
  }
  parsed.searchParams.set('wait', 'true')
  return parsed.toString()
}

function buildRoleMention(rawRoleInput) {
  const trimmed = (rawRoleInput || '').trim()
  if (!trimmed) {
    return { content: undefined, allowedMentions: { parse: [] } }
  }
  if (trimmed === '@everyone' || trimmed === '@here') {
    return {
      content: `${trimmed} Nouvelle mise à jour **WireFrame** disponible !`,
      allowedMentions: { parse: ['everyone'] }
    }
  }
  const roleIdMatch = /^(?:<@&)?(\d{15,24})>?$/.exec(trimmed)
  if (!roleIdMatch?.[1]) {
    console.warn('[Discord Release] DISCORD_PING_ROLE_ID ignoré (ID numérique Discord attendu).')
    return { content: undefined, allowedMentions: { parse: [] } }
  }
  const roleId = roleIdMatch[1]
  return {
    content: `<@&${roleId}> Nouvelle mise à jour **WireFrame** disponible !`,
    allowedMentions: { parse: [], roles: [roleId] }
  }
}

function buildReleaseContent(version) {
  const changelog = JSON.parse(readFileSync(resolve('src/shared/data/changelog.json'), 'utf8'))
  const entry = changelog.find((item) => item.version === version) ?? {
    version,
    date: new Date().toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
    titleFr: `Mise à jour WireFrame v${version}`,
    badgeFr: `Release v${version}`,
    highlightsFr: [
      `Nouvelle version v${version} disponible via l'auto-updater intégré et l'installateur Windows.`
    ]
  }

  const releaseUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/tag/v${version}`
  const installerUrl = `https://github.com/${REPO_OWNER}/${REPO_NAME}/releases/download/v${version}/WireFrame-Setup-${version}.exe`
  const avatarUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/src/renderer/public/images/logo.png`

  const bullets = entry.highlightsFr.map((line) => `• ${line}`).join('\n')
  const description = [
    `**${entry.badgeFr}**`,
    '',
    bullets,
    '',
    '> *Si WireFrame est déjà installé sur ton PC, la mise à jour te sera proposée automatiquement au lancement.*'
  ]
    .join('\n')
    .slice(0, 4000)

  const markdownReleaseBody = [
    `## ${entry.titleFr} (\`v${version}\`)`,
    '',
    ...entry.highlightsFr.map((line) => `- ${line}`),
    '',
    `### Téléchargement & Communauté`,
    `- **Installateur Windows (x64)** : [WireFrame-Setup-${version}.exe](${installerUrl})`,
    `- **Serveur Discord Officiel** : [Rejoindre discord.gg/DhGwHPf82n](https://discord.gg/DhGwHPf82n)`
  ].join('\n')

  return { entry, releaseUrl, installerUrl, avatarUrl, description, markdownReleaseBody }
}

async function syncGitHubReleaseNotes(version, markdownBody) {
  const token = (process.env.GH_TOKEN || '').trim()
  if (!token) return

  const apiBase = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}`
  const headers = {
    Accept: 'application/vnd.github+json',
    Authorization: `Bearer ${token}`,
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'WireFrame-Release-Bot'
  }

  const tagRes = await fetch(`${apiBase}/releases/tags/v${version}`, { headers })
  if (!tagRes.ok) return

  const releaseData = await tagRes.json()
  if (!releaseData?.id) return

  await fetch(`${apiBase}/releases/${releaseData.id}`, {
    method: 'PATCH',
    headers: { ...headers, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: `WireFrame v${version}`,
      body: markdownBody
    })
  })
  console.log(`[GitHub Release] Notes de patch synchronisées sur la release v${version}.`)
}

async function purgeGitHubCamoBadges() {
  const repoHtmlRes = await fetch(`https://github.com/${REPO_OWNER}/${REPO_NAME}`)
  if (!repoHtmlRes.ok) return
  const html = await repoHtmlRes.text()
  const camoUrls = Array.from(
    new Set(html.match(/https:\/\/camo\.githubusercontent\.com\/[a-f0-9]+\/[a-f0-9]+/g) ?? [])
  )
  await Promise.allSettled(camoUrls.map((url) => fetch(url, { method: 'PURGE' })))
  console.log(`[GitHub Camo] ${camoUrls.length} badge(s) README rafraîchi(s).`)
}

async function postToDiscord(webhookUrl, payload, threadNameFallback) {
  const res = await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  })

  if (res.ok) {
    console.log('[Discord Release] Patch note publié avec succès sur Discord !')
    return
  }

  const errText = await res.text()
  // Code Discord 220001 : le salon cible est un Salon Forum qui exige un thread_name
  if (res.status === 400 && errText.includes('220001') && threadNameFallback) {
    const forumRes = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        thread_name: threadNameFallback.slice(0, 100)
      })
    })
    if (forumRes.ok) {
      console.log('[Discord Release] Patch note publié avec succès dans le Salon Forum Discord !')
      return
    }
    throw new Error(`Échec publication Forum Discord (${forumRes.status}) : ${await forumRes.text()}`)
  }

  throw new Error(`Échec Webhook Discord (${res.status}) : ${errText}`)
}

async function main() {
  const isDryRun = process.argv.includes('--dry-run')
  const version = resolveTargetVersion()
  const { entry, releaseUrl, installerUrl, avatarUrl, description, markdownReleaseBody } =
    buildReleaseContent(version)
  const { content, allowedMentions } = buildRoleMention(process.env.DISCORD_PING_ROLE_ID)

  const discordPayload = {
    username: 'WireFrame — Patch Notes',
    avatar_url: avatarUrl,
    ...(content ? { content } : {}),
    allowed_mentions: allowedMentions,
    embeds: [
      {
        title: `🚀 WireFrame v${version} — ${entry.titleFr}`,
        url: releaseUrl,
        color: 0x26b9d1,
        description,
        fields: [
          {
            name: '📥 Installateur Windows (.exe)',
            value: `[Télécharger WireFrame-Setup-${version}.exe](${installerUrl})`,
            inline: true
          },
          {
            name: '📋 Release GitHub',
            value: `[Voir la release v${version}](${releaseUrl})`,
            inline: true
          }
        ],
        footer: {
          text: `WireFrame par Maxime (Nyxo17) · ${entry.date}`
        },
        timestamp: new Date().toISOString()
      }
    ]
  }

  if (isDryRun) {
    console.log(JSON.stringify(discordPayload, null, 2))
    return
  }

  await syncGitHubReleaseNotes(version, markdownReleaseBody).catch((err) => {
    console.warn('[GitHub Release] Impossible de mettre à jour la description GitHub :', err.message)
  })
  await purgeGitHubCamoBadges().catch(() => undefined)

  const rawWebhook = (process.env.DISCORD_WEBHOOK_URL || '').trim()
  if (!rawWebhook) {
    console.log(
      '[Discord Release] Secret DISCORD_WEBHOOK_URL non configuré — annonce Discord ignorée proprement.'
    )
    return
  }

  const validWebhookUrl = validateDiscordWebhookUrl(rawWebhook)
  await postToDiscord(
    validWebhookUrl,
    discordPayload,
    `WireFrame v${version} — ${entry.titleFr}`
  )
}

main().catch((err) => {
  console.error('[Discord Release] Erreur :', err)
  process.exit(1)
})

