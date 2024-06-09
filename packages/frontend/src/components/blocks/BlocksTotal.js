'use client'

import { TotalCards } from '../total'
import { SideBlock } from '../containers'

export default function BlocksTotal () {
  return (
    <SideBlock>
      <TotalCards cards={[
        {
          title: 'Epoch:',
          value: 607,
          icon: 'Sandglass'
        },
        {
          title: 'Blocks:',
          value: 30,
          icon: 'Blocks'
        },
        {
          title: 'Avg. TPS*:',
          value: '145',
          icon: 'Timer'
        },
        {
          title: 'Transactions:',
          value: 145,
          icon: 'Transactions'
        }
      ]}/>
    </SideBlock>
  )
}
