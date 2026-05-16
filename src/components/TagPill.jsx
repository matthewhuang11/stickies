import { getContrastColor } from '../lib/tags'

export function TagPill({ tag }) {
  return (
    <span
      style={{ backgroundColor: tag.color, color: getContrastColor(tag.color) }}
      className="inline-block rounded-full text-[11px] font-medium leading-none px-2 py-0.5 max-w-full truncate flex-shrink-0"
    >
      {tag.name}
    </span>
  )
}
