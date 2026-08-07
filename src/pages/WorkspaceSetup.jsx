import { useState } from 'react'
import {
  Bot,
  LoaderCircle,
  LogOut,
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'

function WorkspaceSetup() {
  const {
    user,
    createInitialWorkspace,
    signOut,
  } = useAuth()

  const [name, setName] = useState(
    'Synervant Operations',
  )

  const [slug, setSlug] = useState(
    'synervant-operations',
  )

  const [loading, setLoading] =
    useState(false)

  const [error, setError] = useState('')

  function updateName(value) {
    setName(value)

    setSlug(
      value
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, ''),
    )
  }

  async function handleSubmit(event) {
    event.preventDefault()

    if (!name.trim() || !slug.trim()) {
      setError(
        'Enter a workspace name and slug.',
      )
      return
    }

    setLoading(true)
    setError('')

    try {
      await createInitialWorkspace({
        name: name.trim(),
        slug: slug.trim(),
      })
    } catch (setupError) {
      console.error(
        'Workspace setup error:',
        setupError,
      )

      setError(
        setupError.message ||
          'Unable to create the workspace.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8] p-5 text-slate-900">
      <section className="w-full max-w-xl rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-8">
        <div className="flex items-start justify-between gap-5">
          <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <Bot size={22} />
          </span>

          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-[40px] items-center gap-2 rounded-xl border border-slate-200 px-3 text-xs font-semibold text-slate-600"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>

        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-indigo-500">
          Initial setup
        </p>

        <h1 className="mt-3 text-3xl font-bold tracking-[-0.04em]">
          Create your first workspace
        </h1>

        <p className="mt-3 text-sm leading-7 text-slate-500">
          Signed in as {user?.email}. This
          workspace will contain your
          automations, connections, alerts and
          team members.
        </p>

        <form
          onSubmit={handleSubmit}
          className="mt-7 space-y-5"
        >
          <div>
            <label
              htmlFor="workspace-name"
              className="text-xs font-semibold"
            >
              Workspace name
            </label>

            <input
              id="workspace-name"
              type="text"
              value={name}
              onChange={(event) =>
                updateName(event.target.value)
              }
              required
              className="mt-2 min-h-[48px] w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label
              htmlFor="workspace-slug"
              className="text-xs font-semibold"
            >
              Workspace slug
            </label>

            <input
              id="workspace-slug"
              type="text"
              value={slug}
              onChange={(event) =>
                setSlug(
                  event.target.value
                    .toLowerCase()
                    .replace(
                      /[^a-z0-9-]/g,
                      '',
                    ),
                )
              }
              required
              className="mt-2 min-h-[48px] w-full rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-indigo-500"
            />

            <p className="mt-2 text-xs text-slate-400">
              Lowercase letters, numbers and
              hyphens only.
            </p>
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
          >
            {loading && (
              <LoaderCircle
                size={17}
                className="animate-spin"
              />
            )}

            {loading
              ? 'Creating workspace...'
              : 'Create workspace'}
          </button>
        </form>
      </section>
    </main>
  )
}

export default WorkspaceSetup