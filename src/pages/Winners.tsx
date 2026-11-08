import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Winner } from '../lib/types'
import Header from '../components/Header'
import { Trophy, ArrowLeft } from 'lucide-react'

function formatDate(d: string) {
  return new Date(d + 'T00:00:00').toLocaleDateString('en-GB', {
    day: 'numeric', month: 'long', year: 'numeric',
  })
}

export default function Winners() {
  const [winners, setWinners] = useState<Winner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('winners')
      .select('*')
      .order('drawn_at', { ascending: false })
      .then(({ data }) => {
        setWinners(data ?? [])
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-svh flex flex-col bg-slate-100">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/" className="text-spurs-navy">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-xl font-bold text-spurs-navy flex items-center gap-2">
            <Trophy size={20} className="text-yellow-500" />
            Winners Board
          </h1>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-2xl h-24 animate-pulse opacity-50" />
            ))}
          </div>
        ) : winners.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <Trophy size={40} className="mx-auto text-gray-300 mb-3" />
            <p className="font-semibold text-gray-500">No winners yet</p>
            <p className="text-sm text-gray-400 mt-1">The first draw will appear here.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {winners.map((w, i) => (
              <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                      i === 0 ? 'bg-yellow-400 text-yellow-900' : 'bg-slate-100 text-slate-500'
                    }`}>
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-bold text-spurs-navy">{w.name}</div>
                      <div className="text-xs text-gray-400">{formatDate(w.match_date)}</div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-xs text-gray-400 mb-0.5">{w.home_team} v {w.away_team}</div>
                    <div className="text-sm font-black text-spurs-navy">
                      {w.predicted_home}–{w.predicted_away}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
