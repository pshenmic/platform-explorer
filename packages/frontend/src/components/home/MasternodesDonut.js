'use client'

import { Box, Heading } from '@chakra-ui/react'
import './MasternodesDonut.scss'

const SIZE = 200
const STROKE = 16
const R = (SIZE - STROKE) / 2
const C = 2 * Math.PI * R

// active/inactive from exact pagination totals; evonode split approximated from the loaded page
export default function MasternodesDonut ({ validators, validatorsActive }) {
  const total = validators?.data?.pagination?.total
  const active = validatorsActive?.data?.pagination?.total
  const ready = typeof total === 'number' && total > 0 && typeof active === 'number'

  const inactive = ready ? Math.max(total - active, 0) : 0
  const activeFrac = ready ? Math.min(active / total, 1) : 0

  const rows = validators?.data?.resultSet || []
  const evoCount = rows.filter(v => /evo|high/i.test(v?.proTxInfo?.type || '')).length
  const evoPct = rows.length ? Math.round((evoCount / rows.length) * 100) : null

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder MasternodesDonut'} w={'100%'}>
      <div className={'MasternodesDonut__Head'}>
        <Heading className={'InfoBlock__Title'} as={'h2'}>Validator set</Heading>
      </div>

      <div className={'MasternodesDonut__Body'}>
        {!ready
          ? <div className={'MasternodesDonut__Empty'}>No data</div>
          : <>
              <div className={'MasternodesDonut__Chart'}>
                <svg
                  className={'MasternodesDonut__Svg'}
                  viewBox={`0 0 ${SIZE} ${SIZE}`}
                  role={'img'}
                  aria-label={`${active} of ${total} validators active`}
                >
                  <circle className={'MasternodesDonut__Track'} cx={SIZE / 2} cy={SIZE / 2} r={R} fill={'none'} strokeWidth={STROKE}/>
                  <circle
                    className={'MasternodesDonut__Arc'}
                    cx={SIZE / 2}
                    cy={SIZE / 2}
                    r={R}
                    fill={'none'}
                    strokeWidth={STROKE}
                    strokeLinecap={'round'}
                    strokeDasharray={C}
                    strokeDashoffset={C * (1 - activeFrac)}
                    transform={`rotate(-90 ${SIZE / 2} ${SIZE / 2})`}
                  />
                  <text className={'MasternodesDonut__Total'} x={'50%'} y={'45%'} textAnchor={'middle'} dominantBaseline={'middle'} fontSize={38}>{total}</text>
                  <text className={'MasternodesDonut__TotalLabel'} x={'50%'} y={'62%'} textAnchor={'middle'} dominantBaseline={'middle'} fontSize={12}>masternodes</text>
                </svg>
              </div>

              <div className={'MasternodesDonut__Legend'}>
                <span className={'MasternodesDonut__LegendItem'}>
                  <i className={'MasternodesDonut__Dot MasternodesDonut__Dot--active'}/> Active {active}
                </span>
                <span className={'MasternodesDonut__LegendItem'}>
                  <i className={'MasternodesDonut__Dot MasternodesDonut__Dot--inactive'}/> Inactive {inactive}
                </span>
              </div>

              {evoPct != null &&
                <div className={'MasternodesDonut__Caption'}>~{evoPct}% evonodes</div>}
            </>
        }
      </div>
    </Box>
  )
}
