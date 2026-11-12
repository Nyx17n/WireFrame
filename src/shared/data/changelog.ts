import { z } from 'zod'
import rawChangelog from './changelog.json'

export const ChangelogReleaseSchema = z.object({
  version: z.string().min(1),
  date: z.string().min(1),
  titleFr: z.string().min(1),
  badgeFr: z.string().min(1),
  highlightsFr: z.array(z.string().min(1)).readonly()
})

export type ChangelogRelease = z.infer<typeof ChangelogReleaseSchema>

export const CHANGELOG_RELEASES: readonly ChangelogRelease[] = z
  .array(ChangelogReleaseSchema)
  .parse(rawChangelog)
