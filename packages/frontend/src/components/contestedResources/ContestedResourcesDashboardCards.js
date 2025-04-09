'use client'

// import * as Api from '../../util/Api'
// import { useState, useEffect } from 'react'
// import { fetchHandlerSuccess, fetchHandlerError, currencyRound } from '../../util'
import { DashboardCards } from '../cards'
import { SignatureIcon, ListIcon, CalendarGradientIcon } from '../ui/icons'
import './ContestedResourcesDashboardCards.scss'

function ContestedResourcesDashboardCards () {
  return (
    <DashboardCards
      cards={[
        {
          title: 'Total Contested Resources',
          value: <div className={'TotalContestedResourcesCard'}>123</div>,
          className: 'ContestedResourcesDashboardCards__Card',
          error: false,
          loading: false,
          icon: SignatureIcon
        },
        {
          title: 'Total Votes Casted',
          value: 123,
          className: 'ContestedResourcesDashboardCards__Card',
          error: false,
          loading: false,
          icon: ListIcon
        },
        {
          title: 'Pending Contested Resources',
          value: 123,
          className: 'ContestedResourcesDashboardCards__Card',
          error: false,
          loading: false,
          icon: SignatureIcon
        },
        {
          title: 'Ending soon',
          value: 123,
          error: false,
          loading: false,
          icon: CalendarGradientIcon
        }
      ]}
    />
  )
}

export default ContestedResourcesDashboardCards
