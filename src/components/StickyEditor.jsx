import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { ChecklistEditor } from './ChecklistEditor'
import { TagPill } from './TagPill'
import { TagPopover } from './TagPopover'
import { extensions, emptyDoc } from '../lib/tiptap'

const STICKY_SIZE = 160
const EDITOR_SIZE = 288
const CARD_HALF_H = EDITOR_SIZE / 2
const srcScale = STICKY_SIZE / EDITOR_SIZE

function getCardPos() {
  const vv = window.visualViewport
  const h   = vv ? vv.height      : window.innerHeight
  const w   = vv ? vv.width       : window.innerWidth
  const oTop  = vv ? vv.offsetTop  : 0
  const oLeft = vv ? vv.offsetLeft : 0
  return {
    top:       oTop  + h * 0.08,
    left:      oLeft + (w - EDITOR_SIZE) / 2,
    maxHeight: Math.floor(h * 0.88),
  }
}

export function StickyEditor({ sticky, onUpdate, onClose, onDelete, origin, tags, onCreateTag, onDeleteTag }) {
  const [title, setTitle] = useState(sticky.title)
  const [showTagPopover, setShowTagPopover] = useState(false)
  const currentTag = tags?.find(t => t.id === sticky.tagId) ?? null
  // mode kept only for legacy checklist stickies
  const mode = sticky.mode

  const [checklist, setChecklist] = useState(
    sticky.mode === 'checklist' && Array.isArray(sticky.content)
      ? sticky.content
      : []
  )

  const titleRef = useRef(title)
  const checklistRef = useRef(checklist)
  titleRef.current = title
  checklistRef.current = checklist

  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  const [cardPos, setCardPos] = useState(() => getCardPos())
  // Capture initial position once (before keyboard appears) for animation offsets
  const initCardPos = useRef(cardPos)

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  useEffect(() => {
    const vv = window.visualViewport
    if (!vv) return
    const update = () => setCardPos(getCardPos())
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [])

  const editor = useEditor({
    extensions,
    content: mode === 'text' && sticky.content ? sticky.content : emptyDoc(),
    onUpdate: ({ editor }) => {
      if (mode !== 'text') return
      onUpdate({ ...sticky, title: titleRef.current, content: editor.getJSON() })
    },
    autofocus: mode === 'text',
  })

  function handleTitleChange(e) {
    const v = e.target.value
    setTitle(v)
    titleRef.current = v
    const content = mode === 'text'
      ? (editor?.getJSON() ?? sticky.content)
      : checklistRef.current
    onUpdate({ ...sticky, title: v, content })
  }

  function handleChecklistChange(items) {
    setChecklist(items)
    checklistRef.current = items
    onUpdate({ ...sticky, title: titleRef.current, content: items })
  }

  const dx = origin ? origin.x - (initCardPos.current.left + CARD_HALF_H) : 0
  const dy = origin ? origin.y - (initCardPos.current.top  + CARD_HALF_H) : 0

  const cardMotion = origin
    ? {
        initial:    { x: dx, y: dy, scale: srcScale, rotate: sticky.rotation },
        animate:    { x: 0, y: 0, scale: 1, rotate: 0 },
        exit:       { x: dx, y: dy, scale: srcScale, opacity: 0, transition: { duration: 0.18, ease: 'easeIn' } },
        transition: { type: 'spring', stiffness: 300, damping: 26 },
      }
    : {
        initial:    { scale: 0.08, rotate: -28, skewY: 16, y: '36vh', x: '22vw' },
        animate:    { scale: 1, rotate: 0, skewY: 0, y: 0, x: 0 },
        exit:       { scale: 0.12, opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } },
        transition: { type: 'spring', stiffness: 260, damping: 20, mass: 1.1 },
      }

  return (
    <>
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onPointerDown={onClose}
      />
      {/* Card */}
      <motion.div
        {...cardMotion}
        style={{
          position: 'fixed',
          top:      cardPos.top,
          left:     cardPos.left,
          width:    EDITOR_SIZE,
          minHeight: EDITOR_SIZE,
          maxHeight: cardPos.maxHeight,
          backgroundColor: sticky.color,
          boxShadow: '6px 8px 28px rgba(0,0,0,0.22)',
        }}
        className="z-10 flex flex-col p-4 overflow-hidden"
        onPointerDown={e => e.stopPropagation()}
      >
        {/* Tag pill */}
        {currentTag && (
          <div className="mb-2 flex-shrink-0">
            <TagPill tag={currentTag} />
          </div>
        )}

        {/* Title */}
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="title…"
          className="w-full bg-transparent outline-none text-sm font-semibold text-gray-900 placeholder-gray-400 mb-2 flex-shrink-0"
        />
        {title && (
          <div className="h-px mb-2 flex-shrink-0" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
        )}

        {/* Body — min-h-0 lets it shrink below content size so overflow-y scroll works */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          {editor && mode === 'text' && (
            <>
              <BubbleMenu editor={editor} options={{ placement: 'top', offset: 8 }}>
                <div className="flex gap-px bg-gray-900 rounded px-1 py-0.5 shadow-lg">
                  <button
                    onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBold().run() }}
                    className={`w-7 h-6 text-xs font-bold text-white rounded ${editor.isActive('bold') ? 'bg-white/20' : ''}`}
                  >B</button>
                  <button
                    onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleItalic().run() }}
                    className={`w-7 h-6 text-xs italic text-white rounded ${editor.isActive('italic') ? 'bg-white/20' : ''}`}
                  >I</button>
                </div>
              </BubbleMenu>
              <EditorContent
                editor={editor}
                style={{ scrollMarginTop: 80 }}
                className="[&_.ProseMirror]:outline-none [&_.ProseMirror_p]:m-0 [&_.ProseMirror]:min-h-[140px] [&_.ProseMirror]:text-sm [&_.ProseMirror]:text-gray-800 [&_.ProseMirror]:leading-snug"
              />
            </>
          )}
          {mode === 'checklist' && (
            <ChecklistEditor items={checklist} onChange={handleChecklistChange} />
          )}
        </div>

        {/* Bottom toolbar */}
        <div
          className="flex items-center justify-between mt-3 pt-2 flex-shrink-0"
          style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
        >
          <div className="flex items-center gap-1">
            {editor && mode === 'text' && (
              <>
                <button
                  onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
                  className={`text-sm px-1.5 py-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors leading-none ${editor.isActive('bulletList') ? 'bg-black/10 text-gray-700' : ''}`}
                  title="bullet list (- to start)"
                >•</button>
                <button
                  onMouseDown={e => {
                    e.preventDefault()
                    if (editor.isActive('taskItem')) {
                      editor.chain().focus().liftListItem('taskItem').run()
                    } else {
                      editor.chain().focus().wrapInList('taskList').run()
                    }
                  }}
                  className={`text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors leading-none ${editor.isActive('taskList') ? 'bg-black/10 text-gray-700' : ''}`}
                  title="checklist"
                >☑</button>
              </>
            )}
            <button
              onClick={() => setShowTagPopover(v => !v)}
              className="flex items-center rounded px-1.5 py-0.5 transition-colors hover:bg-black/5"
              title="tag"
            >
              {currentTag
                ? <TagPill tag={currentTag} />
                : <span className="text-xs text-gray-400 hover:text-gray-700 leading-none">+ tag</span>
              }
            </button>
          </div>
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none"
            aria-label="delete sticky"
            title="delete"
          >🗑</button>
        </div>
      </motion.div>
    </div>

    <AnimatePresence>
      {showTagPopover && (
        <TagPopover
          tags={tags ?? []}
          currentTagId={sticky.tagId}
          onApply={tagId => { onUpdate({ ...sticky, title: titleRef.current, tagId }); setShowTagPopover(false) }}
          onRemove={() => { onUpdate({ ...sticky, title: titleRef.current, tagId: null }); setShowTagPopover(false) }}
          onCreate={(name, color) => {
            const tag = onCreateTag(name, color)
            onUpdate({ ...sticky, title: titleRef.current, tagId: tag.id })
            setShowTagPopover(false)
          }}
          onDelete={onDeleteTag}
          onClose={() => setShowTagPopover(false)}
        />
      )}
    </AnimatePresence>
    </>
  )
}
