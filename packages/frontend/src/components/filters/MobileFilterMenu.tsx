import { useState, useEffect, useCallback } from 'react'
import { ChevronIcon } from '../ui/icons'
import { FilterValueTag } from './FilterValueTag'
import { SubmitButton } from '../ui/forms'
import type { FilterMenuItem } from './types'
import './MobileFilterMenu.css'
import './Filters.css'

interface MobileFilterMenuProps {
  menuData?: FilterMenuItem[]
  onSubmit?: () => void
  onReset?: () => void
}

export const MobileFilterMenu = ({ menuData = [], onSubmit, onReset }: MobileFilterMenuProps) => {
  const [activeItem, setActiveItem] = useState<FilterMenuItem | null>(null)
  const [renderDetails, setRenderDetails] = useState(false)
  const [renderList, setRenderList] = useState(true)

  useEffect(() => {
    setRenderList(!activeItem)
    setRenderDetails(!!activeItem)
  }, [activeItem])

  const getUpdatedMenuItem = useCallback(
    (item: FilterMenuItem) => {
      if (!item) return null

      const currentItem = menuData.find(menuItem => menuItem.label === item.label)
      return currentItem || item
    },
    [menuData]
  )

  const goToMainMenu = () => setActiveItem(null)
  const selectMenuItem = (item: FilterMenuItem) => setActiveItem(item)

  const hasActiveFilters = menuData.some(item => item.activeFilterValue)

  const currentActiveItem = activeItem ? getUpdatedMenuItem(activeItem) : null

  return (
    <div className={'MobileFilterMenu'}>
      {renderList && (
        <div className={'MobileFilterMenu__Content'}>
          <div className={'MobileFilterMenu__Header'}>
            <div className={'MobileFilterMenu__Title'}>Add Filters</div>

            {hasActiveFilters && (
              <button
                type={'button'}
                className={'MobileFilterMenu__ClearButton Filters__Button Filters__Button--Gray'}
                onClick={onReset}
              >
                Clear
              </button>
            )}
          </div>

          <div className={'MobileFilterMenu__List'}>
            {menuData.map((item, index) => (
              <div
                className={'MobileFilterMenu__Item'}
                onClick={() => selectMenuItem(item)}
                key={index}
              >
                <div className={'MobileFilterMenu__ItemRow'}>
                  <span className={'MobileFilterMenu__ItemTitle'}>{item.label}</span>

                  <div className={'MobileFilterMenu__ItemIcon'}>
                    <ChevronIcon />
                  </div>
                </div>

                {item.activeFilterValue && (
                  <FilterValueTag
                    value={item.activeFilterValue}
                    type={item.type}
                    rawValue={item.rawValue}
                    options={item.options}
                    customRender={item.mobileTagRenderer}
                  />
                )}
              </div>
            ))}
          </div>

          <SubmitButton className={'MobileFilterMenu__SubmitButton'} onClick={onSubmit}>
            Close
          </SubmitButton>
        </div>
      )}

      {renderDetails && currentActiveItem && (
        <div className={'MobileFilterMenu__Content'}>
          <div className={'MobileFilterMenu__Header'}>
            <div className={'MobileFilterMenu__BackButton'} onClick={goToMainMenu}>
              <ChevronIcon style={{ transform: 'rotate(180deg)' }} />
            </div>

            <div className={'MobileFilterMenu__Title'}>{currentActiveItem.title}</div>
          </div>

          <div className={'MobileFilterMenu__DetailView'}>
            <div className={'MobileFilterMenu__Content'}>{currentActiveItem.content}</div>
          </div>
        </div>
      )}
    </div>
  )
}
