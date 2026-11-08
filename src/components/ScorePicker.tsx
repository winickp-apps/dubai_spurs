interface Props {
  label: string
  crest?: string | null
  value: number
  onChange: (v: number) => void
}

export default function ScorePicker({ label, value, onChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-bold text-spurs-navy uppercase tracking-wider text-center leading-tight w-28 h-8 flex items-center justify-center">
        {label}
      </span>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onChange(Math.max(0, value - 1))}
          className="w-11 h-11 rounded-full bg-spurs-navy text-white text-xl font-bold flex items-center justify-center active:scale-95 transition-transform"
        >
          −
        </button>
        <span className="w-10 text-center text-3xl font-black text-spurs-navy tabular-nums">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onChange(Math.min(20, value + 1))}
          className="w-11 h-11 rounded-full bg-spurs-navy text-white text-xl font-bold flex items-center justify-center active:scale-95 transition-transform"
        >
          +
        </button>
      </div>
    </div>
  )
}
