import { jsonLanguage } from '@codemirror/lang-json'
import { highlightTree, tagHighlighter, tags } from '@lezer/highlight'
import type { ReactNode } from 'react'

const highlighter = tagHighlighter([
  { tag: tags.propertyName, class: 'ApiJson__Key' },
  { tag: tags.string, class: 'ApiJson__String' },
  { tag: tags.number, class: 'ApiJson__Number' },
  { tag: [tags.bool, tags.null], class: 'ApiJson__Literal' }
])

// This component runs on the server; the browser only receives text and spans.
export default function JsonHighlight({ text }: { text: string }) {
  // Lezer recovers from omissions such as `...` in documentation examples.
  // Keep non-JSON blocks (HTTP and response codes) as plain text.
  if (!/^[\s]*[[{]/.test(text)) return text
  const content: ReactNode[] = []
  let position = 0
  highlightTree(jsonLanguage.parser.parse(text), highlighter, (from, to, className) => {
    if (from > position) content.push(text.slice(position, from))
    content.push(
      <span key={from} className={className}>
        {text.slice(from, to)}
      </span>
    )
    position = to
  })
  if (position < text.length) content.push(text.slice(position))
  return content
}
