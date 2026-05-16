import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { StickyNote } from './StickyNote'
import { StickyEditor } from './StickyEditor'
import { createSticky, loadStickies, saveStickies, isStickyEmpty } from '../lib/stickies'

export default function Wall() {
  const [stickies, setStickies] = useState(() => loadStickies())
  const [editingId, setEditingId] = useState(null)
  const [showToast, setShowToast] = useState(false)

  const deletedRef = useRef(null)   // { sticky, index }
  const toastTimer = useRef(null)

  useEffect(() => {
    saveStickies(stickies)
  }, [stickies])

  const editingSticky = stickies.find(s => s.id === editingId) ?? null

  function handleNewSticky() {
    const sticky = createSticky()
    setStickies(prev => [...prev, sticky])
    setEditingId(sticky.id)
  }

  function handleDelete() {
    const id = editingId
    const idx = stickies.findIndex(s => s.id === id)
    if (idx === -1) return

    deletedRef.current = { sticky: stickies[idx], index: idx }
    setEditingId(null)
    setStickies(prev => prev.filter(s => s.id !== id))
    setShowToast(true)

    clearTimeout(toastTimer.current)
    toastTimer.current = setTimeout(() => {
      deletedRef.current = null
      setShowToast(false)
    }, 4000)
  }

  function handleUndo() {
    if (!deletedRef.current) return
    const { sticky, index } = deletedRef.current
    setStickies(prev => {
      const next = [...prev]
      next.splice(index, 0, sticky)
      return next
    })
    deletedRef.current = null
    clearTimeout(toastTimer.current)
    setShowToast(false)
  }

  function handleUpdate(updatedSticky) {
    setStickies(prev => prev.map(s => s.id === updatedSticky.id ? updatedSticky : s))
  }

  function handleEditorClose() {
    const id = editingId
    setStickies(prev => {
      const sticky = prev.find(s => s.id === id)
      if (sticky && isStickyEmpty(sticky)) return prev.filter(s => s.id !== id)
      return prev
    })
    setEditingId(null)
  }

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ backgroundColor: '#faf6f0' }}
    >
      <div className="flex flex-wrap gap-6 p-8 content-start">
        <AnimatePresence>
          {stickies.map(sticky => (
            <StickyNote
              key={sticky.id}
              sticky={sticky}
              onEdit={setEditingId}
            />
          ))}
        </AnimatePresence>
      </div>

      <button
        onClick={handleNewSticky}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-3xl font-light text-white flex items-center justify-center shadow-lg"
        style={{ backgroundColor: '#d97706' }}
        aria-label="New sticky"
      >
        +
      </button>

      {editingSticky && (
        <StickyEditor
          sticky={editingSticky}
          onUpdate={handleUpdate}
          onClose={handleEditorClose}
          onDelete={handleDelete}
        />
      )}

      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg z-50 whitespace-nowrap"
          >
            <span>Sticky deleted</span>
            <button
              onClick={handleUndo}
              className="font-semibold text-amber-300 hover:text-amber-200 transition-colors"
            >
              Undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
