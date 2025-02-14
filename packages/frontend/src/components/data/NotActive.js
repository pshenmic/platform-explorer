import './NotActive.scss'

function NotActive ({ children, className }) {
  return (
    <span className={`NotActive ${className || ''}`}>{children || 'n/a'}</span>
  )
}

export default NotActive
