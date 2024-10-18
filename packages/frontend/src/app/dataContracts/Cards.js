'use client'

import { DataContractCards } from '../../components/dataContracts'

export default function Cards () {
  const dataContracts = {
    data: {
      resultSet: [
        {
          identifier: '49GmYeGAk9s6nnuFLJd1KXVKoXtsvA7WdGacGHDAMbLJ',
          name: 'Platform Explorer'
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
      ]
    },
    loading: false,
    error: false
  }

  return (
    <DataContractCards items={dataContracts}/>
  )
}
