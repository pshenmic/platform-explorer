import './ValueContainer.scss'

function ValueContainer ({ children, clickable, className, ...props }) {
  return (
    <div className={`ValueContainer ${clickable ? 'ValueContainer--Clickable' : ''} ${className || ''}`} {...props}>
      {children}
    </div>
  )
}

export default ValueContainer
