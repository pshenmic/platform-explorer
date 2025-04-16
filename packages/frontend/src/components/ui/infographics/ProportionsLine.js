import { Tooltip } from '../Tooltips'
import './ProportionsLine.scss'

const Wrapper = ({ children, tooltipContent, tooltipTitle, ...props }) => {
  return (tooltipContent || tooltipTitle)
    ? <Tooltip
        title={tooltipTitle}
        content={tooltipContent}
        placement={'top'}
      >
        <div {...props}>
          {children}
        </div>
      </Tooltip>
    : <div {...props}>{children}</div>
}

function ProportionsLine ({ items = [] }) {
  const totalCount = items.reduce((total, item) => total + item.count, 0) || 1
  const allZero = items.length > 0 && items.every(item => item.count === 0)

  return (
    <div className={'ProportionsLine'}>
      {items.map((item, index) => {
        const widthPercentage = allZero
          ? 100 / items.length
          : (item.count / totalCount) * 100

        return (
          <Wrapper
            tooltipTitle={item?.tooltipTitle}
            tooltipContent={item?.tooltipContent}
            className={`ProportionsLine__Item ${item?.count === 0 ? 'ProportionsLine__Item--Empty' : ''}`}
            style={{
              width: `${widthPercentage}%`,
              cursor: item?.tooltipContent || item?.tooltipTitle ? 'pointer' : 'default'
            }}
            key={index}
          >
            <div
              className={'ProportionsLine__ItemLine'}
              style={{ backgroundColor: item?.color || 'gray' }}
            ></div>
            <span
              className={'ProportionsLine__ItemValue'}
              style={{ color: item?.color || '#ffffff' }}
            >
              {item?.count}
            </span>
          </Wrapper>
        )
      })}
    </div>
  )
}

export default ProportionsLine
