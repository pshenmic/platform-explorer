import { Box } from '@chakra-ui/react'
import { CardWrapper } from './CardWrapper'
import { SchemaHeader, SchemaField, FormControls } from './schemaAtomic'

import styles from './Schema.module.scss'

export const Schema = () => (
    <CardWrapper title='Contract' className={styles.schema}>
        <SchemaHeader />
        <SchemaField className={styles.code} />
        <Box mt={2}>
          <FormControls />
        </Box>
    </CardWrapper>
)
