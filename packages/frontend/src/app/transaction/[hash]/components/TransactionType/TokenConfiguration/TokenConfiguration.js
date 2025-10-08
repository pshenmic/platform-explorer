import { InfoLine, Identifier, CodeBlock } from '@components/data'
import { ValueCard } from '@components/cards'
import { ValueContainer } from '@ui/containers'

import styles from './TokenConfiguration.module.scss'

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
        {
          !isNaN(Number(position)) && (
                        <InfoLine
                            title={'Token Position'}
                            value={
                                <ValueContainer className={styles.position} size={'sm'} colorScheme={'gray'}>
                                  {position}
                                </ValueContainer>
                            }
                          />
          )

          }
    </div>
  )
}
