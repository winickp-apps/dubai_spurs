import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Fixture, Prediction, Winner } from '../lib/types'
import Header from '../components/Header'
import FixtureCard from '../components/FixtureCard'
import { LogOut, Shuffle, Lock, Unlock, Trophy, Plus, Pencil, CheckCircle, Trash2 } from 'lucide-react'

type Tab = 'fixture' | 'predictions' | 'draw' | 'history'

// ── Admin Login ──────────────────────────────────────────────────────────────
function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [email] = useState('admin@dubaispurs.local')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (err) setError('Incorrect password. Please try again.')
    else onLogin()
  }

  return (
    <div className="min-h-svh flex flex-col bg-slate-100">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-10">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="text-center mb-6">
            <div className="w-14 h-14 bg-spurs-navy rounded-full flex items-center justify-center mx-auto mb-3">
              <Lock size={24} className="text-white" />
            </div>
            <h2 className="text-lg font-bold text-spurs-navy">Admin Access</h2>
            <p className="text-sm text-gray-500 mt-1">Organisers only</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy"
                autoFocus
              />
            </div>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-spurs-navy text-white font-bold py-4 rounded-2xl text-base disabled:opacity-60"
            >
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </main>
    </div>
  )
}

// ── Fixture Form ─────────────────────────────────────────────────────────────
function FixtureForm({ fixture, onSaved }: { fixture: Fixture | null; onSaved: () => void }) {
  const isNew = !fixture
  const [homeTeam, setHomeTeam] = useState(fixture?.home_team ?? 'Tottenham Hotspur')
  const [awayTeam, setAwayTeam] = useState(fixture?.away_team ?? '')
  const [matchDate, setMatchDate] = useState(fixture?.match_date ?? '')
  const [matchTime, setMatchTime] = useState(fixture?.match_time ?? '15:00')
  const [venue, setVenue] = useState(fixture?.venue ?? '')
  const [competition, setCompetition] = useState(fixture?.competition ?? 'Premier League')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function handleSave(e: React.FormEvent) {
    e.preventDefault()
    if (!awayTeam.trim() || !matchDate) return setError('Opponent and date are required.')
    setError('')
    setSaving(true)

    const payload = {
      home_team: homeTeam.trim(),
      away_team: awayTeam.trim(),
      match_date: matchDate,
      match_time: matchTime,
      venue: venue.trim() || null,
      competition: competition.trim(),
      is_active: true,
      predictions_open: true,
    }

    if (isNew) {
      // deactivate all other fixtures first
      await supabase.from('fixtures').update({ is_active: false }).neq('id', '00000000-0000-0000-0000-000000000000')
      await supabase.from('fixtures').insert(payload)
    } else {
      await supabase.from('fixtures').update(payload).eq('id', fixture!.id)
    }

    setSaving(false)
    onSaved()
  }

  return (
    <form onSubmit={handleSave} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
      <h3 className="font-bold text-spurs-navy text-sm uppercase tracking-wide">
        {isNew ? 'Add New Fixture' : 'Edit Fixture'}
      </h3>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Home Team</label>
        <input value={homeTeam} onChange={e => setHomeTeam(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy" />
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Away Team (Opponent)</label>
        <input value={awayTeam} onChange={e => setAwayTeam(e.target.value)} placeholder="e.g. Arsenal"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Date</label>
          <input type="date" value={matchDate} onChange={e => setMatchDate(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy" />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Kick-off</label>
          <input type="time" value={matchTime} onChange={e => setMatchTime(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy" />
        </div>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Competition</label>
        <select value={competition} onChange={e => setCompetition(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy bg-white">
          {['Premier League','Champions League','Europa League','FA Cup','Carabao Cup','Friendly'].map(c => (
            <option key={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-semibold text-gray-500 mb-1">Venue (optional)</label>
        <input value={venue} onChange={e => setVenue(e.target.value)} placeholder="e.g. Tottenham Hotspur Stadium"
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy" />
      </div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{error}</div>
      )}
      <button type="submit" disabled={saving}
        className="w-full bg-spurs-navy text-white font-bold py-3 rounded-2xl text-sm disabled:opacity-60">
        {saving ? 'Saving…' : isNew ? 'Create Fixture' : 'Save Changes'}
      </button>
    </form>
  )
}

// ── Main Admin Dashboard ──────────────────────────────────────────────────────
export default function Admin() {
  const [authed, setAuthed] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [tab, setTab] = useState<Tab>('fixture')
  const [fixture, setFixture] = useState<Fixture | null>(null)
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [winners, setWinners] = useState<Winner[]>([])
  const [editing, setEditing] = useState(false)
  const [actualHome, setActualHome] = useState('')
  const [actualAway, setActualAway] = useState('')
  const [savingResult, setSavingResult] = useState(false)
  const [drawnWinner, setDrawnWinner] = useState<Prediction | null>(null)
  const [drawing, setDrawing] = useState(false)
  const [winnerSaved, setWinnerSaved] = useState(false)
  const [addingManual, setAddingManual] = useState(false)
  const [manualName, setManualName] = useState('')
  const [manualPhone, setManualPhone] = useState('')
  const [manualHome, setManualHome] = useState(0)
  const [manualAway, setManualAway] = useState(0)
  const [manualSaving, setManualSaving] = useState(false)
  const [manualError, setManualError] = useState('')
  const [overrideMode, setOverrideMode] = useState(false)
  const [showUnlock, setShowUnlock] = useState(false)
  const [unlockPassword, setUnlockPassword] = useState('')
  const [unlockError, setUnlockError] = useState('')
  const [unlocking, setUnlocking] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setAuthed(!!data.session)
      setCheckingAuth(false)
    })
  }, [])

  useEffect(() => {
    if (!authed) return
    loadFixture()
    loadWinners()
  }, [authed])

  async function loadFixture() {
    const { data } = await supabase
      .from('fixtures')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    setFixture(data)
    if (data) {
      setActualHome(data.actual_home_score?.toString() ?? '')
      setActualAway(data.actual_away_score?.toString() ?? '')
      loadPredictions(data.id)
    }
  }

  async function loadPredictions(fixtureId: string) {
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('fixture_id', fixtureId)
      .order('created_at', { ascending: true })
    setPredictions(data ?? [])
  }

  async function loadWinners() {
    const { data } = await supabase
      .from('winners')
      .select('*')
      .order('drawn_at', { ascending: false })
    setWinners(data ?? [])
  }

  async function togglePredictions() {
    if (!fixture) return
    await supabase.from('fixtures').update({ predictions_open: !fixture.predictions_open }).eq('id', fixture.id)
    loadFixture()
  }

  async function saveResult() {
    if (!fixture) return
    const h = parseInt(actualHome)
    const a = parseInt(actualAway)
    if (isNaN(h) || isNaN(a)) return
    setSavingResult(true)
    await supabase.from('fixtures').update({ actual_home_score: h, actual_away_score: a, predictions_open: false }).eq('id', fixture.id)
    setSavingResult(false)
    loadFixture()
  }

  function getCorrectPredictions() {
    if (!fixture || fixture.actual_home_score === null || fixture.actual_away_score === null) return []
    return predictions.filter(p =>
      p.home_score === fixture.actual_home_score && p.away_score === fixture.actual_away_score
    )
  }

  async function drawWinner() {
    const correct = getCorrectPredictions()
    if (correct.length === 0) return
    setDrawing(true)
    setWinnerSaved(false)
    setDrawnWinner(null)
    // Brief suspense animation
    await new Promise(r => setTimeout(r, 1200))
    const winner = correct[Math.floor(Math.random() * correct.length)]
    setDrawnWinner(winner)
    setDrawing(false)
  }

  async function saveWinner() {
    if (!fixture || !drawnWinner) return
    await supabase.from('winners').insert({
      fixture_id: fixture.id,
      prediction_id: drawnWinner.id,
      name: drawnWinner.name,
      predicted_home: drawnWinner.home_score,
      predicted_away: drawnWinner.away_score,
      actual_home: fixture.actual_home_score!,
      actual_away: fixture.actual_away_score!,
      home_team: fixture.home_team,
      away_team: fixture.away_team,
      match_date: fixture.match_date,
      competition: fixture.competition,
    })
    setWinnerSaved(true)
    loadWinners()
  }

  async function addManualPrediction() {
    if (!fixture) return
    if (!manualName.trim()) return setManualError('Name is required.')
    if (!manualPhone.trim()) return setManualError('Phone is required.')
    setManualError('')
    setManualSaving(true)
    const { error } = await supabase.from('predictions').insert({
      fixture_id: fixture.id,
      name: manualName.trim(),
      phone: manualPhone.trim(),
      home_score: manualHome,
      away_score: manualAway,
    })
    setManualSaving(false)
    if (error) {
      setManualError(error.code === '23505' ? 'A prediction for that phone number already exists.' : 'Something went wrong.')
    } else {
      setManualName('')
      setManualPhone('')
      setManualHome(0)
      setManualAway(0)
      setAddingManual(false)
      loadPredictions(fixture.id)
    }
  }

  async function deletePrediction(id: string) {
    await supabase.from('predictions').delete().eq('id', id)
    setPredictions(prev => prev.filter(p => p.id !== id))
  }

  async function handleUnlock(e: React.FormEvent) {
    e.preventDefault()
    setUnlockError('')
    setUnlocking(true)
    const { error } = await supabase.auth.signInWithPassword({
      email: 'admin@dubaispurs.local',
      password: unlockPassword,
    })
    setUnlocking(false)
    if (error) {
      setUnlockError('Incorrect password.')
    } else {
      setOverrideMode(true)
      setShowUnlock(false)
      setUnlockPassword('')
    }
  }

  async function logout() {
    await supabase.auth.signOut()
    setAuthed(false)
  }

  if (checkingAuth) return null

  if (!authed) return <AdminLogin onLogin={() => setAuthed(true)} />

  const correctPredictions = getCorrectPredictions()
  const hasResult = fixture?.actual_home_score !== null && fixture?.actual_away_score !== null
  const isLocked = !overrideMode && winners.some(w => w.fixture_id === fixture?.id)

  return (
    <div className="min-h-svh flex flex-col bg-slate-100">
      <Header />
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-5 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-spurs-navy">Admin Panel</h1>
          <button onClick={logout} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600 py-2">
            <LogOut size={16} />
            Sign out
          </button>
        </div>

        {/* Lock banner */}
        {isLocked && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Lock size={15} className="text-amber-600 shrink-0" />
              <span className="text-xs font-semibold text-amber-700">Winner saved — predictions & result are locked.</span>
            </div>
            <button onClick={() => setShowUnlock(true)} className="text-xs font-bold text-amber-700 underline shrink-0">Override</button>
          </div>
        )}
        {overrideMode && (
          <div className="bg-red-50 border border-red-200 rounded-2xl px-4 py-3 flex items-center gap-2">
            <Unlock size={15} className="text-red-500 shrink-0" />
            <span className="text-xs font-semibold text-red-600">Override mode active — changes are allowed.</span>
          </div>
        )}

        {/* Unlock modal */}
        {showUnlock && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl">
              <h3 className="font-bold text-spurs-navy text-lg mb-1">Admin Override</h3>
              <p className="text-sm text-gray-500 mb-4">Enter your password to unlock editing.</p>
              <form onSubmit={handleUnlock} className="space-y-3">
                <input
                  type="password"
                  value={unlockPassword}
                  onChange={e => setUnlockPassword(e.target.value)}
                  placeholder="Password"
                  autoFocus
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy"
                />
                {unlockError && <p className="text-xs text-red-600">{unlockError}</p>}
                <div className="flex gap-3">
                  <button type="button" onClick={() => { setShowUnlock(false); setUnlockPassword(''); setUnlockError('') }}
                    className="flex-1 border border-gray-200 text-gray-500 font-bold py-3 rounded-2xl text-sm">
                    Cancel
                  </button>
                  <button type="submit" disabled={unlocking}
                    className="flex-1 bg-spurs-navy text-white font-bold py-3 rounded-2xl text-sm disabled:opacity-60">
                    {unlocking ? '…' : 'Unlock'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="grid grid-cols-4 gap-1 bg-white rounded-2xl p-1 shadow-sm">
          {(['fixture', 'predictions', 'draw', 'history'] as Tab[]).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`py-2 rounded-xl text-xs font-semibold capitalize transition-colors ${
                tab === t ? 'bg-spurs-navy text-white' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              {t === 'draw' ? 'Draw' : t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* ── Fixture Tab ── */}
        {tab === 'fixture' && (
          <div className="space-y-4">
            {fixture && !editing ? (
              <div className="space-y-3">
                <FixtureCard fixture={fixture} />
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={togglePredictions}
                    className={`flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold transition-colors ${
                      fixture.predictions_open
                        ? 'bg-amber-500 text-white'
                        : 'bg-green-500 text-white'
                    }`}
                  >
                    {fixture.predictions_open ? <Lock size={16} /> : <Unlock size={16} />}
                    {fixture.predictions_open ? 'Close Predictions' : 'Open Predictions'}
                  </button>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold bg-white border border-gray-200 text-spurs-navy"
                  >
                    <Pencil size={16} />
                    Edit Fixture
                  </button>
                </div>
                <button
                  onClick={() => { setEditing(false); setFixture(null) }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-bold bg-white border border-gray-200 text-gray-500"
                >
                  <Plus size={16} />
                  New Fixture for Next Week
                </button>
              </div>
            ) : (
              <FixtureForm
                fixture={editing ? fixture : null}
                onSaved={() => { setEditing(false); loadFixture() }}
              />
            )}
          </div>
        )}

        {/* ── Predictions Tab ── */}
        {tab === 'predictions' && (
          <div className="space-y-3">
            {!fixture ? (
              <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">No active fixture.</div>
            ) : (
              <>
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-bold text-spurs-navy">
                      {predictions.length} prediction{predictions.length !== 1 ? 's' : ''}
                    </span>
                    {hasResult && (
                      <span className="text-xs bg-green-100 text-green-700 font-semibold px-2 py-0.5 rounded-full">
                        {correctPredictions.length} correct
                      </span>
                    )}
                  </div>

                  {/* Result entry */}
                  <div className="border-t border-gray-100 pt-3">
                    <p className="text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">Set Final Score</p>
                    <div className="flex items-center gap-2">
                      <input
                        type="number" min="0" max="20" value={actualHome}
                        onChange={e => setActualHome(e.target.value)}
                        placeholder={fixture.home_team.split(' ')[0]}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-spurs-navy"
                      />
                      <span className="text-gray-400 font-bold">–</span>
                      <input
                        type="number" min="0" max="20" value={actualAway}
                        onChange={e => setActualAway(e.target.value)}
                        placeholder={fixture.away_team.split(' ')[0]}
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-sm text-center font-bold focus:outline-none focus:ring-2 focus:ring-spurs-navy"
                      />
                      <button
                        onClick={saveResult} disabled={savingResult || isLocked}
                        className="bg-spurs-navy text-white text-sm font-bold px-4 py-2 rounded-xl disabled:opacity-40"
                      >
                        {savingResult ? '…' : 'Save'}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Manual add */}
                {!addingManual ? (
                  <button
                    onClick={() => !isLocked && setAddingManual(true)}
                    disabled={isLocked}
                    className="w-full flex items-center justify-center gap-2 bg-white border border-dashed border-gray-300 text-gray-500 font-semibold text-sm py-3 rounded-2xl hover:border-spurs-navy hover:text-spurs-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Plus size={16} />
                    Add prediction manually
                  </button>
                ) : (
                  <div className="bg-white rounded-2xl p-4 shadow-sm space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-bold text-spurs-navy">Add Manually</span>
                      <button onClick={() => { setAddingManual(false); setManualError('') }} className="text-gray-400 text-xs">Cancel</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Full Name</label>
                        <input value={manualName} onChange={e => setManualName(e.target.value)} placeholder="Name"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-400 mb-1">Mobile Number</label>
                        <input type="tel" value={manualPhone} onChange={e => setManualPhone(e.target.value)} placeholder="Phone"
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy" />
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2 flex-1">
                        <span className="text-xs text-gray-500 w-14 shrink-0">{fixture.home_team.split(' ')[0]}</span>
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setManualHome(h => Math.max(0, h - 1))} className="w-7 h-7 rounded-full bg-spurs-navy text-white text-sm font-bold flex items-center justify-center">−</button>
                          <span className="w-6 text-center font-black text-spurs-navy">{manualHome}</span>
                          <button type="button" onClick={() => setManualHome(h => Math.min(20, h + 1))} className="w-7 h-7 rounded-full bg-spurs-navy text-white text-sm font-bold flex items-center justify-center">+</button>
                        </div>
                      </div>
                      <span className="text-gray-300 font-bold">–</span>
                      <div className="flex items-center gap-2 flex-1 justify-end">
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={() => setManualAway(a => Math.max(0, a - 1))} className="w-7 h-7 rounded-full bg-spurs-navy text-white text-sm font-bold flex items-center justify-center">−</button>
                          <span className="w-6 text-center font-black text-spurs-navy">{manualAway}</span>
                          <button type="button" onClick={() => setManualAway(a => Math.min(20, a + 1))} className="w-7 h-7 rounded-full bg-spurs-navy text-white text-sm font-bold flex items-center justify-center">+</button>
                        </div>
                        <span className="text-xs text-gray-500 w-14 shrink-0 text-right">{fixture.away_team.split(' ')[0]}</span>
                      </div>
                    </div>
                    {manualError && <p className="text-xs text-red-600">{manualError}</p>}
                    <button onClick={addManualPrediction} disabled={manualSaving}
                      className="w-full bg-spurs-navy text-white font-bold py-3 rounded-2xl text-sm disabled:opacity-60">
                      {manualSaving ? 'Saving…' : 'Add Prediction'}
                    </button>
                  </div>
                )}

                {/* Predictions list */}
                {predictions.length === 0 ? (
                  <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">No predictions yet.</div>
                ) : (
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm">
                    {predictions.map((p, i) => {
                      const isCorrect = hasResult &&
                        p.home_score === fixture.actual_home_score &&
                        p.away_score === fixture.actual_away_score
                      return (
                        <div key={p.id} className={`flex items-center justify-between px-4 py-3 ${
                          i < predictions.length - 1 ? 'border-b border-gray-100' : ''
                        } ${isCorrect ? 'bg-green-50' : ''}`}>
                          <div>
                            <div className="font-semibold text-sm text-gray-800">{p.name}</div>
                            <div className="text-xs text-gray-400">{p.phone}</div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="font-black text-spurs-navy">{p.home_score}–{p.away_score}</span>
                            {isCorrect && <CheckCircle size={16} className="text-green-500" />}
                            <button
                              onClick={() => { if (!isLocked && confirm(`Delete ${p.name}'s prediction?`)) deletePrediction(p.id) }}
                              disabled={isLocked}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1 disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Draw Tab ── */}
        {tab === 'draw' && (
          <div className="space-y-4">
            {!fixture || !hasResult ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <p className="text-gray-500 text-sm">Set the final score in the Predictions tab first.</p>
              </div>
            ) : correctPredictions.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center shadow-sm">
                <div className="text-3xl mb-2">😬</div>
                <p className="font-semibold text-gray-600">No correct predictions this week!</p>
                <p className="text-sm text-gray-400 mt-1">
                  Final score: {fixture.actual_home_score}–{fixture.actual_away_score} — nobody got it.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 shadow-sm text-center">
                  <p className="text-sm text-gray-500">
                    <span className="font-bold text-spurs-navy">{correctPredictions.length}</span> correct prediction{correctPredictions.length !== 1 ? 's' : ''} for <span className="font-bold">{fixture.actual_home_score}–{fixture.actual_away_score}</span>
                  </p>
                </div>

                {!drawnWinner && (
                  <button
                    onClick={drawWinner}
                    disabled={drawing}
                    className="w-full bg-spurs-navy text-white font-bold py-5 rounded-2xl text-base flex items-center justify-center gap-3 disabled:opacity-70"
                  >
                    <Shuffle size={22} />
                    {drawing ? 'Drawing…' : 'Draw Random Winner'}
                  </button>
                )}

                {drawing && (
                  <div className="bg-spurs-navy rounded-2xl p-8 text-center animate-pulse">
                    <div className="text-4xl mb-2">🎲</div>
                    <p className="text-white font-bold text-lg">Drawing…</p>
                  </div>
                )}

                {drawnWinner && !drawing && (
                  <div className="bg-spurs-navy rounded-2xl p-6 text-center shadow-lg">
                    <Trophy size={40} className="mx-auto text-yellow-400 mb-3" />
                    <p className="text-blue-200 text-sm mb-1">This week's winner</p>
                    <p className="text-white font-black text-2xl mb-1">{drawnWinner.name}</p>
                    <p className="text-blue-300 text-sm mb-1">{drawnWinner.phone}</p>
                    <div className="inline-block bg-white/10 rounded-xl px-4 py-2 mt-2 mb-4">
                      <p className="text-xs text-blue-200">Predicted</p>
                      <p className="text-white font-black text-xl">{drawnWinner.home_score}–{drawnWinner.away_score}</p>
                    </div>
                    <div className="flex gap-3">
                      {!winnerSaved ? (
                        <>
                          <button
                            onClick={drawWinner}
                            className="flex-1 border border-white/30 text-white font-bold py-3 rounded-2xl text-sm"
                          >
                            Redraw
                          </button>
                          <button
                            onClick={saveWinner}
                            className="flex-1 bg-yellow-400 text-yellow-900 font-bold py-3 rounded-2xl text-sm"
                          >
                            Confirm Winner
                          </button>
                        </>
                      ) : (
                        <div className="w-full flex items-center justify-center gap-2 bg-green-500 text-white font-bold py-3 rounded-2xl text-sm">
                          <CheckCircle size={18} />
                          Winner Saved!
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* ── History Tab ── */}
        {tab === 'history' && (
          <div className="space-y-3">
            {winners.length === 0 ? (
              <div className="bg-white rounded-2xl p-6 text-center text-gray-400 text-sm">No winners recorded yet.</div>
            ) : (
              winners.map((w, i) => (
                <div key={w.id} className="bg-white rounded-2xl p-4 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-spurs-navy">{w.name}</div>
                      <div className="text-xs text-gray-400">{w.home_team} v {w.away_team} · {new Date(w.match_date + 'T00:00:00').toLocaleDateString('en-GB', { day:'numeric', month:'short', year:'numeric'})}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-black text-spurs-navy">{w.predicted_home}–{w.predicted_away}</div>
                      <div className="text-xs text-gray-400">#{i + 1}</div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </main>
    </div>
  )
}
