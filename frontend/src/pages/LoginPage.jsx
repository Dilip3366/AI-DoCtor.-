import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Heart, Eye, EyeOff, Loader2 } from 'lucide-react'
import useAuthStore from '../hooks/useAuthStore'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPw, setShowPw] = useState(false)
  const { login, isLoading } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const user = await login(form.email, form.password)
      toast.success(`Welcome back, ${user.name.split(' ')[0]}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    }
  }

  const demoLogin = async (role) => {
    const creds = {
      admin: { email: 'admin@clinic.com', password: 'Admin@123' },
      doctor: { email: 'doctor@clinic.com', password: 'Doctor@123' },
      patient: { email: 'patient@clinic.com', password: 'Patient@123' },
    }
    setForm(creds[role])
    try {
      const user = await login(creds[role].email, creds[role].password)
      toast.success(`Logged in as ${role}!`)
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-accent-400/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-primary-600 rounded-2xl items-center justify-center shadow-lg mb-4">
            <Heart className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-slate-800">Doctor AI Clinic</h1>
          <p className="text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <div className="card shadow-xl border-0">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email</label>
              <input
                type="email" className="input" placeholder="you@email.com" required
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'} className="input pr-10" placeholder="••••••••" required
                  value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <button type="submit" disabled={isLoading} className="btn-primary w-full flex items-center justify-center gap-2">
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6">
            <p className="text-xs text-slate-400 text-center mb-3">Quick demo login:</p>
            <div className="grid grid-cols-3 gap-2">
              {['admin', 'doctor', 'patient'].map((role) => (
                <button key={role} onClick={() => demoLogin(role)} disabled={isLoading}
                  className="text-xs py-2 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 capitalize font-medium text-slate-600 transition-colors">
                  {role}
                </button>
              ))}
            </div>
          </div>

          <p className="text-center text-sm text-slate-500 mt-5">
            No account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:underline">Register</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
