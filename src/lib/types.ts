export interface Fixture {
  id: string
  home_team: string
  away_team: string
  home_crest: string | null
  away_crest: string | null
  match_date: string
  match_time: string
  venue: string | null
  competition: string
  is_active: boolean
  predictions_open: boolean
  actual_home_score: number | null
  actual_away_score: number | null
  created_at: string
}

export interface Prediction {
  id: string
  fixture_id: string
  name: string
  phone: string
  home_score: number
  away_score: number
  created_at: string
}

export interface Winner {
  id: string
  fixture_id: string | null
  prediction_id: string | null
  name: string
  predicted_home: number
  predicted_away: number
  actual_home: number
  actual_away: number
  home_team: string
  away_team: string
  match_date: string
  competition: string
  drawn_at: string
}
