import Link from 'next/link'
import './ValueCard.scss'

const Wrapper = (props, ref) => {
  return props?.link
    ? <Link onMouseMove={props.onMouseMove} href={props.link} className={props.className}>{props.children}</Link>
    : <div onMouseMove={props.onMouseMove} className={props.className}>{props.children}</div>
}

export default function ValueCard ({ link, loading, children, className }) {
  return (
    <Wrapper
      className={`ValueCard ${className} ${loading ? 'ValueCard--Loading' : ''}`}
      link={link}
    >
      {children}
    </Wrapper>
  )
}
