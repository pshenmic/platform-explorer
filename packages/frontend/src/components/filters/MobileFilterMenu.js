import { useState, useEffect, useCallback } from 'react'
import { Box, Button, Flex, Icon, Text, Fade } from '@chakra-ui/react'
import { ChevronLeftIcon } from '@chakra-ui/icons'
import { FilterValueTag } from './FilterValueTag'
import './MobileFilterMenu.scss'

export const MobileFilterMenu = ({
  menuData = [],
  onSubmit,
  onReset
}) => {
  const [activeItem, setActiveItem] = useState(null)
  const [renderDetails, setRenderDetails] = useState(false)
  const [renderList, setRenderList] = useState(true)

  useEffect(() => {
    if (activeItem) {
      setRenderDetails(true)
      setRenderList(false)
    } else {
      setRenderList(true)
      setRenderDetails(false)
    }
  }, [activeItem])

  const getUpdatedMenuItem = useCallback((item) => {
    if (!item) return null

    const currentItem = menuData.find(menuItem => menuItem.label === item.label)
    return currentItem || item
  }, [menuData])

  const goToMainMenu = () => {
    setActiveItem(null)
  }

  const selectMenuItem = (item) => {
    setActiveItem(item)
  }

  const hasActiveFilters = menuData.some(item => item.activeFilterValue)

  const currentActiveItem = activeItem ? getUpdatedMenuItem(activeItem) : null

  return (
    <Box className="MobileFilterMenu" position="relative">
      {renderList && (
        <Fade in={!activeItem} unmountOnExit>
          <Box className="MobileFilterMenu__List">
            {menuData.map((item, index) => (
              <Flex
                key={`menu-item-${index}-${item.label}`}
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
                    <Box mr={2}>
                      <FilterValueTag
                        value={item.activeFilterValue}
                        type={item.type}
                        rawValue={item.rawValue}
                        options={item.options}
                        customRenderer={item.customRenderer}
                      />
                    </Box>
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

      {renderDetails && currentActiveItem && (
        <Fade in={!!currentActiveItem} unmountOnExit>
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

            <Box className="MobileFilterMenu__Content">
              <Text fontWeight="bold" mb={4} fontSize="lg">{currentActiveItem.label}</Text>
              {currentActiveItem.content}
            </Box>
          </Box>
        </Fade>
      )}
    </Box>
  )
}
