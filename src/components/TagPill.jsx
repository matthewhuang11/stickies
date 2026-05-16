import { getContrastColor } from '../lib/tags'

function hexToRgba(hex, alpha) {
  const r = parseInt(hex.slice(1, 3), 16)
  const g = parseInt(hex.slice(3, 5), 16)
  const b = parseInt(hex.slice(5, 7), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function TagPill({ tag }) {
  return (
    <span
      style={{ backgroundColor: hexToRgba(tag.color, 0.88), color: getContrastColor(tag.color) }}
      className="inline-block rounded-full text-[10px] font-medium leading-none px-[6px] py-[2px] max-w-[96px] truncate flex-shrink-0"
    >
      {tag.name}
    </span>
  )
}
