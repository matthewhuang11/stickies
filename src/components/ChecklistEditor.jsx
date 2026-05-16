import { useRef } from 'react'

export function ChecklistEditor({ items, onChange }) {
  const inputRefs = useRef([])

  function updateItem(id, patch) {
    onChange(items.map(item => item.id === id ? { ...item, ...patch } : item))
  }

  function addItemAfter(idx) {
    const newItem = { id: crypto.randomUUID(), text: '', checked: false }
    const next = [...items.slice(0, idx + 1), newItem, ...items.slice(idx + 1)]
    onChange(next)
    setTimeout(() => inputRefs.current[idx + 1]?.focus(), 0)
  }

  function removeItem(id, idx) {
    if (items.length <= 1) {
      updateItem(id, { text: '' })
      return
    }
    onChange(items.filter(item => item.id !== id))
    setTimeout(() => inputRefs.current[Math.max(0, idx - 1)]?.focus(), 0)
  }

  return (
    <div className="flex flex-col gap-1.5">
      {items.map((item, idx) => (
        <div key={item.id} className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={item.checked}
            onChange={e => updateItem(item.id, { checked: e.target.checked })}
            className="mt-0.5 flex-shrink-0 cursor-pointer accent-gray-700"
          />
          <input
            ref={el => inputRefs.current[idx] = el}
            value={item.text}
            placeholder="item…"
            onChange={e => updateItem(item.id, { text: e.target.value })}
            onKeyDown={e => {
              if (e.key === 'Enter') { e.preventDefault(); addItemAfter(idx) }
              if (e.key === 'Backspace' && item.text === '') { e.preventDefault(); removeItem(item.id, idx) }
            }}
            className={`flex-1 bg-transparent outline-none text-sm text-gray-800 leading-snug placeholder-gray-400 ${
              item.checked ? 'line-through opacity-50' : ''
            }`}
          />
        </div>
      ))}
    </div>
  )
}
