import { emptyDoc, docFromText } from './tiptap'

function migrateSticky(raw) {
  let s = raw
  if (typeof s.content === 'string') {
    s = { ...s, title: s.title ?? '', mode: 'text', content: docFromText(s.content), completedAt: s.completedAt ?? null }
  }
  if (s.tagId === undefined) s = { ...s, tagId: null }
  return s
}

export function createSticky() {
  const now = Date.now()
  return {
    id: crypto.randomUUID(),
    title: '',
    mode: 'text',
    content: emptyDoc(),
    color: '#fef08a',
    rotation: parseFloat((Math.random() * 8 - 4).toFixed(2)),
    createdAt: now,
    completedAt: null,
    tagIds: [],
    sortOrder: now,
  }
}

export function loadStickies() {
  try {
    const raw = JSON.parse(localStorage.getItem('stickies') ?? '[]')
    const migrated = raw.map(migrateSticky)
    if (migrated.some((s, i) => s !== raw[i])) saveStickies(migrated)
    return migrated
  } catch {
    return []
  }
}

export function saveStickies(stickies) {
  localStorage.setItem('stickies', JSON.stringify(stickies))
}

export function isStickyEmpty(sticky) {
  if (sticky.title.trim()) return false
  if (sticky.mode === 'checklist') {
    return sticky.content.every(item => !item.text.trim())
  }
  return !(sticky.content?.content?.some(node =>
    node.content?.some(child => child.text?.trim())
  ))
}
