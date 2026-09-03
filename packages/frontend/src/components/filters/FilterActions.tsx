import type { WithChildren, WithClassName } from '../../types/common'
import './FilterActions.css'

const FilterActions = ({ children, className }: WithChildren & WithClassName) => (
  <div className={`FilterActions ${className || ''}`}>{children}</div>
)

export default FilterActions
