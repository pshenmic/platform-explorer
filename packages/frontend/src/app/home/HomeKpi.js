'use client'

import { SimpleGrid } from '@chakra-ui/react'
import { InfoIcon } from '@chakra-ui/icons'
import { InfoCard } from '../../components/cards'
import { Tooltip } from '../../components/ui/Tooltips'
import { currencyRound } from '../../util'

function num (v) {
  return (typeof v === 'number' || typeof v === 'string') ? currencyRound(v) : '-'
}

export default function HomeKpi ({ status, validators }) {
  const loading = status?.loading
  const s = status?.data || {}
  const validatorsTotal = validators?.data?.pagination?.total

  const cards = [
    { title: 'Blocks', value: num(s?.api?.block?.height), hint: 'Current chain height — total blocks produced on Dash Platform.' },
    { title: 'Transactions', value: num(s?.transactionsCount), hint: 'Total state transitions processed across the network.' },
    { title: 'Data Contracts', value: num(s?.dataContractsCount), hint: 'Total registered data contracts (app schemas).' },
    { title: 'Documents', value: num(s?.documentsCount), hint: 'Total documents across all data contracts. Browse documents within each contract.' },
    { title: 'Identities', value: num(s?.identitiesCount), hint: 'Total registered identities on the platform.' },
    {
      title: 'Masternodes',
      value: validatorsTotal > 0 ? num(validatorsTotal) : '-',
      hint: 'Active validators (evonodes) securing the network.',
      loading: validators?.loading
    }
  ]

  return (
    <SimpleGrid columns={[2, 3, 3, 6]} spacing={3} className={'HomeKpi'}>
      {cards.map((card, i) => {
        const cardLoading = card.loading ?? loading
        return (
        <InfoCard key={i} loading={cardLoading} className={'HomeKpi__Item'}>
          {!cardLoading &&
            <>
              <div className={'HomeKpi__Head'}>
                <span className={'HomeKpi__Label'}>{card.title}</span>
                <Tooltip title={card.title} content={card.hint} placement={'top'}>
                  <span className={'HomeKpi__Info'} aria-label={`About ${card.title}`}>
                    <InfoIcon boxSize={3}/>
                  </span>
                </Tooltip>
              </div>
              <div className={'HomeKpi__Value'}>{card.value}</div>
            </>}
        </InfoCard>
        )
      })}
    </SimpleGrid>
  )
}
