import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import { StickyNote } from './StickyNote'
import { StickyEditor } from './StickyEditor'
import { createSticky, loadStickies, saveStickies, isStickyEmpty } from '../lib/stickies'

const STICKY_SIZE = 160 // w-40 = 10rem
// Trash can is fixed at bottom-left: left:32, bottom:32, size:56
const TRASH_CENTER_X = 32 + 28
const TRASH_CENTER_Y = () => window.innerHeight - 32 - 28

function CrumpleBall({ startX, startY, color, onComplete }) {
  const endX = TRASH_CENTER_X
  const endY = TRASH_CENTER_Y()

  return (
    <motion.div
      className="fixed pointer-events-none"
      style={{
        left: startX,
        top: startY,
        width: STICKY_SIZE,
        height: STICKY_SIZE,
        backgroundColor: color,
        boxShadow: '3px 4px 12px rgba(0,0,0,0.18)',
        zIndex: 200,
      }}
      initial={{ scale: 1, borderRadius: '4px', rotate: 0, x: 0, y: 0, opacity: 1 }}
      animate={{
        scale:        [1, 0.22, 0.14],
        borderRadius: ['4px', '50%', '50%'],
        rotate:       [0, 200, 490],
        x:            [0, 0, endX - startX - STICKY_SIZE / 2],
        y:            [0, 0, endY - startY - STICKY_SIZE / 2],
        opacity:      [1, 1, 0],
      }}
      transition={{ duration: 0.72, times: [0, 0.45, 1], ease: 'easeIn' }}
      onAnimationComplete={onComplete}
    />
  )
}

export default function Wall() {
  const [stickies, setStickies] = useState(() => loadStickies())
  const [editingId, setEditingId] = useState(null)
  const [pendingSticky, setPendingSticky] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [ballState, setBallState] = useState(null) // { startX, startY, color }

  const deletedRef = useRef(null)
  const toastTimer = useRef(null)
  const [trashScope, trashAnimate] = useAnimate()

  useEffect(() => {
    saveStickies(stickies)
  }, [stickies])

  const editingSticky = editingId
    ? (pendingSticky?.id === editingId ? pendingSticky : stickies.find(s => s.id === editingId) ?? null)
    : null

  function handleNewSticky() {
    const sticky = createSticky()
    setPendingSticky(sticky)
    setEditingId(sticky.id)
  }

  function handleDelete() {
    const id = editingId

    if (pendingSticky?.id === id) {
      setPendingSticky(null)
      setEditingId(null)
      return
    }

    const idx = stickies.findIndex(s => s.id === id)
    if (idx === -1) return

    const deleted = stickies[idx]
    deletedRef.current = { sticky: deleted, index: idx }

    // Capture DOM position before removing from state
    const el = document.querySelector(`[data-sticky-id="${id}"]`)
    const rect = el?.getBoundingClientRect()

    setEditingId(null)
    setStickies(prev => prev.filter(s => s.id !== id))

    if (rect) {
      setShowTrash(true)
      setBallState({ startX: rect.left, startY: rect.top, color: deleted.color })
    } else {
      showUndoToast()
    }
  }

  async function handleBallComplete() {
    setBallState(null)
    if (trashScope.current) {
      await trashAnimate(
        trashScope.current,
        { rotate: [-14, 14, -8, 8, -3, 3, 0] },
        { duration: 0.4, ease: 'easeOut' }
      )
    }
    setShowTrash(false)
    showUndoToast()
  }

  function showUndoToast() {
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
    if (pendingSticky?.id === updatedSticky.id) {
      setPendingSticky(updatedSticky)
    } else {
      setStickies(prev => prev.map(s => s.id === updatedSticky.id ? updatedSticky : s))
    }
  }

  function handleEditorClose() {
    if (pendingSticky) {
      if (!isStickyEmpty(pendingSticky)) {
        setStickies(prev => [...prev, pendingSticky])
      }
      setPendingSticky(null)
    } else {
      const id = editingId
      setStickies(prev => {
        const sticky = prev.find(s => s.id === id)
        if (sticky && isStickyEmpty(sticky)) return prev.filter(s => s.id !== id)
        return prev
      })
    }
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

      {/* + button */}
      <button
        onClick={handleNewSticky}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full text-3xl font-light text-white flex items-center justify-center shadow-lg z-10"
        style={{ backgroundColor: '#d97706' }}
        aria-label="New sticky"
      >
        +
      </button>

      {/* Trash can — always rendered so trashScope ref is stable */}
      <motion.div
        ref={trashScope}
        className="fixed bottom-8 left-8 w-14 h-14 rounded-full bg-gray-800 text-white flex items-center justify-center shadow-lg text-2xl"
        style={{ zIndex: 150 }}
        animate={{ scale: showTrash ? 1 : 0, opacity: showTrash ? 1 : 0 }}
        transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      >
        🗑️
      </motion.div>

      {/* Crumple ball */}
      {ballState && (
        <CrumpleBall
          startX={ballState.startX}
          startY={ballState.startY}
          color={ballState.color}
          onComplete={handleBallComplete}
        />
      )}

      {/* Editor — AnimatePresence enables exit animation on close */}
      <AnimatePresence>
        {editingSticky && (
          <StickyEditor
            key={editingSticky.id}
            sticky={editingSticky}
            onUpdate={handleUpdate}
            onClose={handleEditorClose}
            onDelete={handleDelete}
          />
        )}
      </AnimatePresence>

      {/* Undo toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ y: 24, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 24, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-gray-900 text-white text-sm px-4 py-2 rounded-full shadow-lg whitespace-nowrap"
            style={{ zIndex: 300 }}
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
