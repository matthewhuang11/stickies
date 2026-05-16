const KEY = 'stickies.tags'

export const TAG_COLORS = [
  '#cb8895', // dusty rose
  '#7aaa84', // sage
  '#7b94b4', // slate
  '#bf9e46', // antique gold
  '#b87560', // terracotta
  '#9d87c5', // dusty violet
  '#569b9b', // dusty teal
  '#cf8c79', // dusty coral
]

export function loadTags() {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    return JSON.parse(raw)
      .map(t => ({ ...t, createdAt: t.createdAt ?? Date.now() }))
      .sort((a, b) => b.createdAt - a.createdAt)
  } catch {
    return []
  }
}

export function saveTags(tags) {
  localStorage.setItem(KEY, JSON.stringify(tags))
}

export function createTag(name, color) {
  return { id: crypto.randomUUID(), name, color, createdAt: Date.now() }
}

function getLuminance(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255
  const g = parseInt(hex.slice(3, 5), 16) / 255
  const b = parseInt(hex.slice(5, 7), 16) / 255
  const lin = c => c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}

export function getContrastColor(hex) {
  return getLuminance(hex) > 0.5 ? '#111111' : '#ffffff'
}
