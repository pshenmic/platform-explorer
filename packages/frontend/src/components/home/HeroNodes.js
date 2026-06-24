'use client'

import { useEffect, useRef } from 'react'

// Decorative Hero
const LINK_DIST = 130
const NODE_MIN = 18
const NODE_MAX = 44
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
    const mouse = { x: -1, y: -1, active: false }

    // center-weighted X: square the uniform random toward the middle so the middle is denser
    const centerBiasedX = (seed) => {
      const u = ((Math.sin(seed * 12.9898) * 43758.5453) % 1 + 1) % 1
      const v = ((Math.sin(seed * 78.233) * 24634.6345) % 1 + 1) % 1
      const centered = 0.5 + (u - 0.5) * Math.pow(v, 0.55)
      return Math.min(0.98, Math.max(0.02, centered))
    }
    const rand = (seed) => (((Math.sin(seed * 91.7) * 19273.1) % 1) + 1) % 1

    const build = () => {
      const count = Math.max(NODE_MIN, Math.min(NODE_MAX, Math.round(width / 30)))
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

    const resize = () => {
      width = parent.clientWidth
      height = parent.clientHeight
      dpr = Math.min(1.5, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = width + 'px'
      canvas.style.height = height + 'px'
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
    }

    const draw = (t) => {
      ctx.clearRect(0, 0, width, height)

      for (const n of nodes) {
        n.x += n.vx
        n.y += n.vy
        if (n.x < 0 || n.x > width) n.vx *= -1
        if (n.y < 0 || n.y > height) n.vy *= -1
        n.x = Math.max(0, Math.min(width, n.x))
        n.y = Math.max(0, Math.min(height, n.y))
      }

      // links
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const dist = Math.hypot(dx, dy)
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

      // cursor links to nearby nodes
      if (mouse.active) {
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

      // nodes
      for (const n of nodes) {
        const pulse = reduced ? 1 : 1 + Math.sin(t / 900 + n.pulse) * 0.18
        const r = n.r * pulse
        ctx.fillStyle = `rgba(${BRAND_LIGHT}, 0.7)`
        ctx.beginPath()
        ctx.arc(n.x, n.y, r, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const loop = (t) => {
      draw(t)
      raf = requestAnimationFrame(loop)
    }

    const start = () => {
      if (raf == null && !reduced && !document.hidden) raf = requestAnimationFrame(loop)
    }
    const stop = () => {
      if (raf != null) { cancelAnimationFrame(raf); raf = null }
    }

    const onVisibility = () => { document.hidden ? stop() : start() }
    const onMove = (e) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      mouse.active = true
    }
    const onLeave = () => { mouse.active = false }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    if (reduced) {
      draw(0)
    } else {
      start()
      document.addEventListener('visibilitychange', onVisibility)
      parent.addEventListener('mousemove', onMove)
      parent.addEventListener('mouseleave', onLeave)
    }

    return () => {
      stop()
      ro.disconnect()
      document.removeEventListener('visibilitychange', onVisibility)
      parent.removeEventListener('mousemove', onMove)
      parent.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return <canvas ref={canvasRef} className={'HomeHero__Nodes'} aria-hidden={'true'}/>
}
