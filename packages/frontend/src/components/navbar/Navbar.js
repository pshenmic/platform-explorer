import { HamburgerIcon, CloseIcon } from '@chakra-ui/icons'
import GlobalSearchInput from '../search/GlobalSearchInput'

import {
  Box,
  Flex,
  HStack,
  IconButton,
  useDisclosure,
  useColorModeValue,
  Stack,
} from '@chakra-ui/react'

import './Navbar.scss'
import './NavbarMobileMenu.scss'


const links = [
    {title:'Home', href:'/'},
    {title:'Blocks', href:'/blocks'},
    {title:'Data Contracts', href:'/dataContracts'},
    {title:'Identities', href:'/identities'},
]

const NavLink = (props) => {
  const { children, to } = props

  return (
    <Box
      as="a"
      px={2}
      py={1}
      rounded={'md'}
      _hover={{
        textDecoration: 'none',
        bg: useColorModeValue('brand.deep', 'brand.deep'),
      }}
      href={to}>
      {children}
    </Box>
  )
}

function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  return (
    <Box px={3}>
        <Flex
          className={'Navbar'}
          maxW='1980px'
          ml='auto'
          mr='auto'
          h={16}
          alignItems={'center'}
          justifyContent={'space-between'}
        >
          <IconButton
            size={'md'}
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label={'Open Menu'}
            display={{ md: 'none' }}
            onClick={isOpen ? onClose : onOpen}
          />

            <HStack spacing={8} alignItems={'center'}>
                <HStack as={'nav'} spacing={4} display={{ base: 'none', md: 'flex' }}>
                {links.map((link) => (
                    <NavLink to={link.href} key={link.title}>{link.title}</NavLink>
                ))}
                </HStack>

            </HStack>
            <Box ml={2}>
              <GlobalSearchInput />
            </Box>
        </Flex>

        {isOpen ? (
          <Box className={'NavbarMobileMenu'} pb={4} display={{ md: 'none' }}>
            <Stack as={'nav'} spacing={4}>
              {links.map((link) => (
                <NavLink to={link.href} key={link.title}>{link.title}</NavLink>
              ))}
            </Stack>
          </Box>
        ) : null}
    </Box>
  )
}

export default Navbar;
