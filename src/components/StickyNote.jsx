import { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { generateHTML } from '@tiptap/core'
import { useLongPress } from '../hooks/useLongPress'
import { extensions } from '../lib/tiptap'

export function StickyNote({ sticky, onDelete, onEdit }) {
  const [pending, setPending] = useState(false)

  const { handlers: longPressHandlers, longFired } = useLongPress(() => setPending(true))

  const html = useMemo(() => {
    if (sticky.mode !== 'text') return null
    try {
      return generateHTML(sticky.content, extensions)
    } catch {
      return ''
    }
  }, [sticky.content, sticky.mode])

  function handleClick() {
    if (longFired.current) return
    if (pending) {
      setPending(false)
    } else {
      onEdit(sticky.id)
    }
  }

  function handleConfirm(e) {
    e.stopPropagation()
    onDelete(sticky.id)
  }

  return (
    <>
      {pending && (
        <div className="fixed inset-0 z-40" onPointerDown={() => setPending(false)} />
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
        onClick={handleClick}
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

        <div className={`h-full overflow-hidden flex flex-col gap-1 ${pending ? 'opacity-40' : ''}`}>
          {sticky.title && (
            <p className="text-xs font-semibold text-gray-900 leading-tight flex-shrink-0 truncate">
              {sticky.title}
            </p>
          )}

          {sticky.mode === 'text' && html && (
            <div
              className="sticky-content text-xs text-gray-800 leading-snug overflow-hidden"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          )}

          {sticky.mode === 'checklist' && Array.isArray(sticky.content) && (
            <ul className="space-y-0.5 overflow-hidden">
              {sticky.content.map(item => (
                <li
                  key={item.id}
                  className={`flex items-start gap-1 text-xs text-gray-800 leading-snug ${item.checked ? 'line-through opacity-50' : ''}`}
                >
                  <span className="flex-shrink-0">{item.checked ? '☑' : '☐'}</span>
                  <span className="truncate">{item.text}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </>
  )
}
