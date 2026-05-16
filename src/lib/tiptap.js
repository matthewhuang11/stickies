import StarterKit from '@tiptap/starter-kit'

export const extensions = [
  StarterKit.configure({
    heading: false,
    orderedList: false,
    blockquote: false,
    codeBlock: false,
    code: false,
    strike: false,
    horizontalRule: false,
  }),
]

export function emptyDoc() {
  return { type: 'doc', content: [{ type: 'paragraph' }] }
}

export function docFromText(text) {
  if (!text.trim()) return emptyDoc()
  return {
    type: 'doc',
    content: [{ type: 'paragraph', content: [{ type: 'text', text }] }],
  }
}
