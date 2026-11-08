import { Calendar, Clock, MapPin } from 'lucide-react'
import type { Fixture } from '../lib/types'

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })
}

function TeamBadge({ crest, name }: { crest: string | null; name: string }) {
  if (!crest) return null
  return (
    <img
      src={crest}
      alt={name}
      className="w-12 h-12 object-contain mx-auto mb-2"
      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
    />
  )
}

interface Props {
  fixture: Fixture
  showStatus?: boolean
}

export default function FixtureCard({ fixture, showStatus = true }: Props) {
  const hasResult = fixture.actual_home_score !== null && fixture.actual_away_score !== null

  return (
    <div className="bg-spurs-navy rounded-2xl text-white overflow-hidden shadow-lg">
      <div className="bg-spurs-light px-4 py-2 flex items-center justify-between">
        <span className="text-xs font-semibold tracking-widest text-blue-200 uppercase">
          {fixture.competition}
        </span>
        {showStatus && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
            fixture.predictions_open
              ? 'bg-green-500 text-white'
              : 'bg-gray-500 text-gray-200'
          }`}>
            {fixture.predictions_open ? 'Predictions Open' : 'Predictions Closed'}
          </span>
        )}
      </div>

      <div className="px-4 py-5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex-1 text-center">
            <TeamBadge crest={fixture.home_crest} name={fixture.home_team} />
            <span className="font-bold text-sm leading-tight block">{fixture.home_team}</span>
          </div>

          <div className="text-center px-2 shrink-0">
            {hasResult ? (
              <div className="text-3xl font-black tracking-tight">
                {fixture.actual_home_score} – {fixture.actual_away_score}
              </div>
            ) : (
              <div className="text-xl font-bold text-blue-300">vs</div>
            )}
          </div>

          <div className="flex-1 text-center">
            <TeamBadge crest={fixture.away_crest} name={fixture.away_team} />
            <span className="font-bold text-sm leading-tight block">{fixture.away_team}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1.5">
        <div className="flex items-center gap-1.5 text-xs text-blue-200">
          <Calendar size={12} />
          <span>{formatDate(fixture.match_date)}</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-blue-200">
          <Clock size={12} />
          <span>{fixture.match_time}</span>
        </div>
        {fixture.venue && (
          <div className="flex items-center gap-1.5 text-xs text-blue-200">
            <MapPin size={12} />
            <span>{fixture.venue}</span>
          </div>
        )}
      </div>
    </div>
  )
}
