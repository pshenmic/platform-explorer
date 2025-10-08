import { networks } from '../../../../../constants/networks'
import { CopyButton } from '../../../../../components/ui/Buttons'
import { InfoLine, Identifier } from '@components/data'
import { ValueCard } from '@components/cards'
import { ValueContainer } from '@components/ui/containers'

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
const activeNetwork = networks.find(
  (network) => network.explorerBaseUrl === baseUrl
)
const l1explorerBaseUrl = activeNetwork?.l1explorerBaseUrl || null

export const AssetLockProof = ({
  assetLockProof: { fundingCoreTx, instantLock },
  loading
}) => (
  <>
    {instantLock && (
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Asset Lock Proof'}
        value={
          <ValueCard className={'TransactionPage__AssetLockProof'}>
            {instantLock}
            <CopyButton text={instantLock} />
          </ValueCard>
        }
        loading={loading}
        error={!instantLock}
      />
    )}

    {fundingCoreTx && (
      <InfoLine
        className={'TransactionPage__InfoLine'}
        title={'Core Transaction Hash'}
        value={
          <a
            href={
              l1explorerBaseUrl
                ? `${l1explorerBaseUrl}/tx/${fundingCoreTx}`
                : '#'
            }
            target={'_blank'}
            rel={'noopener noreferrer'}
          >
            <ValueContainer elipsed={true} clickable={true} external={true}>
              <Identifier
                copyButton={true}
                ellipsis={true}
                styles={['highlight-both']}
              >
                {fundingCoreTx}
              </Identifier>
            </ValueContainer>
          </a>
        }
        loading={loading}
        error={!fundingCoreTx}
      />
    )}
  </>
)
