import { useState } from 'react'
import { motion } from 'framer-motion'
import { TAG_COLORS, getContrastColor } from '../lib/tags'

export function TagPopover({ tags, currentTagId, onApply, onRemove, onCreate, onDelete, onClose }) {
  const [name, setName] = useState('')
  const [color, setColor] = useState(TAG_COLORS[0])

  function handleCreate() {
    if (!name.trim()) return
    onCreate(name.trim(), color)
  }

  return (
    <>
      <div className="fixed inset-0 z-[60]" onPointerDown={onClose} />
      <motion.div
        className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-2xl shadow-2xl sm:left-1/2 sm:-translate-x-1/2 sm:right-auto sm:bottom-6 sm:w-80 sm:rounded-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', stiffness: 420, damping: 36 }}
        onPointerDown={e => e.stopPropagation()}
      >
        <div className="p-4 pb-8 sm:pb-4">
          {/* Handle — mobile only */}
          <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-4 sm:hidden" />

          {/* Existing tags */}
          {tags.length > 0 && (
            <div className="mb-4">
              <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-2">Tags</p>
              <div className="flex flex-wrap gap-1.5">
                {tags.map(tag => (
                  <button
                    key={tag.id}
                    className="flex items-center gap-1 rounded-full pl-2.5 pr-1 py-0.5 text-[12px] font-medium transition-opacity hover:opacity-80"
                    style={{ backgroundColor: tag.color, color: getContrastColor(tag.color) }}
                    onClick={() => { onApply(tag.id); onClose() }}
                  >
                    <span className="leading-none">{tag.name}</span>
                    <span
                      className="inline-flex items-center justify-center w-4 h-4 rounded-full text-[11px] leading-none bg-black/15 hover:bg-black/30 flex-shrink-0"
                      onPointerDown={e => e.stopPropagation()}
                      onClick={e => { e.stopPropagation(); onDelete(tag.id) }}
                      title="Delete tag everywhere"
                    >×</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Remove from this note */}
          {currentTagId && (
            <button
              className="text-[12px] text-gray-400 hover:text-gray-600 transition-colors mb-4 block"
              onClick={() => { onRemove(); onClose() }}
            >
              Remove from this note
            </button>
          )}

          {/* Create new tag */}
          <div className={tags.length > 0 || currentTagId ? 'border-t border-gray-100 pt-4' : ''}>
            <p className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide mb-2">New tag</p>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleCreate() }}
              placeholder="Tag name…"
              autoFocus
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-gray-400 mb-3"
            />
            <div className="flex gap-2 mb-3">
              {TAG_COLORS.map(c => (
                <button
                  key={c}
                  className={`w-7 h-7 rounded-full flex-shrink-0 transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-500 scale-110' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            <button
              onClick={handleCreate}
              disabled={!name.trim()}
              className="w-full bg-gray-900 text-white text-sm font-medium rounded-lg py-2 disabled:opacity-35 transition-opacity"
            >
              Create &amp; apply
            </button>
          </div>
        </div>
      </motion.div>
    </>
  )
}
