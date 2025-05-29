import Link from 'next/link'
import './ValueCard.scss'

const Wrapper = (props) => {
  return props?.link
    ? <Link onMouseMove={props.onMouseMove} href={props.link} className={props.className}>{props.children}</Link>
    : <div onMouseMove={props.onMouseMove} className={props.className}>{props.children}</div>
}

export default function ValueCard ({ link, clickable, loading, colorScheme = 'default', size = 'default', children, className }) {
  const colorClasses = {
    default: '',
    transparent: 'ValueCard--BgTransparent',
    green: 'ValueCard--Green'
  }

  const sizeClasses = {
    default: '',
    sm: 'ValueCard--SizeSm'
  }

  let extraClass = ''
  if (link || clickable) extraClass += 'ValueCard--Clickable'
  extraClass += ' ' + colorClasses?.[colorScheme] || colorClasses.default
  extraClass += ' ' + sizeClasses?.[size] || sizeClasses.default

  return (
    <Wrapper
      className={`ValueCard ${className || ''} ${loading ? 'ValueCard--Loading' : ''} ${extraClass || ''}`}
      link={link}
    >
      {children}
    </Wrapper>
  )
}
