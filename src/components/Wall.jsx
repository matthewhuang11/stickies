import { useState } from 'react'
import { AnimatePresence } from 'framer-motion'
import { StickyNote } from './StickyNote'
import { StickyComposer } from './StickyComposer'
import { createSticky, loadStickies, saveStickies } from '../lib/stickies'

export default function Wall() {
  const [stickies, setStickies] = useState(() => loadStickies())
  const [composing, setComposing] = useState(false)

  function handleSave(text) {
    const next = [...stickies, createSticky(text)]
    setStickies(next)
    saveStickies(next)
    setComposing(false)
  }

  function handleDiscard() {
    setComposing(false)
  }

  function handleDelete(id) {
    const next = stickies.filter((s) => s.id !== id)
    setStickies(next)
    saveStickies(next)
  }

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ backgroundColor: '#faf6f0' }}
    >
      {/* wall of stickies */}
      <div className="flex flex-wrap gap-6 p-8 content-start">
        <AnimatePresence>
          {stickies.map((sticky) => (
            <StickyNote key={sticky.id} sticky={sticky} onDelete={handleDelete} />
          ))}
        </AnimatePresence>
      </div>

      {/* + button */}
      <button
        onClick={() => setComposing(true)}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-3xl font-light text-white flex items-center justify-center shadow-lg"
        style={{ backgroundColor: '#d97706' }}
        aria-label="New sticky"
      >
        +
      </button>

      {/* composer */}
      {composing && (
        <StickyComposer onSave={handleSave} onDiscard={handleDiscard} />
      )}
    </div>
  )
}
