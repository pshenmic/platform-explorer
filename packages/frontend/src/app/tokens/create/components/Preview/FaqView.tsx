'use client'

import { Fragment } from 'react'
import type { ReactNode } from 'react'
import { tokenFaqGroups, FIELD_SOURCE, TOKEN_LIMITS_DOC_URL, STRUCT_URL } from '../../tokenFaq'

// Field names in FIELD_SOURCE link to rs-dpp; bare value literals stay plain so the link affordance is honest.
const renderAnswer = (text: string): ReactNode[] =>
  text.split('`').map((part, i) => {
    if (i % 2 === 0) return <Fragment key={i}>{part}</Fragment>
    const href = FIELD_SOURCE[part]
    return href ? (
      <a
        key={i}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="Preview__FaqFieldLink"
      >
        {part}
      </a>
    ) : (
      <code key={i} className="Preview__FaqCode">
        {part}
      </code>
    )
  })

interface FaqViewProps {
  open: Set<string>
  onToggle: (key: string) => void
}

// Companion to the JSON editor — docs.dash.org doesn't cover config fields.
// open-state lives in the parent so it survives switching JSON <-> FAQ tabs.
function FaqView({ open, onToggle }: FaqViewProps) {
  return (
    <div className="Preview__Faq">
      <p className="Preview__FaqIntro">
        These fields aren&apos;t covered by the official token docs (which only describe
        operations). See{' '}
        <a
          href={TOKEN_LIMITS_DOC_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="Preview__FaqSource"
        >
          Constants &amp; Limits ↗
        </a>{' '}
        or the{' '}
        <a
          href={STRUCT_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="Preview__FaqSource"
        >
          full schema ↗
        </a>
        .
      </p>

      {tokenFaqGroups.map(group => (
        <div key={group.title} className="Preview__FaqGroup">
          <div className="Preview__FaqGroupTitle">{group.title}</div>
          {group.items.map(item => {
            const isOpen = open.has(item.key)
            return (
              <div key={item.key} className="Preview__FaqItem">
                <button
                  type="button"
                  className="Preview__FaqQ"
                  aria-expanded={isOpen}
                  onClick={() => onToggle(item.key)}
                >
                  <span className="Preview__FaqMarker">{isOpen ? '▾' : '▸'}</span>
                  <span>{item.question}</span>
                </button>
                {isOpen && <p className="Preview__FaqAnswer">{renderAnswer(item.answer)}</p>}
              </div>
            )
          })}
        </div>
      ))}
    </div>
  )
}

export default FaqView
