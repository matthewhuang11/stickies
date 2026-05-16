import { useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { BubbleMenu } from '@tiptap/react/menus'
import { ChecklistEditor } from './ChecklistEditor'
import { extensions, emptyDoc } from '../lib/tiptap'

function textToChecklist(doc) {
  const items = (doc.content ?? [])
    .filter(n => n.type === 'paragraph')
    .map(n => ({
      id: crypto.randomUUID(),
      text: n.content?.map(c => c.text ?? '').join('') ?? '',
      checked: false,
    }))
    .filter(item => item.text.trim())

  return items.length > 0
    ? items
    : [{ id: crypto.randomUUID(), text: '', checked: false }]
}

function checklistToDoc(items) {
  const paras = items
    .filter(i => i.text.trim())
    .map(i => ({ type: 'paragraph', content: [{ type: 'text', text: i.text }] }))
  return { type: 'doc', content: paras.length ? paras : [{ type: 'paragraph' }] }
}

export function StickyEditor({ sticky, onUpdate, onClose, onDelete }) {
  const [title, setTitle] = useState(sticky.title)
  const [mode, setMode] = useState(sticky.mode)
  const [checklist, setChecklist] = useState(
    sticky.mode === 'checklist' && Array.isArray(sticky.content)
      ? sticky.content
      : [{ id: crypto.randomUUID(), text: '', checked: false }]
  )

  // Refs so async callbacks always read latest values
  const titleRef = useRef(title)
  const modeRef = useRef(mode)
  const checklistRef = useRef(checklist)
  titleRef.current = title
  modeRef.current = mode
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

  // Tiptap v3 keeps onUpdate fresh via mostRecentOptions ref — no stale closure issue
  const editor = useEditor({
    extensions,
    content: sticky.mode === 'text' && sticky.content ? sticky.content : emptyDoc(),
    onUpdate: ({ editor }) => {
      if (modeRef.current !== 'text') return
      onUpdate({ ...sticky, title: titleRef.current, mode: 'text', content: editor.getJSON() })
    },
    autofocus: sticky.mode === 'text',
  })

  function pushUpdate(patch) {
    onUpdate({ ...sticky, title: titleRef.current, mode: modeRef.current, ...patch })
  }

  function handleTitleChange(e) {
    const v = e.target.value
    setTitle(v)
    titleRef.current = v
    const content = modeRef.current === 'text'
      ? (editor?.getJSON() ?? sticky.content)
      : checklistRef.current
    onUpdate({ ...sticky, title: v, mode: modeRef.current, content })
  }

  function handleChecklistChange(items) {
    setChecklist(items)
    checklistRef.current = items
    pushUpdate({ content: items })
  }

  function handleModeToggle() {
    if (mode === 'text') {
      const items = textToChecklist(editor?.getJSON() ?? emptyDoc())
      setChecklist(items)
      checklistRef.current = items
      setMode('checklist')
      modeRef.current = 'checklist'
      pushUpdate({ mode: 'checklist', content: items })
    } else {
      const doc = checklistToDoc(checklistRef.current)
      setMode('text')
      modeRef.current = 'text'
      editor?.commands.setContent(doc)
      pushUpdate({ mode: 'text', content: doc })
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/10" onPointerDown={onClose} />
      <div
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
              <BubbleMenu
                editor={editor}
                options={{ placement: 'top', offset: 8 }}
              >
                <div className="flex gap-px bg-gray-900 rounded px-1 py-0.5 shadow-lg">
                  <button
                    onMouseDown={e => {
                      e.preventDefault()
                      editor.chain().focus().toggleBold().run()
                    }}
                    className={`w-7 h-6 text-xs font-bold text-white rounded ${editor.isActive('bold') ? 'bg-white/20' : ''}`}
                  >
                    B
                  </button>
                  <button
                    onMouseDown={e => {
                      e.preventDefault()
                      editor.chain().focus().toggleItalic().run()
                    }}
                    className={`w-7 h-6 text-xs italic text-white rounded ${editor.isActive('italic') ? 'bg-white/20' : ''}`}
                  >
                    I
                  </button>
                  <button
                    onMouseDown={e => {
                      e.preventDefault()
                      editor.chain().focus().toggleBulletList().run()
                    }}
                    className={`w-7 h-6 text-xs text-white rounded ${editor.isActive('bulletList') ? 'bg-white/20' : ''}`}
                  >
                    •
                  </button>
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
          <button
            onClick={handleModeToggle}
            className="text-xs text-gray-400 hover:text-gray-700 transition-colors"
            title={mode === 'text' ? 'Switch to checklist' : 'Switch to text'}
          >
            {mode === 'text' ? '☑ list' : 'Tt text'}
          </button>
          <button
            onClick={onDelete}
            className="text-gray-300 hover:text-red-400 transition-colors text-base leading-none"
            aria-label="Delete sticky"
            title="Delete"
          >
            🗑
          </button>
        </div>
      </div>
    </div>
  )
}
