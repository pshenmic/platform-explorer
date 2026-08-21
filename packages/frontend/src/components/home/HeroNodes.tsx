'use client'

import { useEffect, useRef } from 'react'

const LINK_DIST = 190
const NODE_MIN = 24
const NODE_MAX = 72
const PACKET_COUNT = 5
const BRAND = '0, 141, 228'
const BRAND_LIGHT = '44, 187, 255'

type Node = {
  x: number
  y: number
  hx: number
  hy: number
  ampX: number
  ampY: number
  r: number
  pulse: number
}

type Packet = {
  from: number
  to: number
  t: number
  speed: number
}

export default function HeroNodes({
  compact = false,
  className = 'HomeHero__Nodes'
}: {
  compact?: boolean
  className?: string
}) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    const parent =
      (canvas.closest('.HomeHero, .HomeOverview__Sys') as HTMLElement | null) ?? canvas.parentElement
    if (!ctx || !parent) return
    const cellX = compact ? 92 : 88
    const cellY = compact ? 88 : 64
    const linkDist = compact ? 150 : LINK_DIST
    const packetCount = compact ? 1 : PACKET_COUNT
    const nodeMin = compact ? 6 : NODE_MIN
    const nodeMax = compact ? 10 : NODE_MAX
    const linkAlpha = compact ? 0.55 : 0.34
    const linkWidth = compact ? 1.25 : 1
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    let width = 0
    let height = 0
    let dpr = 1
    let nodes: Node[] = []
    let raf: number | null = null
    let inView = true
    let interactive = false
    let lastFrame = 0
    let packets: Packet[] = []
    const mouse = { x: -1, y: -1 }

    const rand = (seed: number) => (((Math.sin(seed * 91.7) * 19273.1) % 1) + 1) % 1

    const build = () => {
      const cols = Math.max(compact ? 2 : 6, Math.round(width / cellX))
      const rows = Math.max(compact ? 3 : 4, Math.round(height / cellY))
      const jitterX = (width / cols) * 0.36
      const jitterY = (height / rows) * 0.36
      const total = Math.min(nodeMax, Math.max(nodeMin, cols * rows))
      nodes = []
      let i = 0
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          if (nodes.length >= total) break
          const s = ++i
          const cx = ((col + 0.5) / cols) * width
          const cy = ((row + 0.5) / rows) * height
          const hx = Math.max(6, Math.min(width - 6, cx + (rand(s * 5.7) - 0.5) * 2 * jitterX))
          const hy = Math.max(6, Math.min(height - 6, cy + (rand(s * 7.3) - 0.5) * 2 * jitterY))
          const cellAmp = compact ? 5 : 10
          nodes.push({
            x: hx,
            y: hy,
            hx,
            hy,
            ampX: cellAmp * (0.55 + rand(s * 11.1) * 0.7),
            ampY: cellAmp * (0.55 + rand(s * 13.3) * 0.7),
            r: 1.5 + rand(s * 9.9) * 2.1,
            pulse: rand(s * 2.2) * Math.PI * 2
          })
        }
      }
    }

    const nearestOther = (from: number, skip: number) => {
      let to = (from + 1) % nodes.length
      let best = Infinity
      for (let j = 0; j < nodes.length; j++) {
        if (j === from || j === skip) continue
        const d = Math.hypot(nodes[from].x - nodes[j].x, nodes[from].y - nodes[j].y)
        if (d < best && d > 10) {
          best = d
          to = j
        }
      }
      return to
    }

    const seedPackets = () => {
      packets = []
      if (nodes.length < 2) return
      for (let p = 0; p < packetCount; p++) {
        const from = Math.min(nodes.length - 1, Math.floor(rand(p + 2.1) * nodes.length))
        packets.push({
          from,
          to: nearestOther(from, -1),
          t: rand(p + 4.4),
          speed: 0.0035 + rand(p + 9.2) * 0.0055
        })
      }
    }

    const draw = (t: number, animate: boolean) => {
      ctx.clearRect(0, 0, width, height)

      if (animate) {
        for (const n of nodes) {
          n.x = n.hx + Math.sin(t / 1800 + n.pulse) * n.ampX
          n.y = n.hy + Math.cos(t / 2100 + n.pulse * 0.85) * n.ampY
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i]
          const b = nodes[j]
          const dist = Math.hypot(a.x - b.x, a.y - b.y)
          if (dist < linkDist) {
            const alpha = Math.max(compact ? 0.18 : 0.05, (1 - dist / linkDist) * linkAlpha)
            ctx.strokeStyle = `rgba(${BRAND}, ${alpha})`
            ctx.lineWidth = linkWidth
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.stroke()
          }
        }
      }

      if (interactive) {
        for (const n of nodes) {
          const dist = Math.hypot(n.x - mouse.x, n.y - mouse.y)
          if (dist < linkDist * 1.4) {
            const alpha = (1 - dist / (linkDist * 1.4)) * 0.45
            ctx.strokeStyle = `rgba(${BRAND_LIGHT}, ${alpha})`
            ctx.lineWidth = 1.15
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

      if (animate && packets.length) {
        for (const pkt of packets) {
          pkt.t += pkt.speed
          if (pkt.t >= 1) {
            const prev = pkt.from
            pkt.from = pkt.to
            pkt.to = nearestOther(pkt.from, prev)
            pkt.t = 0
          }
          const a = nodes[pkt.from]
          const b = nodes[pkt.to]
          if (!a || !b) continue
          const x = a.x + (b.x - a.x) * pkt.t
          const y = a.y + (b.y - a.y) * pkt.t
          ctx.fillStyle = `rgba(${BRAND_LIGHT}, 0.95)`
          ctx.beginPath()
          ctx.arc(x, y, 2.4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    const resize = () => {
      width = parent.clientWidth
      height = parent.clientHeight
      dpr = Math.min(1.25, window.devicePixelRatio || 1)
      canvas.width = Math.round(width * dpr)
      canvas.height = Math.round(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      build()
      seedPackets()
      draw(performance.now(), false)
    }

    const shouldRun = () => !reduced && !document.hidden && inView

    const stop = () => {
      if (raf != null) {
        cancelAnimationFrame(raf)
        raf = null
      }
    }

    const loop = (t: number) => {
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

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
      interactive = true
    }

    const onLeave = () => {
      interactive = false
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(parent)

    const io = new IntersectionObserver(([entry]) => {
      inView = entry.isIntersecting
      if (inView) {
        start()
      } else {
        stop()
      }
    })
    io.observe(parent)

    if (reduced) {
      draw(0, false)
    } else {
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
  }, [compact])

  return (
    <div className={className} aria-hidden={'true'}>
      <canvas ref={canvasRef} />
    </div>
  )
}
