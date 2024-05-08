import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalBody,
  ModalCloseButton,
  Text
} from '@chakra-ui/react'

export default function ModalWindow ({ open, text, setShowModal }) {
  if (!open) return <></>

  return (
    <Modal
        isOpen={open}
        onClose={() => setShowModal(false)}
    >
        <ModalOverlay/>
        <ModalContent containerProps={{ alignItems: 'center' }}>
            <ModalCloseButton/>
            <ModalBody py={20}>
                <Text textAlign={['left', 'center']}>{ text }</Text>
            </ModalBody>
        </ModalContent>
    </Modal>
  )
}
