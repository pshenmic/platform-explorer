import { useState, useEffect, useCallback } from 'react'
import { Box, Button, Flex, Fade } from '@chakra-ui/react'
import { ChevronIcon } from '../ui/icons'
import { FilterValueTag } from './FilterValueTag'
import { SubmitButton } from '../ui/forms'
import type { FilterMenuItem } from './types'
import './MobileFilterMenu.css'

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
        <Fade className={'MobileFilterMenu__Content'} in={!activeItem} unmountOnExit>
          <div className={'MobileFilterMenu__Header'}>
            <div className={'MobileFilterMenu__Title'}>Add Filters</div>

            {hasActiveFilters && (
              <Button
                className={'MobileFilterMenu__ClearButton'}
                variant={'gray'}
                size={'sm'}
                onClick={onReset}
              >
                Clear
              </Button>
            )}
          </div>

          <div className={'MobileFilterMenu__List'}>
            {menuData.map((item, index) => (
              <div
                className={'MobileFilterMenu__Item'}
                onClick={() => selectMenuItem(item)}
                key={index}
              >
                <Flex justifyContent={'space-between'} alignItems={'center'}>
                  <span className={'MobileFilterMenu__ItemTitle'}>{item.label}</span>

                  <div className={'MobileFilterMenu__ItemIcon'}>
                    <ChevronIcon />
                  </div>
                </Flex>

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
        </Fade>
      )}

      {renderDetails && currentActiveItem && (
        <Fade className={'MobileFilterMenu__Content'} in={!!currentActiveItem} unmountOnExit>
          <div className={'MobileFilterMenu__Header'}>
            <Flex className={'MobileFilterMenu__BackButton'} onClick={goToMainMenu}>
              <ChevronIcon transform={'rotate(180deg)'} />
            </Flex>

            <div className={'MobileFilterMenu__Title'}>{currentActiveItem.title}</div>
          </div>

          <Box className={'MobileFilterMenu__DetailView'}>
            <Box className={'MobileFilterMenu__Content'}>{currentActiveItem.content}</Box>
          </Box>
        </Fade>
      )}
    </div>
  )
}
