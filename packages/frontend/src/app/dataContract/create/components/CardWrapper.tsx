import type { ReactNode } from 'react'
import { Box, Heading } from '@chakra-ui/react'
import { cva } from 'class-variance-authority'

import styles from './CardWrapper.module.css'

const cardStyles = cva(styles.root)

interface CardWrapperProps {
  title: ReactNode
  children?: ReactNode
  className?: string
}

export const CardWrapper = ({ title, children, className }: CardWrapperProps) => (
  <div className={[cardStyles(), className].filter(Boolean).join(' ')}>
    <Heading variant="cloud" size="xs" margin={0}>
      {title}
    </Heading>
    <Box px={6} pb={8} pt={2}>
      {children}
    </Box>
  </div>
)
