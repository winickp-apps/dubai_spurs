import { Link } from 'react-router-dom'
import { Trophy, Shield } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-spurs-navy text-white px-4 pt-safe-top">
      <div className="max-w-lg mx-auto flex items-center justify-between py-3">
        <Link to="/" className="flex items-center gap-3">
          <img src="/logo.jpeg" alt="Dubai Spurs" className="h-10 w-10 rounded-full object-cover" />
          <div className="leading-tight">
            <div className="font-bold text-sm tracking-wide">DUBAI SPURS</div>
            <div className="text-xs text-blue-200 font-medium">Score Predictor</div>
          </div>
        </Link>
        <div className="flex items-center gap-3">
          <Link to="/winners" className="flex items-center gap-1 text-xs text-blue-200 hover:text-white transition-colors py-2 px-1">
            <Trophy size={15} />
            <span>Winners</span>
          </Link>
          <Link to="/admin" className="flex items-center gap-1 text-xs text-blue-300 hover:text-white transition-colors py-2 px-1">
            <Shield size={15} />
            <span>Admin</span>
          </Link>
        </div>
      </div>
    </header>
  )
}
