'use client'

import Navbar from '../components/navbar/Navbar'
import { ChakraProvider } from '@chakra-ui/react'
import theme from '../styles/theme'
import '../styles/theme.scss'

export default function RootComponent({ children }) {
    return (
        <ChakraProvider theme={ theme }>
            
            <Navbar/>

            { children }

        </ChakraProvider>
    )
}