import './Identifier.scss'
import ImageGenerator from '../imageGenerator'
import { CopyButton } from '../ui/Buttons'

export default function Identifier ({ children, ellipsis = true, avatar, styles = [], copyButton, className }) {
  const highlightMode = (() => {
    if (styles.includes('dim')) return 'dim'
    if (styles.includes('highlight-first')) return 'first'
    if (styles.includes('highlight-last')) return 'last'
    return null
  })()

  const HighlightedID = ({ children, mode }) => {
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
    <div className={`Identifier ${ellipsis && 'Identifier--Ellipsis'} ${className || ''}`}>
      {avatar && (
        <ImageGenerator className={'Identifier__Avatar'} username={children} lightness={50} saturation={50} width={24} height={24} />
      )}
      <div className={'Identifier__SymbolsContainer'}>
        {highlightMode
          ? <HighlightedID mode={highlightMode}>
              {children}
            </HighlightedID>
          : {children}
        }
      </div>
      {copyButton && <CopyButton className={'Identifier__CopyButton'} text={children}/>}
    </div>
  )
}
