'use client'

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import { useActiveNetwork } from '../../contexts/NetworkProvider'
import CopyButton from '../../components/ui/Buttons/CopyButton'
import { ChevronIcon } from '../../components/ui/icons'

export function ApiExample({
  text,
  label = 'Example',
  children
}: {
  text: string
  label?: string
  children?: ReactNode
}) {
  const [expanded, setExpanded] = useState(false)
  const id = useId()
  const long = text.split('\n').length > 16
  return (
    <div className="ApiExample">
      <div className="ApiExample__Toolbar">
        <span>{label}</span>
        <CopyButton text={text} label={`Copy ${label.toLowerCase()}`} />
      </div>
      <pre
        id={id}
        className={long && !expanded ? 'ApiExample__Collapsed' : ''}
        tabIndex={0}
        aria-label={label}
      >
        <code>{children ?? text}</code>
      </pre>
      {long && (
        <button
          type="button"
          className="ApiExample__Toggle"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded(!expanded)}
        >
          {expanded
            ? 'Show less'
            : label === 'Response example'
              ? 'View full response'
              : 'View full example'}
        </button>
      )}
    </div>
  )
}

const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/+$/, '')

export function ApiConnection() {
  const network = useActiveNetwork()
  return (
    <div className="ApiConnection">
      <div className="ApiConnection__Heading">
        <strong>Base URL</strong>
        <span className="ApiConnection__Network">{network.name}</span>
      </div>
      {apiBaseUrl ? (
        <div className="ApiConnection__Address">
          <code>{apiBaseUrl}</code>
          <CopyButton text={apiBaseUrl} label="Copy base URL" />
        </div>
      ) : (
        <p>API URL is not configured for this deployment.</p>
      )}
      <p>
        Requests use this deployment’s network. Sample identifiers and responses may belong to a
        different network or an earlier block.
      </p>
      <a
        className="ApiConnection__Markdown"
        href="/api/markdown"
        download="platform-explorer-api.md"
      >
        Download Markdown
      </a>
    </div>
  )
}

export function ApiRequest({
  path,
  method = 'GET',
  body = ''
}: {
  path: string
  method?: string
  body?: string
}) {
  const [format, setFormat] = useState<'http' | 'curl'>('http')
  const url = apiBaseUrl ? `${apiBaseUrl}${path}` : undefined
  const quote = (value: string) => `'${value.replace(/'/g, "'\\''")}'`
  const command = url
    ? `curl --request ${method} ${quote(url)}${body ? ` --header 'Content-Type: application/json' --data-raw ${quote(body)}` : ''}`
    : undefined
  const text =
    format === 'curl' && command
      ? command
      : `${method} ${path}${body ? `\nContent-Type: application/json\n\n${body}` : ''}`

  return (
    <div className="ApiExample ApiRequest">
      <div className="ApiExample__Toolbar">
        <span>Request</span>
        <div className="ApiRequest__Actions">
          <div role="group" aria-label="Request format">
            <button
              type="button"
              aria-pressed={format === 'http'}
              onClick={() => setFormat('http')}
            >
              HTTP
            </button>
            {command && (
              <button
                type="button"
                aria-pressed={format === 'curl'}
                onClick={() => setFormat('curl')}
              >
                cURL
              </button>
            )}
          </div>
          <CopyButton text={text} label={format === 'curl' ? 'Copy cURL' : 'Copy request'} />
        </div>
      </div>
      <pre tabIndex={0} aria-label="Request">
        <code>{text}</code>
      </pre>
    </div>
  )
}

function revealEndpoint(hash: string) {
  let id: string
  try {
    id = decodeURIComponent(hash.slice(1))
  } catch {
    return
  }
  const target = document.getElementById(id)
  const endpoint = target?.closest<HTMLDetailsElement>('.ApiEndpoint')
  if (endpoint) endpoint.open = true
  return target
}

