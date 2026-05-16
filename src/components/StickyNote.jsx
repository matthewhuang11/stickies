import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { generateHTML } from '@tiptap/core'
import { extensions } from '../lib/tiptap'
import { TagPill } from './TagPill'

export function StickyNote({ sticky, tag, onEdit }) {
  // Only animate if created in this session (not loaded from storage)
  const isNew = Date.now() - sticky.createdAt < 4000

  const html = useMemo(() => {
    if (sticky.mode !== 'text') return null
    try { return generateHTML(sticky.content, extensions) } catch { return '' }
  }, [sticky.content, sticky.mode])

  return (
    <motion.div
      data-sticky-id={sticky.id}
      initial={isNew ? { rotate: sticky.rotation + 25 } : { rotate: sticky.rotation }}
      animate={{ rotate: sticky.rotation }}
      transition={isNew
        ? { type: 'spring', stiffness: 140, damping: 14, mass: 1.4 }
        : { duration: 0 }}
      exit={{ opacity: 0, transition: { duration: 0.08 } }}
      style={{
        backgroundColor: sticky.color,
        boxShadow: '3px 4px 12px rgba(0,0,0,0.18)',
        originX: 0.5,
        originY: 0,
      }}
      className="w-40 h-40 p-3 flex-shrink-0 overflow-hidden cursor-pointer select-none"
      onClick={() => onEdit(sticky.id)}
    >
      <div className="h-full overflow-hidden flex flex-col gap-1">
        {tag && <TagPill tag={tag} />}
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

        {/* Legacy checklist stickies */}
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
