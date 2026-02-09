import { Flex, Input } from '@chakra-ui/react'
import { TrashButton } from '@components/ui/Buttons'
import { Label } from '@components/ui/forms'

import styles from './DocTypeField.module.scss'

export const DocTypeField = () => (
    <Flex my={5} gap={2}>
        <Label className={styles.label} label='Enter Document Type Name'>
            <Input placeholder='Document Type Name...' />
        </Label>
        <TrashButton />
    </Flex>
)
