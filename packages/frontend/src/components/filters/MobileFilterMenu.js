import { useState, useEffect } from 'react'
import { Box, Button, Flex, Icon, Text, Fade } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import './MobileFilterMenu.scss'

export const MobileFilterMenu = ({
  menuItems,
  onSubmit,
  onReset
}) => {
  const [activeItem, setActiveItem] = useState(null)
  const [shouldRenderDetails, setShouldRenderDetails] = useState(false)
  const [shouldRenderList, setShouldRenderList] = useState(true)

  useEffect(() => {
    if (activeItem) {
      setShouldRenderDetails(true)
      const timer = setTimeout(() => {
        setShouldRenderList(false)
      }, 300)
      return () => clearTimeout(timer)
    } else {
      setShouldRenderList(true)
      const timer = setTimeout(() => {
        setShouldRenderDetails(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [activeItem])

  const goToMainMenu = () => {
    setActiveItem(null)
  }

  const selectMenuItem = (item) => {
    setActiveItem(item)
  }

  const hasActiveFilters = menuItems.some(item => item.activeFilterValue)

  return (
    <Box className="MobileFilterMenu" position="relative">
      {shouldRenderList && (
        <Fade in={!activeItem} unmountOnExit>
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
                    <Text
                      color="blue.500"
                      mr={2}
                      fontSize="sm"
                      fontWeight="medium"
                    >
                      {item.activeFilterValue}
                    </Text>
                  )}
                  <Icon
                    viewBox="0 0 24 24"
                    boxSize={5}
                    color="gray.400"
                  >
                    <path
                      fill="currentColor"
                      d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z"
                    />
                  </Icon>
                </Flex>
              </Flex>
            ))}

            <Flex mt={6} width="100%" justifyContent="space-between">
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  width="48%"
                  onClick={onReset}
                >
                  Reset Filters
                </Button>
              )}

              <Button
                colorScheme="blue"
                width={hasActiveFilters ? '48%' : '100%'}
                onClick={onSubmit}
              >
                Apply Filters
              </Button>
            </Flex>
          </Box>
        </Fade>
      )}

      {/* Детали конкретного фильтра */}
      {shouldRenderDetails && (
        <Fade in={!!activeItem} unmountOnExit>
          <Box className="MobileFilterMenu__DetailView">
            <Flex
              className="MobileFilterMenu__BackButton"
              onClick={goToMainMenu}
              alignItems="center"
              mb={4}
              p={2}
              borderRadius="md"
              color="blue.500"
              cursor="pointer"
              width="fit-content"
            >
              <Icon as={ChevronLeftIcon} boxSize={5} mr={2} />
              <Text fontWeight="medium">Back to filters</Text>
            </Flex>

            {activeItem && (
              <Box className="MobileFilterMenu__Content">
                <Text fontWeight="bold" mb={4} fontSize="lg">{activeItem.label}</Text>
                {activeItem.content}
              </Box>
            )}
          </Box>
        </Fade>
      )}
    </Box>
  )
}
