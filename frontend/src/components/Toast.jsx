import React from 'react'
import { CheckCircle2, X } from 'lucide-react'

export default function Toast({ message, onClose }) {
  if (!message) return null

  return (
    <div className="fixed bottom-5 right-5 z-50 animate-fade-up">
      <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-900 text-white text-sm font-medium shadow-lg border border-slate-800">
        <CheckCircle2 className="w-4 h-4 text-[#66B2B2] shrink-0" />
        <span>{message}</span>
        <button
          type="button"
          onClick={onClose}
          className="ml-1 text-slate-400 hover:text-white transition"
          aria-label="Close notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
