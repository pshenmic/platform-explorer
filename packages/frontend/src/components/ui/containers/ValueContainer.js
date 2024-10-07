import './ValueContainer.scss'

function ValueContainer ({ children, className }) {
  return (
    <div className={`ValueContainer ${className || ''}`}>
      {children}
    </div>
  )
}

export default ValueContainer
