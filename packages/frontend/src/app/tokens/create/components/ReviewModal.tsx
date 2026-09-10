'use client'

import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  Box,
  Text
} from '@chakra-ui/react'
import { useTokenWizard } from '../TokenWizardContext'
import { buildSummary } from '../buildSummary'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isDeploying: boolean
  signerIdentityId?: string
}

function ReviewModal({
  isOpen,
  onClose,
  onConfirm,
  isDeploying,
  signerIdentityId
}: ReviewModalProps) {
  const { form } = useTokenWizard()
  const bullets = buildSummary(form)

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg" isCentered>
      <ModalOverlay />
      <ModalContent className="InfoBlock InfoBlock--Gradient">
        <ModalHeader>Review token deploy</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text fontSize="sm" mb={3} color="var(--chakra-colors-gray-250)">
            Deploying creates a permanent on-chain artifact. Token configuration is mostly
            immutable. Make sure the details below are correct.
          </Text>

          <Box
            as="ul"
            sx={{
              listStyle: 'disc',
              pl: 5,
              fontFamily: 'mono',
              fontSize: '12px',
              lineHeight: '150%',
              color: 'var(--chakra-colors-white-100)'
            }}
          >
            {bullets.map((line, i) => (
              <Box as="li" key={i}>
                {line}
              </Box>
            ))}
          </Box>

          <Box mt={4} fontSize="12px" fontFamily="mono" color="var(--chakra-colors-gray-250)">
            Owner:{' '}
            <Box as="span" color="var(--chakra-colors-white-100)" wordBreak="break-all">
              {signerIdentityId || '—'}
            </Box>
          </Box>

          <Box
            mt={4}
            p={3}
            borderRadius="md"
            border="1px solid"
            borderColor="var(--chakra-colors-yellow-500, #c9a227)"
            color="var(--chakra-colors-yellow-200, #f7e07a)"
            fontSize="12px"
            lineHeight="150%"
          >
            Tip: try on testnet first. Once deployed, supply and rule changes are restricted by the
            configured authorization. Peer-to-peer marketplace is not supported by the protocol yet
            — only direct purchase from the issuer (set later).
          </Box>
        </ModalBody>
        <ModalFooter gap={2}>
          <Button variant="ghost" size="sm" onClick={onClose} isDisabled={isDeploying}>
            Cancel
          </Button>
          <Button
            variant="blue"
            size="sm"
            minW="160px"
            onClick={onConfirm}
            isLoading={isDeploying}
            loadingText="Deploying…"
          >
            Deploy
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  )
}

export default ReviewModal
