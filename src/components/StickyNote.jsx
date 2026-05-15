import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLongPress } from '../hooks/useLongPress'

export function StickyNote({ sticky, onDelete }) {
  const [pending, setPending] = useState(false)

  const longPressHandlers = useLongPress(() => setPending(true))

  function handleConfirm(e) {
    e.stopPropagation()
    onDelete(sticky.id)
  }

  function handleCancel() {
    setPending(false)
  }

  return (
    <>
      {pending && (
        <div className="fixed inset-0 z-40" onPointerDown={handleCancel} />
      )}
      <motion.div
        initial={{ rotate: sticky.rotation }}
        animate={{ rotate: sticky.rotation }}
        exit={{
          scale: [1, 1.05, 0],
          rotate: sticky.rotation + 25,
          opacity: [1, 1, 0],
          transition: { duration: 0.3, times: [0, 0.2, 1] },
        }}
        style={{
          backgroundColor: sticky.color,
          boxShadow: pending
            ? '4px 6px 20px rgba(0,0,0,0.28)'
            : '3px 4px 12px rgba(0,0,0,0.18)',
          position: 'relative',
          zIndex: pending ? 50 : 'auto',
        }}
        className="w-40 h-40 p-3 flex-shrink-0 overflow-hidden cursor-pointer select-none"
        {...longPressHandlers}
      >
        {pending && (
          <div
            className="absolute inset-0 flex items-end justify-end p-2"
            style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
          >
            <button
              onPointerDown={(e) => e.stopPropagation()}
              onClick={handleConfirm}
              className="w-9 h-9 rounded-full bg-red-500 text-white flex items-center justify-center text-base shadow-md"
              aria-label="Delete sticky"
            >
              ✕
            </button>
          </div>
        )}
        <p
          className={`text-sm text-gray-800 leading-snug whitespace-pre-wrap break-words font-medium transition-opacity ${pending ? 'opacity-40' : ''}`}
        >
          {sticky.content}
        </p>
      </motion.div>
    </>
  )
}
