import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-3 bg-paper px-4 text-center">
      <div className="w-14 h-14 rounded-full bg-hanko flex items-center justify-center text-white font-jp font-bold text-2xl">語</div>
      <h1 className="text-2xl font-bold">404 — Page not found</h1>
      <p className="text-sm text-ink-soft">This page doesn't exist, or has moved.</p>
      <Link to="/" className="btn-primary mt-2">Back to Home</Link>
    </div>
  )
}
