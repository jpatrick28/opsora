import { useEffect, useState } from 'react'
import {
  Save,
  UserPlus,
  X,
} from 'lucide-react'

const initialForm = {
  name: '',
  email: '',
  role: 'Viewer',
  department: '',
  status: 'Invited',
}

const roles = [
  'Administrator',
  'Developer',
  'Analyst',
  'Viewer',
]

const departments = [
  'Automation Operations',
  'Client Operations',
  'Technical Operations',
  'Reporting',
  'Client Success',
  'Other',
]

function TeamMemberModal({
  isOpen,
  member,
  darkMode,
  onClose,
  onSave,
}) {
  const [formData, setFormData] =
    useState(initialForm)

  const [error, setError] = useState('')

  const isEditing = Boolean(member)

  useEffect(() => {
    if (!isOpen) {
      return undefined
    }

    setFormData(
      member
        ? {
            name: member.name || '',
            email: member.email || '',
            role: member.role || 'Viewer',
            department:
              member.department || '',
            status: member.status || 'Active',
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
  }, [isOpen, member, onClose])

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
      !formData.email.trim() ||
      !formData.department
    ) {
      setError(
        'Complete the name, email and department fields.',
      )

      return
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        formData.email.trim(),
      )
    ) {
      setError(
        'Enter a valid email address.',
      )

      return
    }

    onSave({
      ...formData,
      name: formData.name.trim(),
      email: formData.email
        .trim()
        .toLowerCase(),
    })
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
      <button
        type="button"
        onClick={onClose}
        aria-label="Close team member modal"
        className="absolute inset-0 bg-slate-950/65 backdrop-blur-sm"
      />

      <section
        role="dialog"
        aria-modal="true"
        aria-labelledby="team-member-modal-title"
        className={`relative z-10 w-full max-w-xl rounded-3xl border shadow-2xl ${
          darkMode
            ? 'border-slate-700 bg-slate-800 text-white'
            : 'border-slate-200 bg-white text-slate-900'
        }`}
      >
        <header className="flex items-start justify-between gap-5 border-b border-inherit px-6 py-5">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-300">
              <UserPlus size={20} />
            </span>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-500">
                Workspace member
              </p>

              <h2
                id="team-member-modal-title"
                className="mt-1 text-xl font-bold"
              >
                {isEditing
                  ? 'Edit team member'
                  : 'Invite team member'}
              </h2>

              <p
                className={`mt-1 text-xs ${
                  darkMode
                    ? 'text-slate-400'
                    : 'text-slate-500'
                }`}
              >
                Configure access, role and
                department information.
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
            label="Full name"
            name="name"
            type="text"
            value={formData.name}
            onChange={handleChange}
            placeholder="Team member name"
            darkMode={darkMode}
          />

          <FormField
            label="Email address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="member@example.com"
            darkMode={darkMode}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              options={roles}
              darkMode={darkMode}
            />

            <SelectField
              label="Department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              options={departments}
              placeholder="Select department"
              darkMode={darkMode}
            />
          </div>

          {isEditing && (
            <SelectField
              label="Member status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                'Active',
                'Invited',
                'Suspended',
              ]}
              darkMode={darkMode}
            />
          )}

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
                : 'Send invitation'}
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
  type,
  value,
  onChange,
  placeholder,
  darkMode,
}) {
  return (
    <div>
      <label
        htmlFor={`team-${name}`}
        className="text-xs font-semibold"
      >
        {label}
      </label>

      <input
        id={`team-${name}`}
        type={type}
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
        htmlFor={`team-${name}`}
        className="text-xs font-semibold"
      >
        {label}
      </label>

      <select
        id={`team-${name}`}
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

export default TeamMemberModal