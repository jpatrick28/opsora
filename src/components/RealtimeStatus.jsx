import {
  CircleDot,
  LoaderCircle,
  WifiOff,
} from 'lucide-react'

import { useRealtimeStatus } from '../hooks/useRealtimeStatus'

function RealtimeStatus({
  darkMode = false,
}) {
  const status =
    useRealtimeStatus()

  const config = {
    connected: {
      label: 'Live',
      icon: CircleDot,
      className:
        'text-emerald-500',
    },

    connecting: {
      label: 'Connecting',
      icon: LoaderCircle,
      className:
        'text-amber-500',
    },

    disconnected: {
      label: 'Offline',
      icon: WifiOff,
      className:
        'text-slate-400',
    },

    error: {
      label: 'Realtime error',
      icon: WifiOff,
      className:
        'text-rose-500',
    },
  }

  const current =
    config[status] ||
    config.connecting

  const Icon = current.icon

  return (
    <div
      title={`Supabase realtime: ${current.label}`}
      className={`inline-flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11px] font-semibold ${
        darkMode
          ? 'border-slate-700 bg-slate-800'
          : 'border-slate-200 bg-white'
      }`}
    >
      <Icon
        size={13}
        className={`${current.className} ${
          status ===
          'connecting'
            ? 'animate-spin'
            : ''
        }`}
      />

      <span
        className={
          darkMode
            ? 'text-slate-300'
            : 'text-slate-600'
        }
      >
        {current.label}
      </span>
    </div>
  )
}

export default RealtimeStatus