import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Shield, User, Mail, Phone, Globe, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react'
import { authServices } from '../services/requests/authServices'

const COUNTRIES = [
  { value: '', label: 'Select country' },
  { value: 'UAE', label: 'UAE' },
  { value: 'USA', label: 'USA' },
  { value: 'UK', label: 'UK' },
  { value: 'INDIA', label: 'India' },
]

function OwnerRegistration() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    country: '',
    password: '',
    confirmPassword: '',
  })

  const handleChange = (e) => {
    setError('')
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (!formData.country) {
      setError('Please select a country.')
      return
    }

    setLoading(true)
    try {
      await authServices.registerOwner({
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        country: formData.country,
        password: formData.password,
      })
      navigate('/login', { state: { registered: true } })
    } catch (err) {
      const detail = err.response?.data?.detail
      const message = Array.isArray(detail)
        ? detail.join(' ')
        : typeof detail === 'string'
          ? detail
          : 'Registration failed. Please check your details and try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F5F3FF]">
      {/* Left: Lavender illustration panel */}
      <div className="hidden lg:flex lg:w-[45%] min-h-screen bg-gradient-to-br from-[#E6E6FA] via-[#DDD6FE] to-[#C4B5FD] flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_70%_80%,rgba(167,139,250,0.3)_0%,transparent_50%)]" />
        <div className="absolute top-0 left-0 right-0 h-1/3 bg-gradient-to-b from-[#A78BFA]/20 to-transparent" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <div className="w-40 h-40 rounded-3xl bg-white/90 shadow-xl flex items-center justify-center mb-8">
            <Shield className="w-20 h-20 text-[#7C3AED]" strokeWidth={1.5} />
          </div>
          <h2 className="text-2xl font-bold text-[#4C1D95] mb-2">Join HomeGuard</h2>
          <p className="text-[#6D28D9]/80 max-w-xs">
            Create your account to manage properties and schedule inspections.
          </p>
        </div>
      </div>

      {/* Right: White form panel */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 overflow-y-auto">
        <div className="w-full max-w-[420px] bg-white rounded-3xl shadow-lg shadow-slate-200/50 p-8 sm:p-10 my-6">
          <Link to="/" className="inline-flex items-center gap-2 text-[#1F2937] font-bold text-lg mb-6">
            <span className="w-8 h-8 rounded-lg bg-[#E9D5FF] flex items-center justify-center">
              <Shield className="w-4 h-4 text-[#7C3AED]" strokeWidth={2} />
            </span>
            HomeGuard
          </Link>

          <h1 className="text-2xl sm:text-3xl font-bold text-[#1F2937] mb-2">Create account</h1>
          <p className="text-slate-500 text-sm mb-6">Enter your details to get started.</p>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-xl bg-[#FEE2E2] border border-[#FECACA] text-[#B91C1C] px-4 py-3 text-sm">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Full name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  name="full_name"
                  required
                  placeholder="John Doe"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
                />
              </div>
            </div>

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
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Phone</label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="+1 234 567 8900"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Country</label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
                <select
                  name="country"
                  required
                  value={formData.country}
                  onChange={handleChange}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA] appearance-none cursor-pointer"
                >
                  {COUNTRIES.map((c) => (
                    <option key={c.value || 'empty'} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
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
                  minLength={6}
                  placeholder="Password (min 6 characters)"
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

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Confirm password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  name="confirmPassword"
                  required
                  placeholder="Repeat password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full pl-10 pr-11 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#C4B5FD] focus:border-[#A78BFA]"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-[#A78BFA] text-white font-semibold hover:bg-[#9333EA] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm mt-2"
            >
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-slate-600 text-xs mt-6">
            By creating an account you agree to HomeGuard's{' '}
            <Link to="/" className="text-[#7C3AED] font-medium hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/" className="text-[#7C3AED] font-medium hover:underline">Privacy Policy</Link>.
          </p>

          <p className="text-center text-slate-600 text-sm mt-6">
            Have an account?{' '}
            <Link to="/login" className="font-semibold text-[#7C3AED] hover:underline">
              Log in
            </Link>
          </p>
          <p className="text-center mt-2">
            <Link to="/" className="text-slate-400 text-sm hover:text-[#7C3AED]">
              ← Back to home
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default OwnerRegistration
