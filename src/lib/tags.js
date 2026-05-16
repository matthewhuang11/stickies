const KEY = 'stickies.tags'

export const TAG_COLORS = [
  '#d47f8c', // dusty rose
  '#6fa87e', // sage green
  '#7292b8', // slate blue
  '#c9a040', // mustard
  '#c27055', // terracotta
  '#9b80c8', // lavender
  '#4a9e9e', // muted teal
  '#e08870', // soft coral
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
