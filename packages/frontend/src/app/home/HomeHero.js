'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { TimeDelta, BigNumber } from '../../components/data'
import { useCountUp } from '../../components/home/hooks'
import { Skeleton, CompactTxList, CompactBlocksList } from '../../components/home'
import { isNetworkLive, isApiOperational } from '../../components/home/utils'
import './HomeHero.scss'

// /status timestamps are ISO strings; epoch start/end are epoch-ms numbers — accept both
function toMs (value) {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? ms : null
}

function toNumber (value) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value !== '' && Number.isFinite(Number(value))) return Number(value)
  return null
}

function formatNextEpochDay (date) {
  const d = date.getDate()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  return `${d}.${m}`
}

const nextEpochTitleFmt = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'numeric',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
  timeZoneName: 'short'
})

export default function HomeHero ({
  status,
  loading,
  epochNumber,
  epochEndTime,
  transactions,
  transactionsLoading,
  blocks,
  blocksLoading
}) {
  const epochNum = toNumber(epochNumber)
  const epochEndMs = toMs(epochEndTime)
  const epochEndDate = epochEndMs !== null ? new Date(epochEndMs) : null
  const epochReady = epochNum !== null
  const epochCount = useCountUp(epochReady ? epochNum : null)
  // neutral until status arrives, so the badge never flashes red on first paint
  const ready = !loading && status && Object.keys(status).length > 0
  const live = isNetworkLive(status)
  const apiOk = isApiOperational(status)
  const drive = status?.versions?.software?.drive
  const tenderdash = status?.versions?.software?.tenderdash
  const dotState = ok => (!ready ? 'is-loading' : (ok ? 'is-ok' : 'is-down'))

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder HomeHero'}>
      <div className={'HomeHero__Glow'} aria-hidden={'true'}/>

      <Box className={'HomeHero__Inner'}>
        <div className={'HomeHero__Brand'}>
          <div className={'HomeHero__BrandFx'} aria-hidden={'true'}>
            <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--a'}/>
            <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--b'}/>
            <span className={'HomeHero__BrandGrid'}/>
            <span className={'HomeHero__BrandGrain'}/>
          </div>

          <div className={'HomeHero__BrandCopy'}>
            <Text className={'HomeHero__Welcome'}>Welcome to</Text>
            <Heading as={'h1'} className={'HomeHero__Title'}>
              <span className={'HomeHero__TitleShine'}>Platform Explorer</span>
            </Heading>
            <Text className={'HomeHero__Tagline'}>Dash Platform, live and on the record</Text>
            <Text className={'HomeHero__Description'}>
              Follow blocks and state transitions as they land. Inspect identities, data contracts,
              documents, and epochs in real time and history, built for builders, validators, and
              anyone watching the network.
            </Text>
          </div>
        </div>

        <div className={'HomeHero__Bottom'}>
          <div className={'HomeHero__Live'} aria-busy={!ready || !epochReady}>
            <div className={'HomeHero__LiveStat'}>
              <Text className={'HomeHero__LiveLabel'}>Epoch</Text>
              <div className={'HomeHero__LiveValue'}>
                {epochReady && typeof epochCount === 'number'
                  ? <BigNumber>{epochCount}</BigNumber>
                  : <Skeleton w={'4ch'} h={'0.85em'} radius={4}/>}
              </div>
              <p className={'HomeHero__LiveSub'}>
                {epochEndDate
                  ? <span className={'HomeHero__LiveMeta'} title={nextEpochTitleFmt.format(epochEndDate)}>
                      <a
                        className={'HomeHero__LiveMetaLink HomeHero__LiveMetaLink--Next'}
                        href={'#home-epochs'}
                        aria-label={'Next epoch — scroll to Epochs'}
                        onClick={(e) => {
                          e.preventDefault()
                          const el = document.getElementById('home-epochs')
                          if (!el) return
                          el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          try { el.focus({ preventScroll: true }) } catch (_) { /* noop */ }
                        }}
                      >
                        Next
                      </a>
                      <span className={'HomeHero__LiveMetaSep'} aria-hidden={'true'}>·</span>
                      <TimeDelta endDate={epochEndDate} format={'compact'} showTimestampTooltip={false}/>
                      <span className={'HomeHero__LiveMetaSep'} aria-hidden={'true'}>·</span>
                      <span>{formatNextEpochDay(epochEndDate)}</span>
                    </span>
                  : <Skeleton w={'8ch'} h={'0.7em'} radius={4}/>}
              </p>
            </div>

            <div className={'HomeHero__LiveDivider'} aria-hidden={'true'}/>

            <div className={'HomeHero__LiveStat'}>
              <Text className={'HomeHero__LiveLabel'}>Network</Text>
              <div className={'HomeHero__LiveValue'}>
                <span className={`HomeHero__LiveDot ${dotState(live)}`}/>
                {ready
                  ? (status?.network || '—')
                  : <Skeleton w={'5ch'} h={'0.85em'} radius={4}/>}
              </div>
              <p className={'HomeHero__LiveSub'}>
                {ready
                  ? (drive
                      ? <a
                          className={'HomeHero__LiveMetaLink'}
                          href={'https://github.com/dashpay/platform/releases'}
                          target={'_blank'}
                          rel={'noopener noreferrer'}
                        >
                          <span className={'HomeHero__LiveFull'}>Drive v{drive}</span>
                          <span className={'HomeHero__LiveShort'} aria-hidden={'true'}>Drive {drive}</span>
                        </a>
                      : '—')
                  : <Skeleton w={'6ch'} h={'0.7em'} radius={4}/>}
              </p>
            </div>

            <div className={'HomeHero__LiveDivider'} aria-hidden={'true'}/>

            <div className={'HomeHero__LiveStat'}>
              <Text className={'HomeHero__LiveLabel'}>API</Text>
              <div className={'HomeHero__LiveValue'}>
                <span className={`HomeHero__LiveDot ${dotState(apiOk)}`}/>
                {ready
                  ? <>
                      <span className={'HomeHero__LiveFull'}>{apiOk ? 'operational' : 'disrupted'}</span>
                      <span className={'HomeHero__LiveShort'} aria-hidden={'true'}>{apiOk ? 'online' : 'down'}</span>
                    </>
                  : <Skeleton w={'5ch'} h={'0.85em'} radius={4}/>}
              </div>
              <p className={'HomeHero__LiveSub'}>
                {ready
                  ? (tenderdash
                      ? <a
                          className={'HomeHero__LiveMetaLink'}
                          href={'https://github.com/dashpay/tenderdash/releases'}
                          target={'_blank'}
                          rel={'noopener noreferrer'}
                        >
                          <span className={'HomeHero__LiveFull'}>Tenderdash v{tenderdash}</span>
                          <span className={'HomeHero__LiveShort'} aria-hidden={'true'}>TD {tenderdash}</span>
                        </a>
                      : '—')
                  : <Skeleton w={'6ch'} h={'0.7em'} radius={4}/>}
              </p>
            </div>
          </div>

          <div className={'HomeHero__Feeds'} aria-label={'Latest network activity'}>
            <div className={'HomeHero__Feed'}>
              <CompactTxList
                transactions={transactions}
                loading={transactionsLoading}
              />
            </div>
            <div className={'HomeHero__Feed'}>
              <CompactBlocksList
                blocks={blocks}
                loading={blocksLoading}
              />
            </div>
          </div>
        </div>
      </Box>
    </Box>
  )
}
