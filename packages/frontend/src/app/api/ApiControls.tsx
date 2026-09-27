'use client'

import { useId, useState } from 'react'
export function ApiNavigation({ entries }: { entries: { title: string; href: string }[] }) {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const id = useId()
  const filtered = entries.filter(entry =>
    entry.title.toLowerCase().includes(query.trim().toLowerCase())
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
      <div id={id} className={`ApiNavigation__Content ${open ? 'is-open' : ''}`}>
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
              <a href={entry.href} onClick={() => setOpen(false)}>
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
