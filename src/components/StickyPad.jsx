import { motion } from 'framer-motion'

export function StickyPad({ onTap }) {
  return (
    <motion.button
      onClick={onTap}
      whileTap={{ scale: 0.92 }}
      className="fixed bottom-8 right-8 w-14 h-16 relative"
      style={{ zIndex: 10 }}
      aria-label="New sticky note"
    >
      {/* Layer 3 — bottom, most offset */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          backgroundColor: '#fde068',
          transform: 'rotate(7deg) translate(3px, 4px)',
          boxShadow: '1px 2px 6px rgba(0,0,0,0.22)',
        }}
      />
      {/* Layer 2 */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          backgroundColor: '#fbbf24',
          transform: 'rotate(3.5deg) translate(1.5px, 2px)',
          boxShadow: '1px 2px 5px rgba(0,0,0,0.18)',
        }}
      />
      {/* Layer 1 — top, peelable */}
      <div
        className="absolute inset-0 rounded-sm"
        style={{
          backgroundColor: '#fef08a',
          boxShadow: '2px 3px 10px rgba(0,0,0,0.24)',
        }}
      />
    </motion.button>
  )
}
