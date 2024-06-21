'use client'

import { SideBlock } from '../../components/containers'
import { DataContractCards } from '../../components/dataContracts'

export default function Cards () {
  const dataContracts = {
    data: {
      resultSet: [
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
        }
      ]
    },
    loading: false,
    error: false
  }

  return (
    <SideBlock>
      <DataContractCards items={dataContracts}/>
    </SideBlock>
  )
}
