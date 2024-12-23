import { ArrowCornerIcon } from '../icons'
import Link from 'next/link'
import './ValueContainer.scss'

function ValueContainer ({
  children,
  clickable,
  link,
  elipsed = false,
  colorScheme = 'default',
  size = 'default',
  external,
  light,
  className,
  ...props
}) {
  const Wrapper = (props) => {
    return typeof link === 'string'
      ? <Link href={link} className={props.className}>{props.children}</Link>
      : <div className={props.className}>{props.children}</div>
  }

  const colorClasses = {
    default: '',
    red: 'ValueContainer--Red',
    green: 'ValueContainer--Green',
    blue: 'ValueContainer--Blue',
    lightGray: 'ValueContainer--LightGray',
    gray: 'ValueContainer--Gray',
    orange: 'ValueContainer--Orange'
  }

  const sizeClasses = {
    default: '',
    sm: 'ValueContainer--SizeSm',
    xs: 'ValueContainer--SizeXs',
    xxs: 'ValueContainer--SizeXxs'
  }

  let extraClass = ''

  if (clickable || link) extraClass += ' ValueContainer--Clickable'
  if (external) extraClass += ' ValueContainer--External'
  if (light) extraClass += ' ValueContainer--Light'
  if (elipsed) extraClass += ' ValueContainer--Elipsed'

  extraClass += ' ' + colorClasses?.[colorScheme] || colorClasses.default
  extraClass += ' ' + sizeClasses?.[size] || sizeClasses.default

  return (
    <Wrapper className={`ValueContainer ${extraClass} ${className || ''}`} {...props}>
      {external && (
        <div className={'ValueContainer__ExternalIcon'}>
          <ArrowCornerIcon color={'brand.normal'} w={'10px'} h={'10px'} mr={'12px'}/>
        </div>
      )}
      <div className={'ValueContainer__Value'}>
        {children}
      </div>
    </Wrapper>
  )
}

export default ValueContainer
