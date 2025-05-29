import './FilterGroup.scss'

export const FilterGroup = ({ title, children, className }) => (
  <div className={`FilterGroup ${className || ''}`}>
    <div className={'FilterGroup__Title'}>{title}</div>
    <div className={'FilterGroup__Content'}>{children}</div>
  </div>
)
