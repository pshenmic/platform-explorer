'use client'

import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView, placeholder as cmPlaceholder } from '@codemirror/view'
import { CopyButton } from '../ui/Buttons'
import './JsonViewer.scss'

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: '#2E393D',
    border: '1px solid #404E53',
    borderRadius: '0.625rem',
    overflow: 'hidden',
    fontSize: '12px'
  },
  '.cm-gutters': {
    backgroundColor: '#1F2528',
    borderRight: '1px solid #404E53',
    color: '#6B7780'
  },
  '.cm-activeLineGutter': { backgroundColor: 'transparent' },
  '.cm-activeLine': { backgroundColor: 'transparent' },
  '.cm-content': { caretColor: 'transparent' },
  '&.cm-focused': { outline: 'none' }
})

function JsonViewer ({ value, minHeight = '100px', maxHeight = '500px', fill = false, showCopy = true, placeholder, className = '' }) {
  const text = value == null
    ? ''
    : typeof value === 'string'
      ? value
      : JSON.stringify(value, null, 2)

  const extensions = [json(), editorTheme, EditorView.editable.of(false)]
  if (!text && placeholder) extensions.push(cmPlaceholder(placeholder))

  return (
    <div className={`JsonViewer ${fill ? 'JsonViewer--Fill' : ''} ${className}`}>
      <CodeMirror
        className={'JsonViewer__Editor'}
        value={text}
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
      {showCopy && text && <CopyButton className={'JsonViewer__CopyButton'} text={text}/>}
    </div>
  )
}

export default JsonViewer
