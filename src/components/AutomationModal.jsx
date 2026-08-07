import { useEffect, useState } from 'react'
import {
  Save,
  Workflow,
  X,
} from 'lucide-react'

const initialForm = {
  name: '',
  description: '',
  platform: '',
  trigger: '',
  owner: '',
  status: 'Active',
}

const platforms = [
  'GoHighLevel',
  'Zapier',
  'HubSpot',
  'Stripe',
  'Google Sheets',
  'Calendly',
  'Slack',
  'Gmail',
  'Meta',
  'Other',
]

const owners = [
  'J Patrick',
  'Ana Reyes',
  'Marco Lim',
]

function AutomationModal({
  isOpen,
  automation,
  darkMode,
  saving,
  onClose,
  onSave,
}) {
  const [formData, setFormData] =
    useState(initialForm)

  const [error, setError] = useState('')

  const isEditing = Boolean(automation)

  useEffect(() => {
    if (!isOpen) {
      return
    }

    setFormData(
      automation
        ? {
          name: automation.name || '',
          description:
            automation.description || '',
          platform:
            automation.platform || '',
          trigger:
            automation.trigger || '',
          owner: automation.owner || '',
          status: formatStatus(
            automation.status || 'draft',
          ),
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
  }, [isOpen, automation, onClose])

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
      !formData.trigger.trim() ||
      !formData.owner
    ) {
      setError(
        'Complete the name, platform, trigger and owner fields.',
      )

      return
    }

    onSave({
      ...formData,
      name: formData.name.trim(),
      description:
        formData.description.trim(),
      trigger: formData.trigger.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close automation modal"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="automation-modal-title"
        className={`opsora-scrollbar relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border shadow-2xl ${darkMode
          ? 'border-slate-700 bg-slate-800 text-white'
          : 'border-slate-200 bg-white text-slate-900'
          }`}
      >
        <header className="flex items-start justify-between gap-5 border-b border-inherit px-6 py-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              <Workflow size={20} />
            </span>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Workflow configuration
              </p>

              <h2
                id="automation-modal-title"
                className="mt-1 text-xl font-bold"
              >
                {isEditing
                  ? 'Edit automation'
                  : 'Create automation'}
              </h2>

              <p
                className={`mt-1 text-xs ${darkMode
                  ? 'text-slate-400'
                  : 'text-slate-500'
                  }`}
              >
                Configure the workflow identity,
                trigger, ownership and operating
                status.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border ${darkMode
              ? 'border-slate-700 text-slate-400 hover:bg-slate-900'
              : 'border-slate-200 text-slate-500 hover:bg-slate-50'
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
            label="Automation name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Example: New lead qualification"
            darkMode={darkMode}
            required
          />

          <div>
            <label
              htmlFor="automation-description"
              className="text-xs font-semibold"
            >
              Description
            </label>

            <textarea
              id="automation-description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe what this automation does."
              className={`mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none transition ${darkMode
                ? 'border-slate-700 bg-slate-900 text-white placeholder:text-slate-600 focus:border-indigo-500'
                : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
                }`}
            />
          </div>

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
              label="Owner"
              name="owner"
              value={formData.owner}
              onChange={handleChange}
              options={owners}
              placeholder="Select owner"
              darkMode={darkMode}
            />
          </div>

          <FormField
            label="Trigger"
            name="trigger"
            value={formData.trigger}
            onChange={handleChange}
            placeholder="Example: New form submission"
            darkMode={darkMode}
            required
          />

          <SelectField
            label="Operating status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              'Active',
              'Paused',
              'Draft',
            ]}
            darkMode={darkMode}
          />

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
              className={`min-h-[44px] rounded-xl border px-5 text-sm font-semibold ${darkMode
                ? 'border-slate-700 text-slate-300 hover:bg-slate-900'
                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save size={16} />

              {saving
                ? 'Saving...'
                : isEditing
                  ? 'Save changes'
                  : 'Create automation'}
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
  required = false,
}) {
  return (
    <div>
      <label
        htmlFor={`automation-${name}`}
        className="text-xs font-semibold"
      >
        {label}
      </label>

      <input
        id={`automation-${name}`}
        name={name}
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`mt-2 min-h-[44px] w-full rounded-xl border px-4 text-sm outline-none transition ${darkMode
          ? 'border-slate-700 bg-slate-900 text-white placeholder:text-slate-600 focus:border-indigo-500'
          : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:border-indigo-500'
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
        htmlFor={`automation-${name}`}
        className="text-xs font-semibold"
      >
        {label}
      </label>

      <select
        id={`automation-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        required
        className={`mt-2 min-h-[44px] w-full rounded-xl border px-4 text-sm outline-none transition ${darkMode
          ? 'border-slate-700 bg-slate-900 text-white focus:border-indigo-500'
          : 'border-slate-200 bg-white text-slate-900 focus:border-indigo-500'
          }`}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}

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


function formatStatus(status) {
  const normalized =
    String(status).toLowerCase()

  if (normalized === 'active') {
    return 'Active'
  }

  if (normalized === 'paused') {
    return 'Paused'
  }

  return 'Draft'
}
export default AutomationModal