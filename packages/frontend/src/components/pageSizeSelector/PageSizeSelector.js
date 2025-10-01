import Select from '../ui/Select'
import './PageSizeSelector.scss'

export default function PageSizeSelector ({ PageSizeSelectHandler, value, items, menuPlacement = 'auto' }) {
  return (
    <div className={'PageSizeSelector'}>
        <div className={'PageSizeSelector__Title'}>Items on page</div>

        <Select
          value={value}
          onChange={PageSizeSelectHandler}
          options={items}
          menuPlacement={menuPlacement}
          usePortal={true}
        />
    </div>
  )
}
