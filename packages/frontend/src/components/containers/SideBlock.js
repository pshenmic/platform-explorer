import './SideBlock.scss'

export default function SideBlock ({ children, className }) {
  return (
    <div className={`SideBlock ${className || ''}`}>
        {children}
    </div>
  )
}
