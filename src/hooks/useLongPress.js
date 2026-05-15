import { useRef, useCallback } from 'react'

export function useLongPress(onLongPress, delay = 500) {
  const timer = useRef(null)
  const startPos = useRef(null)

  const start = useCallback((e) => {
    startPos.current = { x: e.clientX, y: e.clientY }
    timer.current = setTimeout(onLongPress, delay)
  }, [onLongPress, delay])

  const cancel = useCallback(() => {
    clearTimeout(timer.current)
    startPos.current = null
  }, [])

  const move = useCallback((e) => {
    if (!startPos.current) return
    const dx = Math.abs(e.clientX - startPos.current.x)
    const dy = Math.abs(e.clientY - startPos.current.y)
    if (dx > 10 || dy > 10) cancel()
  }, [cancel])

  return {
    onPointerDown: start,
    onPointerUp: cancel,
    onPointerLeave: cancel,
    onPointerMove: move,
    onContextMenu: (e) => e.preventDefault(),
  }
}
