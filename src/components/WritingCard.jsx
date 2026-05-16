import { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

export function WritingCard({ sticky, onDone }) {
  const textareaRef = useRef(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onDone('')
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onDone])

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/5"
        onPointerDown={() => onDone(textareaRef.current?.value ?? '')}
      />
      <motion.div
        initial={{ scale: 0.88, opacity: 0, rotate: 1.5 }}
        animate={{ scale: 1, opacity: 1, rotate: 1.5 }}
        exit={{ scale: 0.88, opacity: 0, rotate: 1.5 }}
        transition={{ duration: 0.18, ease: [0, 0, 0.2, 1] }}
        style={{
          width: 'min(70vw, 400px)',
          minHeight: 'min(70vw, 400px)',
          backgroundColor: sticky.color,
          boxShadow: '6px 8px 28px rgba(0,0,0,0.22)',
        }}
        className="relative z-10 flex flex-col p-4"
        onPointerDown={e => e.stopPropagation()}
      >
        <textarea
          ref={textareaRef}
          placeholder="Write something…"
          className="flex-1 w-full bg-transparent outline-none resize-none text-sm text-gray-800 leading-snug placeholder-gray-400"
          style={{ minHeight: 'calc(min(70vw, 400px) - 2.5rem)' }}
          onKeyDown={e => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault()
              onDone(e.target.value)
            }
          }}
        />
        <div className="flex justify-end mt-2">
          <button
            onPointerDown={e => {
              e.stopPropagation()
              onDone(textareaRef.current?.value ?? '')
            }}
            className="text-xs font-semibold text-gray-500 hover:text-gray-800 transition-colors px-2 py-1 rounded hover:bg-black/5"
          >
            Done
          </button>
        </div>
      </motion.div>
    </div>
  )
}