export function ApiEndpoint({
  id,
  title,
  method,
  path,
  markdown,
  children
}: {
  id: string
  title: string
  method?: string
  path?: string
  markdown: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDetailsElement>(null)
  useEffect(() => {
    if (window.location.hash !== `#${id}` || !ref.current) return
    ref.current.open = true
    const frame = requestAnimationFrame(() => ref.current?.scrollIntoView({ block: 'start' }))
    return () => cancelAnimationFrame(frame)
  }, [id])
  return (
    <details ref={ref} className="ApiEndpoint" id={id}>
      <summary>
        <span className="ApiEndpoint__Heading">
          {method && (
            <span className="ApiMethod" data-method={method}>
              {method}
            </span>
          )}
          <span className="ApiEndpoint__Name">{title}</span>
          <span className="ApiEndpoint__Chevron" aria-hidden="true">
            <ChevronIcon w="6px" h="10px" />
          </span>
          <CopyButton
            className="ApiEndpoint__Copy"
            text={markdown}
            label={`Copy ${title} as Markdown`}
          />
        </span>
        {path && (
          <code className="ApiEndpoint__Path" title={path}>
            {path}
          </code>
        )}
      </summary>
      <div className="ApiEndpoint__Body">{children}</div>
    </details>
  )
}

export function ApiNavigation({
  entries
}: {
  entries: { title: string; href: string; path?: string }[]
}) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const id = useId()
  const [active, setActive] = useState('')
  const navigationRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const container = navigationRef.current
    if (!container || query || !active) return
    if (!open && !container.clientHeight) return
    const link = container.querySelector<HTMLElement>(`a[href="${CSS.escape(active)}"]`)
    if (!link) return
    const bounds = container.getBoundingClientRect()
    const item = link.getBoundingClientRect()
    if (item.top < bounds.top) container.scrollTop += item.top - bounds.top
    else if (item.bottom > bounds.bottom) container.scrollTop += item.bottom - bounds.bottom
  }, [active, query, open])
  useEffect(() => {
    const revealHash = () => {
      const target = revealEndpoint(window.location.hash)
      if (target) {
        setActive(`#${target.closest('.ApiEndpoint')?.id ?? target.id}`)
        requestAnimationFrame(() => target.scrollIntoView({ block: 'start' }))
      }
    }
    setActive(window.location.hash)
    window.addEventListener('hashchange', revealHash)
    const endpoints = [...document.querySelectorAll<HTMLElement>('.ApiEndpoint')]
    let frame = 0
    const update = () => {
      frame = 0
      let current = endpoints[0]
      for (const endpoint of endpoints) {
        if (endpoint.getBoundingClientRect().top > 160) break
        current = endpoint
      }
      if (current) setActive(`#${current.id}`)
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('hashchange', revealHash)
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(frame)
    }
  }, [])
  const filtered = entries.filter(entry =>
    `${entry.title} ${entry.path ?? ''}`.toLowerCase().includes(query.trim().toLowerCase())
  )
  return (
    <nav className="ApiNavigation" aria-label="API reference">
      <button
        type="button"
        className="ApiNavigation__Toggle"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen(!open)}
      >
        Endpoints <span>{open ? '−' : '+'}</span>
      </button>
      <div
        ref={navigationRef}
        id={id}
        className={`ApiNavigation__Content ${open ? 'is-open' : ''}`}
      >
        <label htmlFor={`${id}-filter`}>Find an endpoint</label>
        <input
          id={`${id}-filter`}
          type="search"
          value={query}
          onChange={event => setQuery(event.target.value)}
          placeholder="Filter endpoints…"
        />
        <ul>
          {filtered.map(entry => (
            <li key={entry.href}>
              <a
                href={entry.href}
                aria-current={active === entry.href ? 'location' : undefined}
                onClick={() => {
                  revealEndpoint(entry.href)
                  setActive(entry.href)
                  setOpen(false)
                }}
              >
                {entry.title}
              </a>
            </li>
          ))}
        </ul>
        {!filtered.length && <p role="status">No endpoints found.</p>}
      </div>
    </nav>
  )
}
