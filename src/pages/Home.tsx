import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Fixture } from '../lib/types'
import Header from '../components/Header'
import FixtureCard from '../components/FixtureCard'
import PredictionForm from '../components/PredictionForm'

export default function Home() {
  const [fixture, setFixture] = useState<Fixture | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('fixtures')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
      .then(({ data }) => {
        setFixture(data)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-svh flex flex-col bg-slate-100">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-4">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="bg-spurs-navy rounded-2xl h-36 opacity-30" />
            <div className="bg-white rounded-2xl h-48 opacity-50" />
          </div>
        ) : !fixture ? (
          <div className="bg-white rounded-2xl p-8 text-center shadow-sm">
            <img src="/logo.jpeg" alt="Dubai Spurs" className="h-16 w-16 rounded-full mx-auto mb-4 object-cover" />
            <h2 className="text-lg font-bold text-spurs-navy mb-2">No fixture this week</h2>
            <p className="text-gray-500 text-sm">Check back soon — the organiser will add the next match.</p>
          </div>
        ) : (
          <>
            <FixtureCard fixture={fixture} />
            {fixture.predictions_open ? (
              <PredictionForm fixture={fixture} />
            ) : (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">🔒</div>
                <p className="font-semibold text-spurs-navy">Predictions are closed</p>
                <p className="text-sm text-gray-500 mt-1">The organiser has locked this week's entries.</p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  )
}
