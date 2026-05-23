'use client'

import { useMemo } from 'react'
import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { useTokenWizard } from '../../TokenWizardContext'
import { buildTokenConfiguration } from '../../buildTokenConfiguration'

// Same palette override as /dataContract/create SchemaField — Platform Explorer dark.
const platformTheme = EditorView.theme({
  '&': {
    backgroundColor: '#2E393D',
    border: '1px solid #404E53',
    borderRadius: '0.375rem',
    overflow: 'hidden',
    fontSize: '12px'
  },
  '.cm-gutters': {
    backgroundColor: '#1F2528',
    borderRight: '1px solid #404E53',
    color: '#6B7780'
  },
  '.cm-activeLineGutter': {
    backgroundColor: 'transparent'
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent'
  }
})

const readOnlyExtensions = [
  json(),
  platformTheme,
  EditorView.editable.of(false),
  EditorState.readOnly.of(true)
]

function JsonPreview () {
  const { form } = useTokenWizard()
  const configuration = useMemo(() => buildTokenConfiguration(form), [form])
  const code = useMemo(() => JSON.stringify(configuration, null, 2), [configuration])

  return (
    <div className='Preview__Json'>
      <div className='Preview__JsonTitle'>Token configuration</div>
      <CodeMirror
        value={code}
        extensions={readOnlyExtensions}
        theme={oneDark}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: false,
          highlightActiveLineGutter: false,
          bracketMatching: true,
          autocompletion: false,
          indentOnInput: false
        }}
        height='280px'
        minHeight='200px'
        maxHeight='480px'
      />
    </div>
  )
}

export default JsonPreview
