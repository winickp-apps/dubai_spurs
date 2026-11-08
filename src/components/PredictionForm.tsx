import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Fixture } from '../lib/types'
import ScorePicker from './ScorePicker'
import { CheckCircle, Phone } from 'lucide-react'

interface Props {
  fixture: Fixture
}

const STORAGE_KEY = 'ds_prediction'

interface SavedPrediction {
  fixtureId: string
  name: string
  phone: string
  homeScore: number
  awayScore: number
}

function loadSaved(fixtureId: string): SavedPrediction | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const saved: SavedPrediction = JSON.parse(raw)
    return saved.fixtureId === fixtureId ? saved : null
  } catch {
    return null
  }
}

function savePrediction(data: SavedPrediction) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

type Stage = 'phone-gate' | 'form' | 'submitted'

export default function PredictionForm({ fixture }: Props) {
  const cached = loadSaved(fixture.id)

  const [stage, setStage] = useState<Stage>(cached ? 'submitted' : 'phone-gate')
  const [gatPhone, setGatPhone] = useState('')
  const [checking, setChecking] = useState(false)
  const [gateError, setGateError] = useState('')

  const [phone, setPhone] = useState(cached?.phone ?? '')
  const [name, setName] = useState(cached?.name ?? '')
  const [homeScore, setHomeScore] = useState(cached?.homeScore ?? 0)
  const [awayScore, setAwayScore] = useState(cached?.awayScore ?? 0)
  const [privacy, setPrivacy] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  async function handlePhoneCheck(e: React.FormEvent) {
    e.preventDefault()
    const trimmed = gatPhone.trim()
    if (!trimmed) return setGateError('Please enter your mobile number.')
    setGateError('')
    setChecking(true)

    const { data } = await supabase.rpc('get_my_prediction', {
      p_fixture_id: fixture.id,
      p_phone: trimmed,
    })

    setChecking(false)

    if (data && data.length > 0) {
      const existing = data[0]
      setName(existing.name)
      setPhone(trimmed)
      setHomeScore(existing.home_score)
      setAwayScore(existing.away_score)
      savePrediction({ fixtureId: fixture.id, name: existing.name, phone: trimmed, homeScore: existing.home_score, awayScore: existing.away_score })
      setStage('submitted')
    } else {
      setPhone(trimmed)
      setStage('form')
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return setSubmitError('Please enter your name.')
    if (!privacy) return setSubmitError('Please accept the privacy notice.')
    setSubmitError('')
    setSubmitting(true)

    const { error: err } = await supabase.from('predictions').insert({
      fixture_id: fixture.id,
      name: name.trim(),
      phone,
      home_score: homeScore,
      away_score: awayScore,
    })

    setSubmitting(false)
    if (err) {
      if (err.code === '23505') {
        setSubmitError('You have already submitted a prediction for this match. Contact an organiser if you need to change it.')
      } else {
        setSubmitError('Something went wrong. Please try again.')
      }
    } else {
      savePrediction({ fixtureId: fixture.id, name: name.trim(), phone, homeScore, awayScore })
      setStage('submitted')
    }
  }

  // ── Phone gate ───────────────────────────────────────────────────────────
  if (stage === 'phone-gate') {
    return (
      <form onSubmit={handlePhoneCheck} className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <Phone size={16} className="text-spurs-navy" />
          <h3 className="text-sm font-bold text-spurs-navy uppercase tracking-wide">Enter Your Number to Continue</h3>
        </div>
        <p className="text-xs text-gray-500">We use this to check if you've already submitted and to contact you if you win.</p>
        <input
          type="tel"
          value={gatPhone}
          onChange={e => setGatPhone(e.target.value)}
          placeholder="Mobile number"
          required
          autoFocus
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy"
          autoComplete="tel"
        />
        {gateError && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{gateError}</div>
        )}
        <button
          type="submit"
          disabled={checking}
          className="w-full bg-spurs-navy text-white font-bold py-4 rounded-2xl text-base disabled:opacity-60"
        >
          {checking ? 'Checking…' : 'Continue'}
        </button>
      </form>
    )
  }

  // ── Confirmation ─────────────────────────────────────────────────────────
  if (stage === 'submitted') {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm text-center">
        <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
        <h2 className="text-xl font-bold text-spurs-navy mb-1">Prediction Submitted!</h2>
        <p className="text-gray-600 text-sm mb-3">
          Good luck, <span className="font-semibold">{name}</span>!
        </p>
        <div className="bg-spurs-navy text-white rounded-xl px-4 py-3 inline-block">
          <div className="text-xs text-blue-200 mb-1">{fixture.home_team} vs {fixture.away_team}</div>
          <div className="text-2xl font-black">{homeScore} – {awayScore}</div>
        </div>
      </div>
    )
  }

  // ── Prediction form ───────────────────────────────────────────────────────
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="bg-white rounded-2xl p-5 shadow-sm">
        <h3 className="text-sm font-bold text-spurs-navy uppercase tracking-wide mb-4 text-center">
          Your Score Prediction
        </h3>
        <div className="flex justify-around items-center">
          <ScorePicker label={fixture.home_team} value={homeScore} onChange={setHomeScore} />
          <div className="text-2xl font-black text-gray-300">–</div>
          <ScorePicker label={fixture.away_team} value={awayScore} onChange={setAwayScore} />
        </div>
      </div>

      <div className="bg-white rounded-2xl p-5 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-spurs-navy uppercase tracking-wide">Your Details</h3>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Full Name</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Full name"
            required
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-spurs-navy"
            autoComplete="name"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Mobile Number</label>
          <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm bg-gray-50 text-gray-500">
            {phone}
          </div>
        </div>

        <label className="flex items-start gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={privacy}
            onChange={e => setPrivacy(e.target.checked)}
            className="mt-0.5 h-4 w-4 rounded text-spurs-navy shrink-0"
          />
          <span className="text-xs text-gray-500 leading-relaxed">
            I understand my name and phone number will be stored securely and only used to
            contact me if I win the weekly prize draw.
          </span>
        </label>
      </div>

      {submitError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-spurs-navy text-white font-bold py-4 rounded-2xl text-base active:scale-[0.98] transition-transform disabled:opacity-60"
      >
        {submitting ? 'Submitting…' : 'Submit Prediction'}
      </button>
    </form>
  )
}
