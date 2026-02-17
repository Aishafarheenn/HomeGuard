import React, { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Shield, Mail, Lock, AlertCircle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { authServices } from '../services/requests/authServices'

function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { login } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [successMessage, setSuccessMessage] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({ email: '', password: '' })

  const from = location.state?.from?.pathname || '/dashboard'

  useEffect(() => {
    if (location.state?.registered) {
      setSuccessMessage('Account created. You can sign in now.')
    }
    if (location.state?.registeredInspector) {
      setSuccessMessage('Application submitted. You can sign in after an admin approves your account.')
    }
  }, [location.state])

  const handleChange = (e) => {
    setError('')
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await authServices.login(formData.email, formData.password)
      const token = res?.access_token
      if (!token) {
        setError('Invalid response from server.')
        return
      }
      const userData = login(token)
      if (!userData) {
        setError('Invalid token received.')
        return
      }
      navigate(from, { replace: true })
    } catch (err) {
      const message =
        err.response?.data?.detail ||
        (typeof err.message === 'string' ? err.message : 'Login failed. Check email and password.')
      setError(Array.isArray(message) ? message.join(' ') : message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F5F3FF]">
      {/* Left: Lavender illustration panel */}
      <div className="hidden lg:flex lg:w-[45%] min-h-screen bg-gradient-to-br from-[#E6E6FA] via-[#DDD6FE] to-[#C4B5FD] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(167,139,250,0.3)_0%,transparent_50%)]" />
        <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-[#A78BFA]/20 to-transparent" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-40 h-40 rounded-3xl bg-white/90 shadow-xl flex items-center justify-center mb-8">
            <Shield className="w-20 h-20 text-[#7C3AED]" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-[#4C1D95] mb-2">Welcome back</h2>
          <p className="text-[#6D28D9]/80 max-w-xs">
            Sign in to manage your properties and inspections with HomeGuard.
          </p>
        </div>
      </div>

      {/* Right: White form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-8 sm:p-10">
          <Link to="/" className="inline-flex items-center gap-2 text-[#1F2937] font-bold text-lg mb-8">
            <span className="w-8 h-8 rounded-lg bg-[#E9D5FF] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#7C3AED]" strokeWidth={2} />
            </span>
            HomeGuard
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-2">Log in</h1>
          <p className="text-slate-500 text-sm mb-6">Enter your credentials to access your account.</p>

          {successMessage && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#D1FAE5] border border-[#A7F3D0] text-[#065F46] px-4 py-3 text-sm">
              <CheckCircle className="w-4 h-4 shrink-0" />
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Email address"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#A78BFA] text-white font-semibold hover:bg-[#9333EA] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              {loading ? 'Signing in…' : 'Log in'}
            </button>
          </form>

          

          <p className="text-center text-slate-600 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register/owner" className="font-semibold text-[#7C3AED] hover:underline">
              Register as owner
            </Link>
            <span className="text-slate-400 mx-1">·</span>
            <Link to="/register/inspector" className="font-semibold text-[#7C3AED] hover:underline">
              Register as inspector
            </Link>
          </p>
          <p className="text-center mt-4">
            <Link to="/" className="text-slate-400 text-sm hover:text-[#7C3AED]">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
