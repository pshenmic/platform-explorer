'use client'

import { DataContractCards } from '../../components/dataContracts'
import type { DataContract, LoadableState, PaginatedResultSet } from '../../types'

export default function Cards() {
  const dataContracts: LoadableState<
    PaginatedResultSet<Pick<DataContract, 'identifier' | 'name'>>
  > = {
    data: {
      resultSet: [
        {
          identifier: '7CSFGeF4WNzgDmx94zwvHkYaG3Dx4XEe5LFsFgJswLbm',
          name: 'WalletUtils'
        },
        {
          identifier: 'Bwr4WHCPz5rFVAD87RqTs3izo4zpzwsEdKPWUT1NS1C7',
          name: 'Dashpay'
        },
        {
          identifier: 'rUnsWrFu3PKyRMGk2mxmZVBPbQuZx2qtHeFjURoQevX',
          name: 'MasternodeRewards'
        },
        {
          identifier: 'GWRSAVFMjXx8HpQFaNJMqBV7MBgMK4br5UESsB4S31Ec',
          name: 'DPNS'
        },
        {
          identifier: 'HY1keaRK5bcDmujNCQq5pxNyvAiHHpoHQgLN5ppiu4kh',
          name: 'FeatureFlags'
        },
        {
          identifier: '4fJLR2GYTPFdomuTVvNy3VRrvWgvkKPzqehEBpNf2nk6',
          name: 'Withdrawals'
        }
      ],
      pagination: { page: 1, limit: 6, total: 6 }
    },
    loading: false,
    error: false
  }

  return <DataContractCards items={dataContracts as never} />
}
