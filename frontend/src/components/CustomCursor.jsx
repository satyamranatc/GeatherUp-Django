import React, { useEffect, useRef, useState } from 'react'

export default function CustomCursor() {
  const ringRef = useRef(null)
  const dotRef = useRef(null)
  const [enabled] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(pointer: fine)').matches
  )
  const [visible, setVisible] = useState(false)
  const [hovering, setHovering] = useState(false)
  const [clicking, setClicking] = useState(false)

  useEffect(() => {
    if (!enabled) return

    let mouseX = -100
    let mouseY = -100
    let ringX = -100
    let ringY = -100
    let rafId = null

    const interactiveSelector = 'a, button, input, textarea, select, [role="button"], [data-cursor="interactive"]'

    const onMouseMove = (e) => {
      mouseX = e.clientX
      mouseY = e.clientY
      setVisible(true)

      if (dotRef.current) {
        dotRef.current.style.transform = `translate3d(${mouseX}px, ${mouseY}px, 0) translate(-50%, -50%)`
      }

      const target = e.target instanceof Element ? e.target.closest(interactiveSelector) : null
      setHovering(Boolean(target))
    }

    const onMouseDown = () => setClicking(true)
    const onMouseUp = () => setClicking(false)
    const onMouseLeave = () => setVisible(false)

    const animate = () => {
      ringX += (mouseX - ringX) * 0.16
      ringY += (mouseY - ringY) * 0.16

      if (ringRef.current) {
        ringRef.current.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%)`
      }
      rafId = requestAnimationFrame(animate)
    }

    window.addEventListener('mousemove', onMouseMove, { passive: true })
    window.addEventListener('mousedown', onMouseDown)
    window.addEventListener('mouseup', onMouseUp)
    document.addEventListener('mouseleave', onMouseLeave)
    rafId = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mousedown', onMouseDown)
      window.removeEventListener('mouseup', onMouseUp)
      document.removeEventListener('mouseleave', onMouseLeave)
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  if (!enabled) return null

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none fixed inset-0 z-[9999] transition-opacity duration-200 ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {/* Smooth trailing halo */}
      <div
        ref={ringRef}
        className={`fixed top-0 left-0 rounded-full border transition-[width,height,background-color,border-color] duration-200 ease-out ${
          clicking
            ? 'w-5 h-5 border-[#006666] bg-[#008080]/20'
            : hovering
            ? 'w-10 h-10 border-[#008080]/60 bg-[#008080]/10'
            : 'w-7 h-7 border-[#008080]/35 bg-transparent'
        }`}
      />
      {/* Crisp center accent dot */}
      <div
        ref={dotRef}
        className={`fixed top-0 left-0 rounded-full bg-[#008080] transition-transform duration-75 ${
          clicking ? 'w-1.5 h-1.5' : hovering ? 'w-1 h-1 opacity-60' : 'w-1.5 h-1.5 opacity-80'
        }`}
      />
    </div>
  )
}
