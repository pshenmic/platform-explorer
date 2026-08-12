import Select from '../ui/Select'
import type { SelectOption } from '../ui/Select'
import type { MenuPlacement, SingleValue } from 'react-select'
import './PageSizeSelector.scss'

interface PageSizeSelectorProps {
  PageSizeSelectHandler?: (option: SingleValue<SelectOption>) => void
  value?: SelectOption | string | number | null
  items?: Array<SelectOption | string | number | null | undefined>
  menuPlacement?: MenuPlacement
}

export default function PageSizeSelector ({
  PageSizeSelectHandler,
  value,
  items,
  menuPlacement = 'auto'
}: PageSizeSelectorProps) {
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
