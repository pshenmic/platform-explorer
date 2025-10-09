import { InfoLine, Identifier } from '@components/data'
import { ValueContainer } from '@ui/containers'

import styles from './TokenConfiguration.module.scss'
import { LocalisationGrid } from '@components/tokens/localisation/LocalisationGrid'
import { DistType } from './DistType'

/**
 * Token configuration block with flat props.
 *
 * Props (all optional, render-on-presence):
 * - position, baseSupply, maxSupply, startAsPaused, isAllowedTransferToFrozenBalance
 * - conventions, keepsHistory, maxSupplyChangeRules
 * - distributionRules, perpetualDistribution
 * - marketplaceRules
 * - manualMintingRules, manualBurningRules
 * - freezeRules, unfreezeRules, destroyFrozenFundsRules, emergencyActionRules
 * - mainControlGroup, mainControlGroupCanBeModified, description
 */
export const TokenConfiguration = ({
  position,
  conventions,
  keepsHistory,
  baseSupply,
  maxSupply,
  startAsPaused,
  isAllowedTransferToFrozenBalance,
  maxSupplyChangeRules,
  distributionRules,
  perpetualDistribution,
  marketplaceRules,
  manualMintingRules,
  manualBurningRules,
  freezeRules,
  unfreezeRules,
  destroyFrozenFundsRules,
  emergencyActionRules,
  mainControlGroup,
  mainControlGroupCanBeModified,
  description
}) => {
  return (
    <div className={'InfoBlock'}>
      <div className={styles.title}>TOKEN CONFIGURATION</div>
      <div className={styles.container}>
        {!isNaN(position) && (
          <InfoLine
            title={'Token Position'}
            value={
              <ValueContainer
                className={styles.position}
                size={'sm'}
                colorScheme={'gray'}
              >
                {position}
              </ValueContainer>
            }
          />
        )}

        {distributionRules?.newTokenDestinationIdentity && (
          <InfoLine
            title={'Token Identifier'}
            value={
              <Identifier
                copyButton={true}
                ellipsis={false}
                styles={['highlight-both']}
              >
                {distributionRules.newTokenDestinationIdentity}
              </Identifier>
            }
          />
        )}

        {!isNaN(conventions?.decimals) && (
          <InfoLine
            title={'Decimals'}
            value={conventions.decimals}
          />
        )}
        {conventions.localizations && (
          <LocalisationGrid
            localisations={conventions.localizations}
            isOpen
          />
        )}

        <DistType
          title='title'
          subtitle='subtitle'
        />
      </div>
    </div>
  )
}
