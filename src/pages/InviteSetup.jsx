import {
  useEffect,
  useState,
} from 'react'

import {
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  UserRound,
} from 'lucide-react'

import { useAuth } from '../context/AuthContext'

function InviteSetup() {
  const {
    user,
    profile,
    pendingInvitation,
    completeInvite,
  } = useAuth()

  const [fullName, setFullName] =
    useState('')

  const [password, setPassword] =
    useState('')

  const [
    confirmPassword,
    setConfirmPassword,
  ] = useState('')

  const [
    showPassword,
    setShowPassword,
  ] = useState(false)

  const [saving, setSaving] =
    useState(false)

  const [error, setError] =
    useState('')

  useEffect(() => {
    const defaultName =
      pendingInvitation
        ?.invited_name ||
      profile?.full_name ||
      user?.user_metadata
        ?.full_name ||
      ''

    setFullName(defaultName)
  }, [
    pendingInvitation,
    profile,
    user,
  ])

  async function handleSubmit(
    event,
  ) {
    event.preventDefault()

    setError('')

    if (!fullName.trim()) {
      setError(
        'Full name is required.',
      )

      return
    }

    if (password.length < 8) {
      setError(
        'Password must be at least 8 characters.',
      )

      return
    }

    if (
      password !==
      confirmPassword
    ) {
      setError(
        'Passwords do not match.',
      )

      return
    }

    setSaving(true)

    try {
      await completeInvite({
        fullName:
          fullName.trim(),
        password,
      })
    } catch (submitError) {
      console.error(
        'Unable to complete invitation:',
        submitError,
      )

      setError(
        submitError.message ||
          'Unable to complete your account.',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="grid min-h-screen lg:grid-cols-[0.95fr_1.05fr]">
      <section className="hidden bg-[#101827] p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-600">
              <CheckCircle2
                size={20}
              />
            </span>

            <div>
              <p className="text-lg font-bold">
                Opsora
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                Automation operations
              </p>
            </div>
          </div>
        </div>

        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-400">
            Workspace invitation
          </p>

          <h1 className="mt-5 text-4xl font-bold leading-tight tracking-[-0.05em]">
            Join your automation
            operations workspace.
          </h1>

          <p className="mt-6 max-w-lg text-sm leading-7 text-slate-400">
            Complete your account to
            access the workspace,
            automations, execution logs
            and operational analytics.
          </p>
        </div>

        <p className="text-xs text-slate-600">
          Secure workspace access
          powered by Supabase.
        </p>
      </section>

      <section className="flex items-center justify-center bg-slate-50 px-5 py-12">
        <div className="w-full max-w-[460px]">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
            Invitation accepted
          </p>

          <h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] text-slate-950">
            Complete your account
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-500">
            Set your name and password
            to finish joining
            {pendingInvitation
              ?.workspaces?.name
              ? ` ${pendingInvitation.workspaces.name}.`
              : ' the workspace.'}
          </p>

          {user?.email && (
            <div className="mt-6 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-indigo-500">
                Invited email
              </p>

              <p className="mt-1 text-sm font-semibold text-indigo-900">
                {user.email}
              </p>
            </div>
          )}

          <form
            onSubmit={
              handleSubmit
            }
            className="mt-7 space-y-5"
          >
            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Full name
              </span>

              <div className="mt-2 flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-500">
                <UserRound
                  size={16}
                  className="text-slate-400"
                />

                <input
                  type="text"
                  value={fullName}
                  onChange={(
                    event,
                  ) =>
                    setFullName(
                      event.target
                        .value,
                    )
                  }
                  autoComplete="name"
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Your full name"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Create password
              </span>

              <div className="mt-2 flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-500">
                <LockKeyhole
                  size={16}
                  className="text-slate-400"
                />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={password}
                  onChange={(
                    event,
                  ) =>
                    setPassword(
                      event.target
                        .value,
                    )
                  }
                  autoComplete="new-password"
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="At least 8 characters"
                />

                <button
                  type="button"
                  onClick={() =>
                    setShowPassword(
                      (current) =>
                        !current,
                    )
                  }
                  className="text-slate-400"
                >
                  {showPassword ? (
                    <EyeOff
                      size={16}
                    />
                  ) : (
                    <Eye
                      size={16}
                    />
                  )}
                </button>
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-semibold text-slate-700">
                Confirm password
              </span>

              <div className="mt-2 flex min-h-[48px] items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 focus-within:border-indigo-500">
                <LockKeyhole
                  size={16}
                  className="text-slate-400"
                />

                <input
                  type={
                    showPassword
                      ? 'text'
                      : 'password'
                  }
                  value={
                    confirmPassword
                  }
                  onChange={(
                    event,
                  ) =>
                    setConfirmPassword(
                      event.target
                        .value,
                    )
                  }
                  autoComplete="new-password"
                  className="w-full bg-transparent text-sm outline-none"
                  placeholder="Repeat password"
                />
              </div>
            </label>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving ? (
                <>
                  <LoaderCircle
                    size={17}
                    className="animate-spin"
                  />
                  Joining workspace...
                </>
              ) : (
                'Join workspace'
              )}
            </button>
          </form>
        </div>
      </section>
    </main>
  )
}

export default InviteSetup