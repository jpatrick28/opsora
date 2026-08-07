import {
  useEffect,
  useState,
} from 'react'
import {
  CheckCircle2,
  LoaderCircle,
  XCircle,
} from 'lucide-react'
import { supabase } from '../lib/supabase'

function SupabaseConnectionTest({
  darkMode,
}) {
  const [status, setStatus] =
    useState('checking')

  const [message, setMessage] = useState(
    'Checking Supabase connection...',
  )

  useEffect(() => {
    let active = true

    async function testConnection() {
      try {
        const { error } =
          await supabase.auth.getSession()

        if (!active) {
          return
        }

        if (error) {
          throw error
        }

        setStatus('connected')
        setMessage(
          'Opsora is connected to Supabase.',
        )
      } catch (error) {
        if (!active) {
          return
        }

        console.error(
          'Supabase connection error:',
          error,
        )

        setStatus('failed')
        setMessage(
          error.message ||
            'Unable to connect to Supabase.',
        )
      }
    }

    testConnection()

    return () => {
      active = false
    }
  }, [])

  const styles = {
    checking: {
      icon: (
        <LoaderCircle
          size={18}
          className="animate-spin text-indigo-500"
        />
      ),
      box: darkMode
        ? 'border-indigo-500/20 bg-indigo-500/10'
        : 'border-indigo-200 bg-indigo-50',
    },
    connected: {
      icon: (
        <CheckCircle2
          size={18}
          className="text-emerald-500"
        />
      ),
      box: darkMode
        ? 'border-emerald-500/20 bg-emerald-500/10'
        : 'border-emerald-200 bg-emerald-50',
    },
    failed: {
      icon: (
        <XCircle
          size={18}
          className="text-rose-500"
        />
      ),
      box: darkMode
        ? 'border-rose-500/20 bg-rose-500/10'
        : 'border-rose-200 bg-rose-50',
    },
  }

  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 ${styles[status].box}`}
    >
      <span className="mt-0.5">
        {styles[status].icon}
      </span>

      <div>
        <p className="text-sm font-semibold">
          Supabase connection
        </p>

        <p
          className={`mt-1 text-xs ${
            darkMode
              ? 'text-slate-400'
              : 'text-slate-500'
          }`}
        >
          {message}
        </p>
      </div>
    </div>
  )
}

export default SupabaseConnectionTest