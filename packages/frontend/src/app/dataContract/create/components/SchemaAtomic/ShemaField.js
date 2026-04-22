import CodeMirror from '@uiw/react-codemirror'
import { json } from '@codemirror/lang-json'
import { oneDark } from '@codemirror/theme-one-dark'
import { EditorView } from '@codemirror/view'
import { useSchema } from '../../SchemaProvider'

// Override oneDark colors to match Platform Explorer dark palette
const platformTheme = EditorView.theme({
  '&': {
    backgroundColor: '#2E393D',
    border: '1px solid #404E53',
    borderRadius: '0.375rem',
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
    backgroundColor: 'rgba(255, 255, 255, 0.03)'
  },
  '.cm-content': {
    caretColor: '#ffffff'
  },
  '&.cm-focused': {
    outline: 'none'
  },
  '&.cm-focused .cm-cursor': {
    borderLeftColor: '#ffffff'
  }
})

export const SchemaField = ({ className }) => {
  const { value, handleChange } = useSchema()

  return (
    <CodeMirror
      className={className}
      value={value}
      onChange={handleChange}
      extensions={[json(), platformTheme]}
      theme={oneDark}
      basicSetup={{
        lineNumbers: true,
        foldGutter: true,
        highlightActiveLine: true,
        highlightActiveLineGutter: true,
        bracketMatching: true,
        autocompletion: false,
        indentOnInput: true
      }}
      height='calc(100vh - 500px)'
      minHeight='300px'
    />
  )
}
