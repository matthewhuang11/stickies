import { useState, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import { StickyNote } from './StickyNote'
import { StickyEditor } from './StickyEditor'
import { createSticky, loadStickies, saveStickies, isStickyEmpty } from '../lib/stickies'

export default function Wall() {
  const [stickies, setStickies] = useState(() => loadStickies())
  const [editingId, setEditingId] = useState(null)

  useEffect(() => {
    saveStickies(stickies)
  }, [stickies])

  const editingSticky = stickies.find(s => s.id === editingId) ?? null

  function handleNewSticky() {
    const sticky = createSticky()
    setStickies(prev => [...prev, sticky])
    setEditingId(sticky.id)
  }

  function handleDelete(id) {
    setStickies(prev => prev.filter(s => s.id !== id))
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
              onDelete={handleDelete}
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
        />
      )}
    </div>
  )
}
