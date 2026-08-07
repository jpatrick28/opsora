import { useEffect, useState } from 'react'
import {
  BellRing,
  Save,
  X,
} from 'lucide-react'

const initialForm = {
  name: '',
  description: '',
  trigger: '',
  severity: 'Medium',
  channel: 'In-app',
  recipient: '',
  status: 'Enabled',
}

const severityOptions = [
  'Critical',
  'High',
  'Medium',
  'Low',
]

const channelOptions = [
  'In-app',
  'Email',
  'Slack',
  'Webhook',
]

function AlertRuleModal({
  isOpen,
  rule,
  darkMode,
  onClose,
  onSave,
}) {
  const [formData, setFormData] =
    useState(initialForm)

  const [error, setError] = useState('')

  const isEditing = Boolean(rule)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    setFormData(
      rule
        ? {
            name: rule.name || '',
            description:
              rule.description || '',
            trigger: rule.trigger || '',
            severity:
              rule.severity || 'Medium',
            channel:
              rule.channel || 'In-app',
            recipient:
              rule.recipient || '',
            status:
              rule.status || 'Enabled',
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
  }, [isOpen, rule, onClose])

  if (!isOpen) {
    return null
  }

  function handleChange(event) {
    const { name, value } = event.target

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
      !formData.trigger.trim() ||
      !formData.recipient.trim()
    ) {
      setError(
        'Complete the rule name, trigger and recipient fields.',
      )

      return
    }

    onSave({
      ...formData,
      name: formData.name.trim(),
      description:
        formData.description.trim(),
      trigger: formData.trigger.trim(),
      recipient:
        formData.recipient.trim(),
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close alert rule modal"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="alert-rule-modal-title"
        className={`opsora-scrollbar relative z-10 max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-3xl border shadow-2xl ${
          darkMode
            ? 'border-slate-700 bg-slate-800 text-white'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <header className="flex items-start justify-between gap-5 border-b border-inherit px-6 py-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              <BellRing size={20} />
            </span>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Monitoring rule
              </p>

              <h2
                id="alert-rule-modal-title"
                className="mt-1 text-xl font-bold"
              >
                {isEditing
                  ? 'Edit alert rule'
                  : 'Create alert rule'}
              </h2>

              <p
                className={`mt-1 text-xs ${
                  darkMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Configure the trigger,
                severity, destination and
                operating status.
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
            label="Rule name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Example: Repeated automation failures"
            darkMode={darkMode}
          />

          <div>
            <label
              htmlFor="alert-description"
              className="text-xs font-semibold"
            >
              Description
            </label>

            <textarea
              id="alert-description"
              name="description"
              rows="4"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe when and why this alert should be sent."
              className={`mt-2 w-full resize-none rounded-xl border px-4 py-3 text-sm leading-6 outline-none ${
                darkMode
                  ? 'border-slate-700 bg-slate-900 placeholder:text-slate-600 focus:border-indigo-500'
                  : 'border-slate-200 bg-white placeholder:text-slate-400 focus:border-indigo-500'
              }`}
            />
          </div>

          <FormField
            label="Trigger condition"
            name="trigger"
            value={formData.trigger}
            onChange={handleChange}
            placeholder="Example: 3 failures within 30 minutes"
            darkMode={darkMode}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Severity"
              name="severity"
              value={formData.severity}
              onChange={handleChange}
              options={severityOptions}
              darkMode={darkMode}
            />

            <SelectField
              label="Notification channel"
              name="channel"
              value={formData.channel}
              onChange={handleChange}
              options={channelOptions}
              darkMode={darkMode}
            />
          </div>

          <FormField
            label="Recipient or destination"
            name="recipient"
            value={formData.recipient}
            onChange={handleChange}
            placeholder="Email, Slack channel or webhook destination"
            darkMode={darkMode}
          />

          <SelectField
            label="Rule status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            options={[
              'Enabled',
              'Disabled',
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
                : 'Create rule'}
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
        htmlFor={`alert-${name}`}
        className="text-xs font-semibold"
      >
        {label}
      </label>

      <input
        id={`alert-${name}`}
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
  darkMode,
}) {
  return (
    <div>
      <label
        htmlFor={`alert-${name}`}
        className="text-xs font-semibold"
      >
        {label}
      </label>

      <select
        id={`alert-${name}`}
        name={name}
        value={value}
        onChange={onChange}
        className={`mt-2 min-h-[44px] w-full rounded-xl border px-4 text-sm outline-none ${
          darkMode
            ? 'border-slate-700 bg-slate-900 focus:border-indigo-500'
            : 'border-slate-200 bg-white focus:border-indigo-500'
        }`}
      >
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

export default AlertRuleModal