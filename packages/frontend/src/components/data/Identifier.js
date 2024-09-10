import './Identifier.scss'
import ImageGenerator from '../imageGenerator'
import { CopyButton } from '../ui/Buttons'

export default function Identifier ({ children, ellipsis = true, avatar, copyButton }) {
  return (
    <div className={`Identifier ${ellipsis && 'Identifier--Ellipsis'}`}>
      {avatar && (
        <ImageGenerator className={'Identifier__Avatar'} username={children} lightness={50} saturation={50} width={28} height={28} />
      )}
      <span>{children}</span>
      {copyButton && <CopyButton text={children}/>}
    </div>
  )
}
