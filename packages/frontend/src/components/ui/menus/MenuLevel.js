import { useEffect, useState } from 'react'
import { Box, Flex, Text, Popover, PopoverTrigger, PopoverContent, PopoverBody, Icon, Link } from '@chakra-ui/react'
import { ChevronRightIcon } from '@chakra-ui/icons'
import './MenuLevel.scss'

function MenuLevel ({ items = [], onMenuItemClick, placement = 'right-start', onLevelClose }) {
  const [openSubMenuId, setOpenSubMenuId] = useState(null)

  // Закрываем подменю при закрытии родительского уровня
  useEffect(() => {
    return () => setOpenSubMenuId(null)
  }, [])

  const handleItemClick = (item, index) => {
    // Если есть subMenu, переключаем его состояние
    if (item.subMenu?.length) {
      if (openSubMenuId === index) {
        setOpenSubMenuId(null)
      } else {
        setOpenSubMenuId(index)
      }
      return
    }

    // Если есть onClick, вызываем его
    if (item.onClick) {
      item.onClick()
      // Закрываем всё меню
      onMenuItemClick && onMenuItemClick()
    }
  }

  // Обработчик закрытия подменю
  const handleSubMenuClose = () => {
    setOpenSubMenuId(null)
  }

  return (
    <Box className="MenuLevel">
      {items.map((item, index) => {
        // Если у пункта есть link, рендерим его как ссылку
        if (item.link) {
          return (
            <Link
              key={index}
              href={item.link}
              w="100%"
              textDecoration="none"
              _hover={{ textDecoration: 'none' }}
              onClick={() => onMenuItemClick && onMenuItemClick()}
            >
              <Box
                className="menu-item"
                px={3}
                py={2}
                cursor="pointer"
                _hover={{ bg: 'gray.100' }}
              >
                {item.content || <Text>{item.label}</Text>}
              </Box>
            </Link>
          )
        }

        // Для пунктов с подменю используем Popover
        if (item.subMenu?.length) {
          return (
            <Popover
              key={index}
              isOpen={openSubMenuId === index}
              onClose={handleSubMenuClose}
              placement={placement}
              closeOnBlur={false}
              autoFocus={false}
              strategy="fixed"
            >
              <PopoverTrigger>
                <Flex
                  className="menu-item with-submenu"
                  px={3}
                  py={2}
                  justifyContent="space-between"
                  alignItems="center"
                  cursor="pointer"
                  _hover={{ bg: 'gray.100' }}
                  onClick={() => handleItemClick(item, index)}
                >
                  {item.content || <Text>{item.label}</Text>}
                  <Icon as={ChevronRightIcon} ml={2} />
                </Flex>
              </PopoverTrigger>
              <PopoverContent borderRadius="md" shadow="md" width="auto" minWidth="150px">
                <PopoverBody p={0}>
                  <MenuLevel
                    items={item.subMenu}
                    onMenuItemClick={onMenuItemClick}
                    placement={placement}
                    onLevelClose={handleSubMenuClose}
                  />
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )
        }

        // Обычный пункт меню
        return (
          <Box
            key={index}
            className="menu-item"
            px={3}
            py={2}
            cursor="pointer"
            _hover={{ bg: 'gray.100' }}
            onClick={() => handleItemClick(item, index)}
          >
            {item.content || <Text>{item.label}</Text>}
          </Box>
        )
      })}
    </Box>
  )
}

export default MenuLevel
