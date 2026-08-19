import type { WithChildren, WithClassName } from '../../types/common'
import './FilterActions.scss'

const FilterActions = ({ children, className }: WithChildren & WithClassName) => (
  <div className={`FilterActions ${className || ''}`}>
    {children}
  </div>
)

export default FilterActions
