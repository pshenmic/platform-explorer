'use client'

import { TokenDashboardCards } from '../../components/tokens/TokenDashboardCards'

export default function Cards () {
  const tokens = {
    data: {
      resultSet: [
        {
          name: 'BetaCoin',
          ticker: 'BTCN',
          identifier: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          currentSupply: '40 MLN',
          maxSupply: '50 MLN',
          ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
        },
        {
          name: 'BetaCoin',
          ticker: 'BTCN',
          identifier: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          currentSupply: '40 MLN',
          maxSupply: '50 MLN',
          ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
        },
        {
          name: 'BetaCoin',
          ticker: 'BTCN',
          identifier: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          currentSupply: '40 MLN',
          maxSupply: '50 MLN',
          ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
        },
        {
          name: 'BetaCoin',
          ticker: 'BTCN',
          identifier: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          currentSupply: '40 MLN',
          maxSupply: '50 MLN',
          ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
        },
        {
          name: 'BetaCoin',
          ticker: 'BTCN',
          identifier: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          currentSupply: '40 MLN',
          maxSupply: '50 MLN',
          ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
        },
        {
          name: 'BetaCoin',
          ticker: 'BTCN',
          identifier: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          dataContract: 'DFTG9G5mzmb4ANpoTtfRigrPjnrYTapHvznnCXNA3vfF',
          currentSupply: '40 MLN',
          maxSupply: '50 MLN',
          ownerIdentity: 'FXyN2NZAdRFADg7CeGjfUBdEqGPRw8RJXkpN5r4tMuLQ'
        }
      ]
    },
    loading: false,
    error: false
  }

  return (
    <TokenDashboardCards items={tokens}/>
  )
}
