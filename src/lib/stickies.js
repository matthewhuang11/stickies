export function createSticky(content) {
  return {
    id: crypto.randomUUID(),
    content,
    mode: 'text',
    color: '#fef08a',
    rotation: parseFloat((Math.random() * 8 - 4).toFixed(2)),
    createdAt: Date.now(),
  }
}

export function loadStickies() {
  try {
    return JSON.parse(localStorage.getItem('stickies') ?? '[]')
  } catch {
    return []
  }
}

export function saveStickies(stickies) {
  localStorage.setItem('stickies', JSON.stringify(stickies))
}
