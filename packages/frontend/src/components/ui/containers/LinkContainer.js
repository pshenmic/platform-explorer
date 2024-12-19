import Link from 'next/link'
import './LinkContainer.scss'

function LinkContainer ({ children, className, href, ...props }) {
  const Wrapper = ({ children, ...props }) => href
    ? <Link href={href} {...props}>{children}</Link>
    : <div {...props}>{children}</div>

  return (
    <Wrapper className={`LinkContainer ${className || ''}`} {...props}>
      {children}
    </Wrapper>
  )
}

export default LinkContainer
