import { useEffect, useState } from 'react'
import { Box, Text, Popover, PopoverTrigger, PopoverContent, PopoverBody, Link } from '@chakra-ui/react'
import { ChevronIcon } from '../icons'
import './MenuLevel.scss'

function MenuLevel ({ items = [], onMenuItemClick, placement = 'right-start', onLevelClose, forceClose, activeItemId, onActiveItemChange }) {
  const [openSubMenuId, setOpenSubMenuId] = useState(null)

  useEffect(() => {
    if (forceClose) setOpenSubMenuId(null)
  }, [forceClose])

  const handleItemClick = (item, index) => {
    if (item?.subMenu?.length || item?.content) {
      if (openSubMenuId === index) {
        setOpenSubMenuId(null)
      } else {
        setOpenSubMenuId(index)
      }
      return
    }

    if (item?.onClick) {
      item?.onClick()
      onMenuItemClick && onMenuItemClick()
    }
  }

  const handleSubMenuClose = () => {
    setOpenSubMenuId(null)
  }

  return (
    <div className={'MenuLevel'}>
      {items.map((item, index) => {
        const isActive = activeItemId === index

        if (item.link) {
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
              <Box
                className={'MenuLevel__Item'}
                px={3}
                py={2}
                cursor={'pointer'}
                _hover={{ bg: 'transparent' }}
              >
                {<Text>{item.label}</Text>}
              </Box>
            </Link>
          )
        }

        if (item.subMenu?.length || item.content) {
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
              offset={[0, 30]}
            >
              <PopoverTrigger>
                <div
                  className={`MenuLevel__Item MenuLevel__Item--Submenu ${isActive ? 'MenuLevel__Item--Active' : ''}`}
                  onClick={() => handleItemClick(item, index)}
                >
                  {<Text>{item.label}</Text>}
                  <div className={'MenuLevel__ItemIcon'}>
                    <ChevronIcon/>
                  </div>
                </div>
              </PopoverTrigger>
              <PopoverContent width={'auto'} minWidth={'180px'}>
                <PopoverBody p={0}>
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
          <Box
            key={index}
            className={`MenuLevel__Item ${isActive ? 'active' : ''}`}
            px={3}
            py={2}
            cursor="pointer"
            _hover={{ bg: 'transparent' }}
            onClick={() => handleItemClick(item, index)}
          >
            {<Text>{item.label}</Text>}
          </Box>
        )
      })}
    </div>
  )
}

export default MenuLevel
