import { useRef, useEffect } from 'react'

export function StickyComposer({ onSave, onDiscard }) {
  const ref = useRef(null)

  useEffect(() => {
    ref.current?.focus()
  }, [])

  function handleKeyDown(e) {
    if (e.key === 'Escape') {
      const text = ref.current?.value.trim()
      text ? onSave(text) : onDiscard()
    }
  }

  function handleBlur() {
    const text = ref.current?.value.trim()
    text ? onSave(text) : onDiscard()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* backdrop - click outside = blur = save/discard */}
      <div className="absolute inset-0 bg-black/10" />
      <div
        style={{
          backgroundColor: '#fef08a',
          boxShadow: '4px 6px 20px rgba(0,0,0,0.25)',
        }}
        className="relative w-40 h-40 p-3 z-10"
      >
        <textarea
          ref={ref}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          className="w-full h-full resize-none bg-transparent text-sm text-gray-800 leading-snug font-medium placeholder-gray-400 outline-none"
          placeholder="Type a thought…"
        />
      </div>
    </div>
  )
}
