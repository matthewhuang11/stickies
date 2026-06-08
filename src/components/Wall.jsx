import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion, useAnimate } from 'framer-motion'
import {
  DndContext, closestCenter,
  PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { SortableContext, rectSortingStrategy, arrayMove } from '@dnd-kit/sortable'
import { StickyNote } from './StickyNote'
import { StickyEditor } from './StickyEditor'
import { createSticky } from '../lib/stickies'
import { createTag } from '../lib/tags'
import { supabase } from '../lib/supabase'
import {
  fetchStickies, fetchTags,
  insertSticky, updateSticky, deleteSticky,
  insertTag, deleteTag, clearTagFromStickies,
} from '../lib/db'

const STICKY_SIZE = 160 // w-40 = 10rem
// Trash can is fixed at bottom-left: left:32, bottom:32, size:56
const TRASH_CENTER_X = 32 + 28
const TRASH_CENTER_Y = () => window.innerHeight - 32 - 28

function CrumpleBall({ startX, startY, color, onComplete }) {
  const endX = TRASH_CENTER_X
  const endY = TRASH_CENTER_Y()

  const endDx = endX - startX - STICKY_SIZE / 2
  const endDy = endY - startY - STICKY_SIZE / 2
  // Arc peak: 40% across horizontally, modest upward arc
  const peakDx = endDx * 0.4
  const peakDy = -55

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
      initial={{ scale: 1, borderRadius: '4px', rotate: 0, skewX: 0, skewY: 0, x: 0, y: 0, opacity: 1 }}
      animate={{
        scale:        [1, 0.86, 0.22, 0.20, 0.17],
        skewX:        [0,   14,   -4,    0,    0],
        skewY:        [0,   -7,    2,    0,    0],
        borderRadius: ['4px', '16px', '50%', '50%', '50%'],
        rotate:       [0,  10,  140,  260,  390],
        x:            [0,   0,    0, peakDx, endDx],
        y:            [0,   0,    0, peakDy, endDy],
        opacity:      [1,   1,    1,     1,    0],
      }}
      transition={{
        duration: 1.3,
        times: [0, 0.20, 0.44, 0.64, 1],
        ease: ['easeOut', 'easeIn', 'easeOut', 'easeIn'],
      }}
      onAnimationComplete={onComplete}
    />
  )
}

