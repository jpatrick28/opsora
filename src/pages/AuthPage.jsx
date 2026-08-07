import { useState } from 'react'
import {
  Bot,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  User,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function AuthPage() {
  const {
    signIn,
    signUp,
  } = useAuth()

  const [mode, setMode] =
    useState('sign-in')

  const [formData, setFormData] =
    useState({
      fullName: '',
      email: '',
      password: '',
    })

  const [showPassword, setShowPassword] =
    useState(false)

  const [loading, setLoading] =
    useState(false)

  const [error, setError] = useState('')
  const [message, setMessage] =
    useState('')

  function updateField(event) {
    const { name, value } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    setError('')
    setMessage('')
  }

  function switchMode(nextMode) {
    setMode(nextMode)
    setError('')
    setMessage('')
  }

  async function handleSubmit(event) {
    event.preventDefault()

    const email = formData.email
      .trim()
      .toLowerCase()

    if (
      mode === 'sign-up' &&
      !formData.fullName.trim()
    ) {
      setError('Enter your full name.')
      return
    }

    if (!email || !formData.password) {
      setError(
        'Enter your email and password.',
      )
      return
    }

    if (formData.password.length < 8) {
      setError(
        'Password must contain at least 8 characters.',
      )
      return
    }

    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (mode === 'sign-up') {
        const data = await signUp({
          fullName:
            formData.fullName.trim(),
          email,
          password: formData.password,
        })

        if (!data.session) {
          setMessage(
            'Account created. Check your email to confirm your account, then sign in.',
          )

          setMode('sign-in')
          setFormData((current) => ({
            ...current,
            password: '',
          }))
        }
      } else {
        await signIn({
          email,
          password: formData.password,
        })
      }
    } catch (submitError) {
      console.error(
        'Authentication error:',
        submitError,
      )

      setError(
        submitError.message ||
          'Unable to authenticate.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-[#f4f6f8] text-slate-900">
      <section className="hidden w-[48%] flex-col justify-between bg-[#111827] p-12 text-white lg:flex">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
            <Bot size={21} />
          </span>

          <div>
            <p className="font-bold">
              Opsora
            </p>

            <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.16em] text-slate-500">
              Automation operations
            </p>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
            Operational command center
          </p>

          <h1 className="mt-5 text-5xl font-bold leading-[1.08] tracking-[-0.05em]">
            Monitor every automation from one
            workspace.
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-slate-400">
            Track workflow health, inspect
            execution failures, manage
            integrations and coordinate your
            automation team.
          </p>
        </div>

        <p className="text-xs text-slate-600">
          Secure workspace access powered by
          Supabase.
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center p-5 sm:p-8">
        <div className="w-full max-w-md">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600 text-white">
              <Bot size={21} />
            </span>

            <p className="font-bold">
              Opsora
            </p>
          </div>

          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
            {mode === 'sign-in'
              ? 'Welcome back'
              : 'Create your account'}
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
            {mode === 'sign-in'
              ? 'Sign in to Opsora'
              : 'Start your workspace'}
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            {mode === 'sign-in'
              ? 'Enter your account credentials to continue.'
              : 'Create an account before configuring your first automation workspace.'}
          </p>

          <div className="mt-7 grid grid-cols-2 rounded-xl bg-slate-200 p-1">
            <AuthTab
              label="Sign in"
              active={mode === 'sign-in'}
              onClick={() =>
                switchMode('sign-in')
              }
            />

            <AuthTab
              label="Create account"
              active={mode === 'sign-up'}
              onClick={() =>
                switchMode('sign-up')
              }
            />
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5"
          >
            {mode === 'sign-up' && (
              <AuthField
                label="Full name"
                name="fullName"
                type="text"
                value={formData.fullName}
                onChange={updateField}
                placeholder="Your full name"
                icon={<User size={17} />}
                autoComplete="name"
              />
            )}

            <AuthField
              label="Email address"
              name="email"
              type="email"
              value={formData.email}
              onChange={updateField}
              placeholder="you@example.com"
              icon={<Mail size={17} />}
              autoComplete="email"
            />

            <div>
              <label
                htmlFor="auth-password"
                className="text-xs font-semibold"
              >
                Password
              </label>

              <div className="relative mt-2">
                <LockKeyhole
                  size={17}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  id="auth-password"
                  name="password"
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={formData.password}
                  onChange={updateField}
                  placeholder="At least 8 characters"
                  autoComplete={
                    mode === 'sign-in'
                      ? 'current-password'
                      : 'new-password'
                  }
                  required
                  className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white pl-11 pr-12 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) => !current,
                    )
                  }
                  aria-label={
                    showPassword
                      ? 'Hide password'
                      : 'Show password'
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              >
                {error}
              </div>
            )}

            {message && (
              <div
                role="status"
                className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700"
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && (
                <LoaderCircle
                  size={17}
                  className="animate-spin"
                />
              )}

              {loading
                ? 'Please wait...'
                : mode === 'sign-in'
                  ? 'Sign in'
                  : 'Create account'}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

function AuthTab({
  label,
  active,
  onClick,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`min-h-[40px] rounded-lg text-xs font-semibold transition ${
        active
          ? 'bg-white text-slate-900 shadow-sm'
          : 'text-slate-500'
      }`}
    >
      {label}
    </button>
  )
}

function AuthField({
  label,
  name,
  type,
  value,
  onChange,
  placeholder,
  icon,
  autoComplete,
}) {
  return (
    <div>
      <label
        htmlFor={`auth-${name}`}
        className="text-xs font-semibold"
      >
        {label}
      </label>

      <div className="relative mt-2">
        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>

        <input
          id={`auth-${name}`}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          autoComplete={autoComplete}
          required
          className="min-h-[48px] w-full rounded-xl border border-slate-200 bg-white pl-11 pr-4 text-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500"
        />
      </div>
    </div>
  )
}

export default AuthPage