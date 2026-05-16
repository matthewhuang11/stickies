import { getContrastColor } from '../lib/tags'

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function TagPill({ tag, isActive, onClick }) {
  return (
    <span
      style={{
        backgroundColor: hexToRgba(tag.color, isActive ? 1 : 0.88),
        color: getContrastColor(tag.color),
        transform: isActive ? 'scale(1.08)' : 'scale(1)',
        transition: 'transform 0.15s ease, background-color 0.15s ease',
      }}
      className={`self-start w-fit rounded-full text-[10px] font-medium leading-none px-[6px] py-[2px] max-w-[96px] truncate${onClick ? ' cursor-pointer' : ''}`}
      onClick={onClick ? e => { e.stopPropagation(); onClick() } : undefined}
    >
      {tag.name}
    </span>
  )
}
