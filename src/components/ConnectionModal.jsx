import { useEffect, useState } from 'react'
import {
  Plug,
  Save,
  X,
} from 'lucide-react'

const initialForm = {
  name: '',
  platform: '',
  category: '',
  account: '',
  owner: '',
  authType: '',
  description: '',
}

const platforms = [
  'GoHighLevel',
  'Zapier',
  'HubSpot',
  'Stripe',
  'Google Sheets',
  'Slack',
  'Calendly',
  'Gmail',
  'Meta',
  'Other',
]

const categories = [
  'CRM',
  'Automation',
  'Payments',
  'Data',
  'Communication',
  'Scheduling',
  'Marketing',
  'Other',
]

const owners = [
  'J Patrick',
  'Ana Reyes',
  'Marco Lim',
]

const authTypes = [
  'OAuth 2.0',
  'API key',
  'Restricted API key',
  'Webhook secret',
  'Service account',
]

function ConnectionModal({
  isOpen,
  connection,
  darkMode,
  onClose,
  onSave,
}) {
  const [formData, setFormData] =
    useState(initialForm)

  const [error, setError] = useState('')

  const isEditing = Boolean(connection)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    setFormData(
      connection
        ? {
            name: connection.name || '',
            platform:
              connection.platform || '',
            category:
              connection.category || '',
            account:
              connection.account || '',
            owner: connection.owner || '',
            authType:
              connection.authType || '',
            description:
              connection.description || '',
          }
        : initialForm,
    )

    setError('')

    const previousOverflow =
      document.body.style.overflow

    function handleEscape(event) {
      if (event.key === 'Escape') {
        onClose()
      }
    }

    document.body.style.overflow = 'hidden'
    window.addEventListener(
      'keydown',
      handleEscape,
    )

    return () => {
      document.body.style.overflow =
        previousOverflow

      window.removeEventListener(
        'keydown',
        handleEscape,
      )
    }
  }, [isOpen, connection, onClose])

  if (!isOpen) {
    return null
  }

  function handleChange(event) {
    const {
      name,
      value,
    } = event.target

    setFormData((current) => ({
      ...current,
      [name]: value,
    }))

    if (error) {
      setError('')
    }
  }

  function handleSubmit(event) {
    event.preventDefault()

    if (
      !formData.name.trim() ||
      !formData.platform ||
      !formData.category ||
      !formData.account.trim() ||
      !formData.owner ||
      !formData.authType
    ) {
      setError(
        'Complete all required connection fields.',
      )

      return
    }

    onSave({
      ...formData,
      name: formData.name.trim(),
      account: formData.account.trim(),
      description:
        formData.description.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close connection modal"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="connection-modal-title"
        className={`opsora-scrollbar relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border shadow-2xl ${
          darkMode
            ? 'border-slate-700 bg-slate-800 text-white'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <header className="flex items-start justify-between gap-5 border-b border-inherit px-6 py-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Plug size={20} />
            </span>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Platform connection
              </p>

              <h2
                id="connection-modal-title"
                className="mt-1 text-xl font-bold"
              >
                {isEditing
                  ? 'Edit connection'
                  : 'Add connection'}
              </h2>

              <p
                className={`mt-1 text-xs ${
                  darkMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Store connection metadata and
                ownership information for this
                workspace.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${
              darkMode
                ? 'border-slate-700 hover:bg-slate-900'
                : 'border-slate-200 hover:bg-slate-50'
            }`}
          >
            <X size={18} />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 p-6"
        >
          <FormField
            label="Connection name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Example: HubSpot Production"
            darkMode={darkMode}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Platform"
              name="platform"
              value={formData.platform}
              onChange={handleChange}
              options={platforms}
              placeholder="Select platform"
              darkMode={darkMode}
            />

            <SelectField
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={categories}
              placeholder="Select category"
              darkMode={darkMode}
            />
          </div>

          <FormField
            label="Connected account"
            name="account"
            value={formData.account}
            onChange={handleChange}
            placeholder="Workspace, account or email"
            darkMode={darkMode}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              options={owners}
              placeholder="Select owner"
              darkMode={darkMode}
            />

            <SelectField
              label="Authentication type"
              name="authType"
              value={formData.authType}
              onChange={handleChange}
              options={authTypes}
              placeholder="Select authentication"
              darkMode={darkMode}
            />
          </div>

          <div>
            <label
              htmlFor="connection-description"
              className="text-xs font-semibold"
            >
              Description
            </label>

            <textarea
              id="connection-description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe how this connection is used."
              className={`mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none ${
                darkMode
                  ? 'border-slate-700 bg-slate-900 placeholder:text-slate-600 focus:border-indigo-500'
                  : 'border-slate-200 bg-white placeholder:text-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>

          {error && (
            <div
              role="alert"
              className="rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-500"
            >
              {error}
            </div>
          )}

          <div className="flex flex-col-reverse gap-3 border-t border-inherit pt-5 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className={`min-h-[44px] rounded-xl border px-5 text-sm font-semibold ${
                darkMode
                  ? 'border-slate-700 hover:bg-slate-900'
                  : 'border-slate-200 hover:bg-slate-50'
              }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500"
            >
              <Save size={16} />

              {isEditing
                ? 'Save changes'
                : 'Add connection'}
            </button>
          </div>
        </form>
      </section>
    </div>
  )
}

function FormField({
  label,
  name,
  value,
  onChange,
  placeholder,
  darkMode,
}) {
  return (
    <div>
      <label
        htmlFor={`connection-${name}`}
        className="text-xs font-semibold"
      >
        {label}
      </label>

      <input
        id={`connection-${name}`}
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required
        className={`mt-2 min-h-[44px] w-full rounded-xl border px-4 text-sm outline-none ${
          darkMode
            ? 'border-slate-700 bg-slate-900 placeholder:text-slate-600 focus:border-indigo-500'
            : 'border-slate-200 bg-white placeholder:text-slate-400 focus:border-indigo-500'
        }`}
      />
    </div>
  )
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  placeholder,
  darkMode,
}) {
  return (
    <div>
      <label
        htmlFor={`connection-${name}`}
        className="text-xs font-semibold"
      >
        {label}
      </label>

      <select
        id={`connection-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        required
        className={`mt-2 min-h-[44px] w-full rounded-xl border px-4 text-sm outline-none ${
          darkMode
            ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
            : 'border-slate-200 bg-white focus:border-indigo-500'
        }`}
      >
        <option value="" disabled>
          {placeholder}
        </option>

        {options.map((option) => (
          <option
            key={option}
            value={option}
          >
            {option}
          </option>
        ))}
      </select>
    </div>
  )
}

export default ConnectionModal