export default function Wall({ user }) {
  const [stickies, setStickies] = useState([])
  const [tags, setTags] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterTagId, setFilterTagId] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editOrigin, setEditOrigin] = useState(null)
  const [pendingSticky, setPendingSticky] = useState(null)
  const [showToast, setShowToast] = useState(false)
  const [showTrash, setShowTrash] = useState(false)
  const [ballState, setBallState] = useState(null)
  const [showMenu, setShowMenu] = useState(false)

  const deletedRef = useRef(null)
  const toastTimer = useRef(null)
  const menuRef = useRef(null)
  const [trashScope, trashAnimate] = useAnimate()

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 120, tolerance: 5 } })
  )

  useEffect(() => {
    if (!showMenu) return
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [showMenu])

  useEffect(() => {
    Promise.all([fetchStickies(), fetchTags()])
      .then(([s, t]) => { setStickies(s); setTags(t) })
      .catch(err => console.error('load error:', err))
      .finally(() => setLoading(false))
  }, [])

  const editingSticky = editingId
    ? (pendingSticky?.id === editingId ? pendingSticky : stickies.find(s => s.id === editingId) ?? null)
    : null

  function handleNewSticky() {
    window.scrollTo(0, 0)
    const sticky = { ...createSticky(), tagId: filterTagId }
    setPendingSticky(sticky)
    setEditingId(sticky.id)
  }

  function handleFilterTag(tagId) {
    setFilterTagId(prev => prev === tagId ? null : tagId)
  }

  function handleCreateTag(name, color) {
    const tag = createTag(name, color)
    setTags(prev => [tag, ...prev])
    insertTag(tag)
    return tag
  }

  function handleDeleteTag(tagId) {
    setTags(prev => prev.filter(t => t.id !== tagId))
    setStickies(prev => prev.map(s => ({ ...s, tagIds: (s.tagIds ?? []).filter(id => id !== tagId) })))
    setPendingSticky(prev => prev ? { ...prev, tagIds: (prev.tagIds ?? []).filter(id => id !== tagId) } : prev)
    setFilterTagId(prev => prev === tagId ? null : prev)
    deleteTag(tagId)
    clearTagFromStickies(tagId)
  }

  function handleDragEnd({ active, over }) {
    if (!over || active.id === over.id) return
    const oldIndex = stickies.findIndex(s => s.id === active.id)
    const newIndex = stickies.findIndex(s => s.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return
    const reordered = arrayMove(stickies, oldIndex, newIndex)
    const prev = reordered[newIndex - 1]
    const next = reordered[newIndex + 1]
    const newSortOrder = prev && next
      ? (prev.sortOrder + next.sortOrder) / 2
      : prev ? prev.sortOrder + 1000
      : next ? next.sortOrder - 1000
      : 0
    const moved = { ...reordered[newIndex], sortOrder: newSortOrder }
    reordered[newIndex] = moved
    setStickies(reordered)
    updateSticky(moved)
  }

  function handleEditStart(id) {
    window.scrollTo(0, 0)
    const el = document.querySelector(`[data-sticky-id="${id}"]`)
    const rect = el?.getBoundingClientRect()
    setEditOrigin(rect ? { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 } : null)
    setEditingId(id)
  }

  function handleDelete() {
    const id = editingId

    if (pendingSticky?.id === id) {
      setPendingSticky(null)
      setEditingId(null)
      setEditOrigin(null)
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
    setEditOrigin(null)
    setStickies(prev => prev.filter(s => s.id !== id))
    deleteSticky(id)

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
    insertSticky(sticky)
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
      setStickies(prev => [...prev, pendingSticky])
      insertSticky(pendingSticky)
      setPendingSticky(null)
    } else {
      const current = stickies.find(s => s.id === editingId)
      if (current) updateSticky(current)
    }
    setEditingId(null)
    setEditOrigin(null)
  }

  const visibleStickies = stickies.filter(s => !filterTagId || (s.tagIds ?? []).includes(filterTagId))

  return (
    <div
      className="min-h-screen w-full relative"
      style={{ backgroundColor: '#faf6f0' }}
    >
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={visibleStickies.map(s => s.id)} strategy={rectSortingStrategy}>
          <div className="flex flex-wrap gap-6 p-8 content-start">
            <AnimatePresence>
              {visibleStickies.map(sticky => (
                <StickyNote
                  key={sticky.id}
                  sticky={sticky}
                  tags={(sticky.tagIds ?? []).map(id => tags.find(t => t.id === id)).filter(Boolean)}
                  filterTagId={filterTagId}
                  onEdit={handleEditStart}
                  onFilterTag={handleFilterTag}
                />
              ))}
            </AnimatePresence>
          </div>
        </SortableContext>
      </DndContext>

      {/* Empty state */}
      <AnimatePresence>
        {stickies.length === 0 && !editingSticky && !loading && (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
          >
            <p className="text-[15px] text-stone-300">
              Press <span className="inline-flex items-center justify-center w-6 h-6 rounded-full text-white text-base font-light leading-none align-middle" style={{ backgroundColor: '#e5c99a' }}>+</span> to add a sticky note
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* User avatar menu */}
      <div ref={menuRef} className="fixed top-3 left-4 z-20">
        <button
          onClick={() => setShowMenu(m => !m)}
          className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-semibold text-white shadow-sm"
          style={{ backgroundColor: '#d97706' }}
        >
          {user?.email?.[0]?.toUpperCase() ?? '?'}
        </button>
        {showMenu && (
          <div className="absolute top-9 left-0 bg-white rounded-xl shadow-lg border border-stone-100 py-1 min-w-[120px]">
            <p className="px-3 py-1.5 text-[11px] text-stone-400 truncate max-w-[160px]">{user?.email}</p>
            <hr className="border-stone-100 mx-2" />
            <button
              onClick={() => supabase.auth.signOut()}
              className="w-full text-left px-3 py-1.5 text-sm text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Sign out
            </button>
          </div>
        )}
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
            origin={editOrigin}
            tags={tags}
            onUpdate={handleUpdate}
            onClose={handleEditorClose}
            onDelete={handleDelete}
            onCreateTag={handleCreateTag}
            onDeleteTag={handleDeleteTag}
          />
        )}
      </AnimatePresence>

      {/* Active filter indicator */}
      <AnimatePresence>
        {filterTagId && (() => {
          const ft = tags.find(t => t.id === filterTagId)
          return ft ? (
            <motion.button
              key="filter-indicator"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.16 }}
              onClick={() => setFilterTagId(null)}
              className="fixed top-3 right-4 z-10 flex items-center gap-1.5 text-[11px] text-gray-500 hover:text-gray-800 transition-colors bg-white/75 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm"
            >
              <span className="opacity-60">✕</span>
              <span>{ft.name}</span>
            </motion.button>
          ) : null
        })()}
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
            <span>sticky deleted</span>
            <button
              onClick={handleUndo}
              className="font-semibold text-amber-300 hover:text-amber-200 transition-colors"
            >
              undo
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
