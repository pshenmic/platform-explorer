import { InfoLine, Identifier } from '@components/data'
import { ValueContainer } from '@ui/containers'
import { LocalisationGrid } from '@components/tokens/localisation/LocalisationGrid'

import { DistType } from './DistType'

import styles from './TokenConfiguration.module.scss'
import { ValueCard } from '@components/cards'

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

        {distributionRules?.tokenId && (
          <InfoLine
            title={'Token Identifier'}
            value={
              <ValueCard link={`/token/${distributionRules.tokenId}`}>
                <Identifier
                  avatar={true}
                  copyButton={true}
                  ellipsis={false}
                  styles={['highlight-both']}
                >
                  {distributionRules.tokenId}
                </Identifier>
              </ValueCard>
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
          <InfoLine
            className={styles.localization}
            title={<b>Localization:</b>}
            postfix=''
            value={
              <LocalisationGrid
                localisations={conventions.localizations}
                isOpen
              />
            }
          />
        )}

        {distributionRules?.perpetualDistribution && (
          <DistType details={distributionRules.perpetualDistribution} />
        )}
      </div>
    </div>
  )
}
