export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')

  try {
    const response = await fetch(
      'https://api.football-data.org/v4/teams/73/matches',
      { headers: { 'X-Auth-Token': process.env.VITE_FOOTBALL_API_KEY } }
    )
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Football API error' })
    }
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch fixtures' })
  }
}
