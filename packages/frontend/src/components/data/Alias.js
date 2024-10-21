import './Alias.scss'

export default function Alias ({ children, ellipsis = true, className }) {
  const dashIndex = children.lastIndexOf('.dash')

  return (
    <div className={`Alias ${ellipsis && 'Alias--Ellipsis'}  ${className || ''}`}>
      <span className={'Alias__Name'}>
        {dashIndex !== -1
          ? children.slice(0, dashIndex)
          : children
        }
      </span>

      {dashIndex !== -1 &&
        <span className={'Alias__Domain'}>
          {children.slice(dashIndex)}
        </span>
      }
    </div>
  )
}
