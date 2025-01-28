import './Identifier.scss'
import ImageGenerator from '../imageGenerator'
import { CopyButton } from '../ui/Buttons'

export default function Identifier ({ children, ellipsis = true, avatar, styles = [], copyButton, className }) {
  const highlightMode = (() => {
    if (styles.includes('dim')) return 'dim'
    if (styles.includes('highlight-first')) return 'first'
    if (styles.includes('highlight-last')) return 'last'
    if (styles.includes('highlight-both')) return 'both'
    return null
  })()

  const sizeClass = (() => {
    if (styles.includes('size-32')) return 'Identifier--Size32'
    if (styles.includes('size-44')) return 'Identifier--Size44'
    return ''
  })()

  const HighlightedID = ({ children, mode }) => {
    if (!children) return <span>n/a</span>

    const highlightedCount = 5
    const firstPart = children.slice(0, highlightedCount)
    const middlePart = children.slice(highlightedCount, children.length - highlightedCount)
    const lastPart = children.slice(children.length - highlightedCount)

    return (
      <>
        <span className={`Identifier__Symbols ${mode === 'last' || mode === 'dim' ? 'Identifier__Symbols--Dim' : ''}`}>{firstPart}</span>
        <span className={'Identifier__Symbols Identifier__Symbols--Dim'}>{middlePart}</span>
        <span className={`Identifier__Symbols ${mode === 'first' || mode === 'dim' ? 'Identifier__Symbols--Dim' : ''}`}>{lastPart}</span>
      </>
    )
  }

  return (
    <div className={`Identifier ${sizeClass} ${ellipsis ? 'Identifier--Ellipsis' : ''} ${className || ''}`}>
      {avatar && children && (
        <ImageGenerator className={'Identifier__Avatar'} username={children} lightness={50} saturation={50} width={24} height={24} />
      )}
      <div className={'Identifier__SymbolsContainer'}>
        {children && highlightMode
          ? <HighlightedID mode={highlightMode}>{children}</HighlightedID>
          : children || 'n/a'
        }
      </div>
      {copyButton && children && <CopyButton className={'Identifier__CopyButton'} text={children}/>}
    </div>
  )
}
