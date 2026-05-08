import { Box, Heading } from '@chakra-ui/react'
import { cva } from 'class-variance-authority'

import styles from './CardWrapper.module.scss'

const cardStyles = cva(styles.root)

export const CardWrapper = ({ title, children, className }) => (
    <div className={cardStyles({ className })}>
      <Heading variant='cloud' size='xs' margin={0}>{title}</Heading>
      <Box px={6} pb={8} pt={2}>
        { children }
      </Box>
    </div>
)
