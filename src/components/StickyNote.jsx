import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { CSS } from '@dnd-kit/utilities'
import { useSortable } from '@dnd-kit/sortable'
import { generateHTML } from '@tiptap/core'
import { extensions } from '../lib/tiptap'
import { TagPill } from './TagPill'

export function StickyNote({ sticky, tags = [], onEdit, filterTagId, onFilterTag }) {
  const isNew = Date.now() - sticky.createdAt < 4000

  const {
    attributes, listeners, setNodeRef,
    transform, transition: sortTransition, isDragging,
  } = useSortable({ id: sticky.id })

  const html = useMemo(() => {
    if (sticky.mode !== 'text') return null
    try { return generateHTML(sticky.content, extensions) } catch { return '' }
  }, [sticky.content, sticky.mode])

  const visibleTags = tags.slice(0, 2)

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Transform.toString(transform),
        transition: sortTransition,
        opacity: isDragging ? 0.45 : 1,
        zIndex: isDragging ? 50 : undefined,
        flexShrink: 0,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      {...attributes}
      {...listeners}
    >
      <motion.div
        data-sticky-id={sticky.id}
        initial={isNew ? { rotate: sticky.rotation + 25 } : { rotate: sticky.rotation }}
        animate={{ rotate: sticky.rotation }}
        transition={isNew
          ? { type: 'spring', stiffness: 140, damping: 14, mass: 1.4 }
          : { duration: 0 }}
        exit={{ opacity: 0, transition: { duration: 0.12 } }}
        style={{
          backgroundColor: sticky.color,
          boxShadow: isDragging
            ? '6px 10px 32px rgba(0,0,0,0.28)'
            : '3px 4px 12px rgba(0,0,0,0.18)',
          originX: 0.5,
          originY: 0,
        }}
        className="w-40 h-40 p-3 overflow-hidden select-none"
        onClick={() => !isDragging && onEdit(sticky.id)}
      >
        <div className="h-full overflow-hidden flex flex-col gap-1">
          {visibleTags.length > 0 && (
            <div className="flex flex-wrap gap-1 flex-shrink-0">
              {visibleTags.map(tag => (
                <TagPill
                  key={tag.id}
                  tag={tag}
                  isActive={filterTagId === tag.id}
                  onClick={onFilterTag ? () => onFilterTag(tag.id) : undefined}
                />
              ))}
              {tags.length > 2 && (
                <span className="text-[10px] text-gray-500 leading-none self-center">
                  +{tags.length - 2}
                </span>
              )}
            </div>
          )}

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
    </div>
  )
}
