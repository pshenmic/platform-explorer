import './BigNumber.scss'

function BigNumber ({ children, className }) {
  if (children === undefined) return null

  const numberStr = children.toString()
  const parts = numberStr
    .split('')
    .reverse()
    .reduce((groups, current, i) => {
      if (i % 3 === 0) groups.unshift('')
      groups[0] = current + groups[0]
      return groups
    }, [])

  return (
    <span className={`BigNumber ${className || ''}`}>
      {parts.map((part, i) => (
        <span key={i}>
          <span className={'BigNumber__Group'}>{part}</span>
          {i < parts.length - 1 && <span className={'BigNumber__Space'}></span>}
        </span>
      ))}
    </span>
  )
}

export default BigNumber
