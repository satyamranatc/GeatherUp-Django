import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, EyeOff, AlertCircle } from 'lucide-react'
import api, { getApiError } from '../api/client.js'

export default function Auth({ isLoggedIn, onAuthSuccess }) {
  const navigate = useNavigate()
  const [mode, setMode] = useState('login')
  const [showPassword, setShowPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isLoggedIn) {
      navigate('/profile')
    }
  }, [isLoggedIn, navigate])

  const switchMode = (nextMode) => {
    setMode(nextMode)
    setError('')
  }

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    const form = e.currentTarget
    const data = {
      email: form.email.value.trim(),
      password: form.password.value,
    }

    try {
      const res = await api.post('/api/userApp/login', data)
      onAuthSuccess(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(getApiError(err, 'Invalid email or password.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  async function handleSignUp(e) {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)
    const form = e.currentTarget
    const data = {
      fullName: form.fullName.value.trim(),
      bio: form.bio.value.trim(),
      avatar: form.avatar.value.trim(),
      email: form.email.value.trim(),
      password: form.password.value,
    }

    try {
      const res = await api.post('/api/userApp/register', data)
      onAuthSuccess(res.data.user, res.data.token)
      navigate('/')
    } catch (err) {
      setError(getApiError(err, 'Could not create account. Check your details.'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const inputClass =
    'w-full px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg outline-none focus:border-[#008080] focus:ring-2 focus:ring-[#B2D8D8]/60 transition'

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-slate-900 tracking-tight">
            {mode === 'login' ? 'Welcome back' : 'Create your account'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {mode === 'login'
              ? 'Sign in to share posts, like, and join discussions.'
              : 'Join GatherUp and share moments with the community.'}
          </p>
        </div>

        {/* Mode Tabs */}
        <div className="grid grid-cols-2 gap-1 p-1 bg-[#F3F6F6] rounded-xl mb-6">
          <button
            type="button"
            onClick={() => switchMode('login')}
            className={`py-2 text-sm font-medium rounded-lg transition ${
              mode === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => switchMode('register')}
            className={`py-2 text-sm font-medium rounded-lg transition ${
              mode === 'register'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="flex items-start gap-2.5 p-3 mb-5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-sm">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {mode === 'login' ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
              <input
                className={inputClass}
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input
                  className={`${inputClass} pr-10`}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-[#008080] text-white text-sm font-semibold hover:bg-[#006666] transition disabled:opacity-50"
            >
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Full Name</label>
              <input
                className={inputClass}
                name="fullName"
                type="text"
                required
                placeholder="Satyam Rana"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">Email</label>
              <input
                className={inputClass}
                name="email"
                type="email"
                required
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Password <span className="text-slate-400 font-normal">(min 6 characters)</span>
              </label>
              <div className="relative">
                <input
                  className={`${inputClass} pr-10`}
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  minLength={6}
                  required
                  placeholder="Create a password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Bio <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                className={inputClass}
                name="bio"
                type="text"
                placeholder="A short line about you"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1.5">
                Avatar URL <span className="text-slate-400 font-normal">(optional)</span>
              </label>
              <input
                className={inputClass}
                name="avatar"
                type="url"
                placeholder="https://..."
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 rounded-lg bg-[#008080] text-white text-sm font-semibold hover:bg-[#006666] transition disabled:opacity-50"
            >
              {isSubmitting ? 'Creating account...' : 'Create Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
