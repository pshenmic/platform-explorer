import './FilterActions.scss'

const FilterActions = ({ children, className }) => (
  <div className={`FilterActions ${className || ''}`}>
    {children}
  </div>
)

export default FilterActions
