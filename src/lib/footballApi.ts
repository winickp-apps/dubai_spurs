const FINISHED_STATUSES = new Set(['FINISHED', 'IN_PLAY', 'PAUSED', 'CANCELLED', 'ABANDONED', 'POSTPONED'])

export interface ApiMatch {
  id: number
  utcDate: string
  status: string
  competition: { id: number; name: string; code: string }
  homeTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  awayTeam: { id: number; name: string; shortName: string; tla: string; crest: string }
  venue: string | null
}

export async function getUpcomingSpursMatches(): Promise<ApiMatch[]> {
  const res = await fetch('/api/fixtures')
  if (!res.ok) throw new Error('Failed to fetch fixtures')
  const data = await res.json()
  const matches: ApiMatch[] = data.matches ?? []
  return matches
    .filter(m => !FINISHED_STATUSES.has(m.status))
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))
}
