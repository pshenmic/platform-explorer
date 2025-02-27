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
      ? <Link
          href={link}
          {...(external &&
            { target: '_blank', rel: 'noreferrer' }
          )}
          className={props.className}
          {...props}
        >
          {props.children}
        </Link>
      : <div className={props.className} {...props}>{props.children}</div>
  }

  const colorClasses = {
    default: '',
    red: 'ValueContainer--Red',
    green: 'ValueContainer--Green',
    blue: 'ValueContainer--Blue',
    brand: 'ValueContainer--Brand',
    lightGray: 'ValueContainer--LightGray',
    darkGray: 'ValueContainer--DarkGray',
    gray: 'ValueContainer--Gray',
    orange: 'ValueContainer--Orange'
  }

  const sizeClasses = {
    default: '',
    md: 'ValueContainer--SizeMd',
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
