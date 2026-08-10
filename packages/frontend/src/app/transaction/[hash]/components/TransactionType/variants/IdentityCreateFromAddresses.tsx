import { Flex, Grid, GridItem, Stack, Text } from '@chakra-ui/react'
import { ValueCard } from '@components/cards'
import { InfoLine, Identifier } from '@components/data'
import { PublicKeyCard } from '@components/transactions'
import type { PublicKeyData } from 'src/components/transactions/PublicKeyCard'
import type {
  DecodedInputWitness,
  DecodedTxInput,
  DecodedTxOutput,
  WithLoading
} from '../../types'

interface IdentityCreateFromAddressesProps extends WithLoading {
  publicKeys?: PublicKeyData[] | null
  userFeeIncrease?: number | null
  inputs?: DecodedTxInput[]
  inputWitness?: DecodedInputWitness[]
  outputs?: DecodedTxOutput[]
}

export const IdentityCreateFromAddresses = ({
  publicKeys,
  userFeeIncrease,
  inputs = [],
  inputWitness = [],
  outputs = [],
  loading
}: IdentityCreateFromAddressesProps) => (
  <>
    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--Inline'}
      title={'User Fee Increase'}
      value={userFeeIncrease}
      error={userFeeIncrease === undefined}
    />

    {inputs && inputs.length > 0 && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={`Inputs (${inputs.length})`}
        align={inputs.length !== 1 ? 'top' : undefined}
        value={
          <Stack gap={2}>
            {inputs.map((input, index) => (
              <ValueCard key={index}>
                <Flex
                  direction={{ base: 'column', lg: 'row' }}
                  align={{ lg: 'center' }}
                  justify='space-between'
                  gap={4}
                  w='100%'
                >
                  <ValueCard link={`/platformAddress/${input.platformAddress.bech32m}`}>
                    <Identifier
                      avatar
                      copyButton
                      ellipsis
                      styles={['highlight-both']}
                    >
                      {input.platformAddress.bech32m}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>{input.credits} credits</ValueCard>
                  <ValueCard>Nonce: {input.nonce}</ValueCard>
                </Flex>
              </ValueCard>
            ))}
          </Stack>
        }
      />
    )}

    {inputWitness && inputWitness.length > 0 && (
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth'}
        title={`Input Witness (${inputWitness.length})`}
        align={inputWitness.length !== 1 ? 'top' : undefined}
        value={
          <Stack gap={2}>
            {inputWitness.map((witness, index) => (
              <ValueCard key={index}>
                <Grid
                  templateColumns={{
                    base: '1fr minmax(240px, 1fr)',
                    md: '100px minmax(100px, 1fr)'
                  }}
                  gap={4}
                >
                  <Text>Type:</Text>
                  <GridItem width='fit-content' minW='min-content'>
                    <ValueCard>{witness.type}</ValueCard>
                  </GridItem>

                  <Text>Signature:</Text>
                  <ValueCard>
                    {witness.value && witness.value.signature && (
                      <Identifier
                        copyButton
                        ellipsis
                        styles={['highlight-both']}
                      >
                        {witness.value.signature}
                      </Identifier>
                    )}
                  </ValueCard>
                </Grid>
              </ValueCard>
            ))}
          </Stack>
        }
      />
    )}

    {outputs && outputs.length > 0 && (
      <InfoLine
        align={outputs.length !== 1 ? 'top' : undefined}
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--FullWidth TransactionPage__InfoLine--Outputs'}
        title={`Outputs (${outputs.length})`}
        value={
          <Flex direction='column' gap={2}>
            {outputs.map((output, index) => (
              <ValueCard key={index}>
                <Flex gap={4} direction={{ base: 'column', md: 'row' }} w='100%'>
                  <ValueCard className='TransactionPage__AddressCard' link={`/platformAddress/${output.platformAddress.bech32m}`}>
                    <Identifier
                      avatar
                      copyButton
                      ellipsis
                      styles={['highlight-both']}
                    >
                      {output.platformAddress.bech32m}
                    </Identifier>
                  </ValueCard>
                  <ValueCard>
                    <div>{output.credits} credits</div>
                  </ValueCard>
                </Flex>
              </ValueCard>
            ))}
          </Flex>
        }
      />
    )}

    <InfoLine
      className={'TransactionPage__InfoLine TransactionPage__InfoLine--PublicKeys'}
      title={`Public Keys${publicKeys !== undefined ? ` (${publicKeys?.length})` : ''}`}
      value={
        <>
          {publicKeys?.map((publicKey, i) => (
            <PublicKeyCard
              className={'TransactionPage__PublicKeyCard'}
              publicKey={publicKey}
              key={i}
            />
          ))}
        </>
      }
      loading={loading}
      error={publicKeys === undefined}
    />
  </>
)
