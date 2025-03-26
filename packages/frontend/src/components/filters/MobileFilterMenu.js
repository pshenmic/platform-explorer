import { useState, useRef } from 'react'
import { Box, Button, Flex, Icon, Text } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { useSpring, animated } from 'react-spring'
import './MobileFilterMenu.scss'

const AnimatedBox = animated(Box)

export const MobileFilterMenu = ({
  menuItems,
  onSubmit
}) => {
  const [activeItem, setActiveItem] = useState(null)
  const firstRender = useRef(true)

  const slideAnimation = useSpring({
    transform: activeItem
      ? 'translateX(0)'
      : firstRender.current
        ? 'translateX(0)'
        : 'translateX(-100%)',
    config: { tension: 280, friction: 60 }
  })

  const reverseSlideAnimation = useSpring({
    transform: activeItem
      ? 'translateX(100%)'
      : firstRender.current
        ? 'translateX(0)'
        : 'translateX(0)',
    config: { tension: 280, friction: 60 }
  })

  // Переключение на главное меню
  const goToMainMenu = () => {
    firstRender.current = false
    setActiveItem(null)
  }

  // Выбор отдельного фильтра из меню
  const selectMenuItem = (item) => {
    firstRender.current = false
    setActiveItem(item)
  }

  return (
    <Box className="MobileFilterMenu" position="relative" overflow="hidden" height="100%">
      <AnimatedBox
        style={reverseSlideAnimation}
        className={'MobileFilterMenu__Screen'}
        position={activeItem ? 'absolute' : 'relative'}
        width="100%"
        height="100%"
      >
        <Box className="MobileFilterMenu__List">
          {menuItems.map((item, index) => (
            <Flex
              key={index}
              className="MobileFilterMenu__Item"
              onClick={() => selectMenuItem(item)}
              justifyContent="space-between"
              alignItems="center"
              p={3}
              borderBottom="1px solid"
              borderColor="gray.200"
              cursor="pointer"
            >
              <Text fontWeight="medium">{item.label}</Text>

              <Flex alignItems="center">
                {item.activeFilterValue && (
                  <Text color="gray.600" mr={2} fontSize="sm">
                    {item.activeFilterValue}
                  </Text>
                )}
                <Icon
                  viewBox="0 0 24 24"
                  boxSize={5}
                >
                  <path
                    fill='currentColor'
                    d='M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z'
                  />
                </Icon>
              </Flex>
            </Flex>
          ))}
        </Box>

        <Button
          mt={4}
          colorScheme="blue"
          width="100%"
          onClick={onSubmit}
          className="MobileFilterMenu__ApplyButton"
        >
          Apply Filters
        </Button>
      </AnimatedBox>

      {activeItem && (
        <AnimatedBox
          style={slideAnimation}
          className="MobileFilterMenu__Screen"
          position="absolute"
          top="0"
          width="100%"
          height="100%"
          bg="white"
        >
          <Flex
            className="MobileFilterMenu__Header"
            onClick={goToMainMenu}
          >
            <Icon as={ChevronLeftIcon}/>
            <Text>Back to filters</Text>
          </Flex>

          <Box className="MobileFilterMenu__Content">
            <Text fontWeight="bold" mb={3}>{activeItem.label}</Text>
            {activeItem.content}
          </Box>
        </AnimatedBox>
      )}
    </Box>
  )
}
