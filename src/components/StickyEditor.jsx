import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { ChecklistEditor } from './ChecklistEditor'
import { extensions, emptyDoc } from '../lib/tiptap'

export function StickyEditor({ sticky, onUpdate, onClose, onDelete }) {
  const [title, setTitle] = useState(sticky.title)
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

  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') onCloseRef.current()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black/10"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onPointerDown={onClose}
      />
      {/* Card — peels off the pad from bottom-right */}
      <motion.div
        initial={{ scale: 0.08, rotate: -28, skewY: 16, y: '36vh', x: '22vw' }}
        animate={{ scale: 1, rotate: 0, skewY: 0, y: 0, x: 0 }}
        exit={{ scale: 0.12, opacity: 0, transition: { duration: 0.16, ease: 'easeIn' } }}
        transition={{ type: 'spring', stiffness: 260, damping: 20, mass: 1.1 }}
        style={{
          backgroundColor: sticky.color,
          boxShadow: '6px 8px 28px rgba(0,0,0,0.22)',
          width: 288,
          minHeight: 288,
        }}
        className="relative z-10 flex flex-col p-4"
        onPointerDown={e => e.stopPropagation()}
      >
        {/* Title */}
        <input
          value={title}
          onChange={handleTitleChange}
          placeholder="Title…"
          className="w-full bg-transparent outline-none text-sm font-semibold text-gray-900 placeholder-gray-400 mb-2"
        />
        {title && (
          <div className="h-px mb-2" style={{ backgroundColor: 'rgba(0,0,0,0.1)' }} />
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto">
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
          className="flex items-center justify-between mt-3 pt-2"
          style={{ borderTop: '1px solid rgba(0,0,0,0.08)' }}
        >
          {editor && mode === 'text' ? (
            <div className="flex gap-0.5">
              <button
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleBulletList().run() }}
                className={`text-sm px-1.5 py-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors leading-none ${editor.isActive('bulletList') ? 'bg-black/10 text-gray-700' : ''}`}
                title="Bullet list (- to start)"
              >•</button>
              <button
                onMouseDown={e => { e.preventDefault(); editor.chain().focus().toggleTaskList().run() }}
                className={`text-xs px-1.5 py-0.5 rounded text-gray-400 hover:text-gray-700 hover:bg-black/5 transition-colors leading-none ${editor.isActive('taskList') ? 'bg-black/10 text-gray-700' : ''}`}
                title="Checklist"
              >☑</button>
            </div>
          ) : (
            <div />
          )}
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none"
            aria-label="Delete sticky"
            title="Delete"
          >🗑</button>
        </div>
      </motion.div>
    </div>
  )
}
