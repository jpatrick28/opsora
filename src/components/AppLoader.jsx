import {
  Bot,
  LoaderCircle,
} from 'lucide-react'

function AppLoader() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f4f6f8]">
      <div className="text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-white">
          <Bot size={24} />
        </span>

        <LoaderCircle
          size={22}
          className="mx-auto mt-5 animate-spin text-indigo-600"
        />

        <p className="mt-3 text-sm font-semibold text-slate-600">
          Loading Opsora...
        </p>
      </div>
    </main>
  )
}

export default AppLoader