import { useEffect, useState } from 'react'
import { Popover, PopoverTrigger, PopoverContent, PopoverBody, Link } from '@chakra-ui/react'
import { ChevronIcon } from '../icons'
import './MenuLevel.scss'

function MenuLevel ({ items = [], onMenuItemClick, placement = 'right-start', onLevelClose, forceClose, activeItemId, onActiveItemChange }) {
  const [openSubMenuId, setOpenSubMenuId] = useState(null)

  useEffect(() => {
    if (forceClose) setOpenSubMenuId(null)
  }, [forceClose])

  const handleItemClick = (item, index) => {
    if (item?.subMenu?.length || item?.content) {
      setOpenSubMenuId(prev => prev === index ? null : index)
      return
    }

    if (item?.onClick) {
      item?.onClick()
      onMenuItemClick && onMenuItemClick()
    }
  }

  const handleSubMenuClose = () => {
    onActiveItemChange(null)
    setOpenSubMenuId(null)
    if (typeof onLevelClose === 'function') onLevelClose()
  }

  return (
    <div className={'MenuLevel'}>
      {items.map((item, index) => {
        const isActive = activeItemId === index

        if (item?.disabled) {
          return (
            <div
              key={index}
              onClick={() => onMenuItemClick && onMenuItemClick()}
              className={'MenuLevel__Item MenuLevel__Item--Disabled'}
            >
              <span>{item.label}</span>
            </div>
          )
        }

        if (item?.link) {
          return (
            <Link
              key={index}
              href={item.link}
              w={'100%'}
              textDecoration={'none'}
              _hover={{ textDecoration: 'none' }}
              onClick={() => onMenuItemClick && onMenuItemClick()}
              className={`MenuLevel__Item ${isActive ? 'active' : ''}`}
            >
              <span>{item.label}</span>
            </Link>
          )
        }

        if (item?.subMenu?.length || item?.content) {
          return (
            <Popover
              key={index}
              isOpen={openSubMenuId === index}
              onClose={handleSubMenuClose}
              onOpen={() => onActiveItemChange(index)}
              placement={placement}
              closeOnBlur={true}
              autoFocus={false}
              strategy={'fixed'}
              variant={'menu'}
              offset={[0, 25]}
              overflow={'visible'}
            >
              <PopoverTrigger>
                <div
                  className={`MenuLevel__Item MenuLevel__Item--Submenu ${isActive ? 'MenuLevel__Item--Active' : ''}`}
                  onClick={() => handleItemClick(item, index)}
                >
                  {<span>{item.label}</span>}
                  <div className={'MenuLevel__ItemIcon'}>
                    <ChevronIcon />
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent width={'auto'} minWidth={'180px'}>
                <PopoverBody overflow={'visible'} p={0}>
                  {item.subMenu
                    ? <MenuLevel
                        items={item.subMenu}
                        onMenuItemClick={onMenuItemClick}
                        placement={placement}
                        onLevelClose={handleSubMenuClose}
                        activeItemId={activeItemId}
                        onActiveItemChange={onActiveItemChange}
                      />
                    : item.content
                  }
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )
        }

        return (
          <div
            className={`MenuLevel__Item ${isActive ? 'active' : ''}`}
            onClick={() => handleItemClick(item, index)}
            key={index}
          >
            {<span>{item.label}</span>}
          </div>
        )
      })}
    </div>
  )
}

export default MenuLevel
