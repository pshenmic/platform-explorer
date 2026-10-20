'use client'

import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, placeholder as cmPlaceholder } from '@codemirror/view'
import type { Extension } from '@codemirror/state'
import type { WithClassName } from '../../types/common'
import { CopyButton } from '../ui/Buttons'
import './JsonViewer.css'

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#2E393D',
    border: '1px solid #404E53',
    borderRadius: '0.625rem',
    overflow: 'hidden',
    fontSize: '13px'
  },
  '.cm-gutters': {
    backgroundColor: '#1F2528',
    borderRight: '1px solid #404E53',
    color: '#9AAEB6'
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-activeLine': { backgroundColor: 'transparent' },
  '.cm-content': { caretColor: 'transparent', padding: '12px 0' },
  '.cm-scroller': { fontFamily: 'var(--pe-font-mono)', lineHeight: '1.6' },
  '&.cm-focused': { outline: '2px solid var(--pe-color-brand-normal)', outlineOffset: '-2px' }
})

interface JsonViewerProps extends WithClassName {
  value?: unknown
  label?: string
  minHeight?: string
  maxHeight?: string
  fill?: boolean
  showCopy?: boolean
  placeholder?: string
}

function JsonViewer({
  value,
  label = 'JSON',
  minHeight = '100px',
  maxHeight = '500px',
  fill = false,
  showCopy = true,
  placeholder,
  className = ''
}: JsonViewerProps) {
  const text = useMemo(() => {
    if (value == null) return ''
    if (typeof value !== 'string') return JSON.stringify(value, null, 2)
    try {
      return JSON.stringify(JSON.parse(value), null, 2)
    } catch {
      return value
    }
  }, [value])

  const extensions: Extension[] = [
    json(),
    editorTheme,
    EditorView.editable.of(false),
    EditorView.contentAttributes.of({ tabindex: '0', 'aria-label': label })
  ]
  if (!text && placeholder) extensions.push(cmPlaceholder(placeholder))

  return (
    <div className={`JsonViewer ${fill ? 'JsonViewer--Fill' : ''} ${className}`}>
      {showCopy && text && (
        <div className="JsonViewer__Toolbar">
          <span>{label}</span>
          <CopyButton text={text} label="Copy JSON" />
        </div>
      )}
      <CodeMirror
        className={'JsonViewer__Editor'}
        value={text}
        readOnly
        extensions={extensions}
        theme={oneDark}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          bracketMatching: true,
          autocompletion: false
        }}
        height={fill ? '100%' : 'auto'}
        minHeight={fill ? undefined : minHeight}
        maxHeight={fill ? undefined : maxHeight}
      />
    </div>
  )
}

export default JsonViewer
