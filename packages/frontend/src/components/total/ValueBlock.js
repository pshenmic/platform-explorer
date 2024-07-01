import './ValueBlock.scss'

export default function ValueBlock ({ title, value, icon, className }) {
  const iconClass = `ValueBlock--${icon}`

  return (
    <div className={`ValueBlock ${iconClass} ${className}`}>
        {icon &&
            <div className={'ValueBlock__Icon'}></div>
        }
        {title &&
            <div className={'ValueBlock__Title'}>{title}</div>
        }
        {value &&
            <div className={'ValueBlock__Value'}>{value}</div>
        }
    </div>
  )
}
