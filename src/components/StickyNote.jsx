import { useRef, useMemo } from 'react'
import { motion } from 'framer-motion'
import { generateHTML } from '@tiptap/core'
import { extensions } from '../lib/tiptap'

export function StickyNote({ sticky, onEdit }) {
  // Fixed random crumple angle per sticky instance
  const crumpleAngle = useRef(
    sticky.rotation + (Math.random() > 0.5 ? 1 : -1) * (Math.random() * 15 + 15)
  )

  const html = useMemo(() => {
    if (sticky.mode !== 'text') return null
    try { return generateHTML(sticky.content, extensions) } catch { return '' }
  }, [sticky.content, sticky.mode])

  return (
    <motion.div
      initial={{ rotate: sticky.rotation }}
      animate={{ rotate: sticky.rotation }}
      exit={{
        scale: 0.3,
        rotate: crumpleAngle.current,
        skewX: -8,
        opacity: 0,
        transition: { duration: 0.45, ease: [0.4, 0, 1, 1] },
      }}
      style={{
        backgroundColor: sticky.color,
        boxShadow: '3px 4px 12px rgba(0,0,0,0.18)',
      }}
      className="w-40 h-40 p-3 flex-shrink-0 overflow-hidden cursor-pointer select-none"
      onClick={() => onEdit(sticky.id)}
    >
      <div className="h-full overflow-hidden flex flex-col gap-1">
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
  )
}
