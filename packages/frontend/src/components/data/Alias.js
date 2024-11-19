import './Alias.scss'

export default function Alias ({ alias, children, ellipsis = true, className }) {
  alias = alias || children
  if (typeof alias !== 'string') return <></>

  const dashIndex = alias?.lastIndexOf('.dash')

  return (
    <div className={`Alias ${ellipsis ? 'Alias--Ellipsis' : ''}  ${className || ''}`}>
      <span className={'Alias__Name'}>
        {dashIndex !== -1
          ? alias?.slice(0, dashIndex)
          : alias
        }
      </span>

      {dashIndex !== -1 &&
        <span className={'Alias__Domain'}>
          {alias?.slice(dashIndex)}
        </span>
      }
    </div>
  )
}
