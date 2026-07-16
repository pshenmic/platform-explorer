'use client'

import { useEffect, useRef } from 'react'

const LINK_DIST = 130
const NODE_MIN = 12
const NODE_MAX = 26
// short drift after entering view, then freeze until the user hovers the hero
const INTRO_MS = 4000
const BRAND = '0, 141, 228'
const BRAND_LIGHT = '44, 187, 255'

export default function HeroNodes () {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent = canvas.parentElement
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = 1
    let nodes = []
    let raf = null
    let inView = true
    let interactive = false
    let introUntil = 0
    let lastFrame = 0
    const mouse = { x: -1, y: -1 }

    // center-weighted X: denser middle so the constellation sits behind the brand copy
    const centerBiasedX = (seed) => {
      const u = ((Math.sin(seed * 12.9898) * 43758.5453) % 1 + 1) % 1
      const v = ((Math.sin(seed * 78.233) * 24634.6345) % 1 + 1) % 1
      const centered = 0.5 + (u - 0.5) * Math.pow(v, 0.55)
      return Math.min(0.98, Math.max(0.02, centered))
    }
    const rand = (seed) => (((Math.sin(seed * 91.7) * 19273.1) % 1) + 1) % 1

    const build = () => {
      const count = Math.max(NODE_MIN, Math.min(NODE_MAX, Math.round(width / 42)))
      nodes = Array.from({ length: count }, (_, i) => {
        const s = i + 1
        return {
          x: centerBiasedX(s) * width,
          y: rand(s * 3.1) * height,
          vx: (rand(s * 5.7) - 0.5) * 0.22,
          vy: (rand(s * 7.3) - 0.5) * 0.22,
          r: 1.1 + rand(s * 9.9) * 1.6,
          pulse: rand(s * 2.2) * Math.PI * 2
        }
      })
    }

    // animate=false freezes positions (idle snapshot); links only while interactive
    const draw = (t, animate) => {
      ctx.clearRect(0, 0, width, height)

      if (animate) {
        for (const n of nodes) {
          n.x += n.vx
          n.y += n.vy
          if (n.x < 0 || n.x > width) n.vx *= -1
          if (n.y < 0 || n.y > height) n.vy *= -1
          n.x = Math.max(0, Math.min(width, n.x))
          n.y = Math.max(0, Math.min(height, n.y))
        }
      }

      // O(n²) links are the hot path — only while the user is engaging the hero
      if (interactive) {
        for (let i = 0; i < nodes.length; i++) {
          for (let j = i + 1; j < nodes.length; j++) {
            const a = nodes[i]
            const b = nodes[j]
            const dist = Math.hypot(a.x - b.x, a.y - b.y)
            if (dist < LINK_DIST) {
              const alpha = (1 - dist / LINK_DIST) * 0.22
              ctx.strokeStyle = `rgba(${BRAND}, ${alpha})`
              ctx.lineWidth = 1
              ctx.beginPath()
              ctx.moveTo(a.x, a.y)
              ctx.lineTo(b.x, b.y)
              ctx.stroke()
            }
          }
        }

        for (const n of nodes) {
          const dist = Math.hypot(n.x - mouse.x, n.y - mouse.y)
          if (dist < LINK_DIST * 1.4) {
            const alpha = (1 - dist / (LINK_DIST * 1.4)) * 0.4
            ctx.strokeStyle = `rgba(${BRAND_LIGHT}, ${alpha})`
            ctx.lineWidth = 1
            ctx.beginPath()
            ctx.moveTo(n.x, n.y)
            ctx.lineTo(mouse.x, mouse.y)
            ctx.stroke()
          }
        }
      }

      for (const n of nodes) {
        const pulse = animate ? 1 + Math.sin(t / 900 + n.pulse) * 0.18 : 1
        const r = n.r * pulse
        ctx.fillStyle = `rgba(${BRAND_LIGHT}, 0.7)`
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const resize = () => {
      width = parent.clientWidth
      height = parent.clientHeight
      dpr = Math.min(1.25, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
      // static snapshot after layout so idle freeze still shows the field
      draw(performance.now(), false)
    }

    const shouldRun = () => !reduced && !document.hidden && inView && (interactive || performance.now() < introUntil)

    const stop = () => {
      if (raf != null) {
        cancelAnimationFrame(raf)
        raf = null
      }
    }

    // ~24fps while moving; full stop (last frame kept) once idle
    const loop = (t) => {
      if (!shouldRun()) {
        draw(t, false)
        raf = null
        return
      }
      if (t - lastFrame >= 42) {
        lastFrame = t
        draw(t, true)
      }
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (raf == null && shouldRun()) raf = requestAnimationFrame(loop)
    }

    const onVisibility = () => {
      if (document.hidden) stop()
      else start()
    }

    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      if (!interactive) {
        interactive = true
        start()
      }
    }

    const onLeave = () => {
      interactive = false
      // freeze the last animated frame — no rAF while the cursor is away
      stop()
      draw(performance.now(), false)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) {
        introUntil = performance.now() + INTRO_MS
        start()
      } else {
        stop()
      }
    })
    io.observe(parent)

    if (reduced) {
      draw(0, false)
    } else {
      introUntil = performance.now() + INTRO_MS
      start()
      document.addEventListener('visibilitychange', onVisibility)
      parent.addEventListener('mousemove', onMove)
      parent.addEventListener('mouseleave', onLeave)
    }

    return () => {
      stop()
      ro.disconnect()
      io.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={'HomeHero__Nodes'} aria-hidden={'true'}/>
}
