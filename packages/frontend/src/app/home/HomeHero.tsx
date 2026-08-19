'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { TimeDelta, BigNumber } from '../../components/data'
import { useCountUp } from '../../components/home/hooks'
import { Skeleton, CompactTxList, CompactBlocksList } from '../../components/home'
import { isNetworkLive, isApiOperational, formatNetworkLabel } from '../../components/home/utils'
import './HomeHero.css'

const EVONODE_COLLATERAL_DASH = 4000
const CREDITS_PER_DASH = 100000000000
const creditsPerDashCompact = new Intl.NumberFormat('en', {
  notation: 'compact',
  compactDisplay: 'short',
  maximumFractionDigits: 0
}).format(CREDITS_PER_DASH)

function formatUsdPrice (usd: any) {
  if (typeof usd !== 'number' || !Number.isFinite(usd)) return null
  if (usd >= 100) return `$${Math.round(usd).toLocaleString('en-US')}`
  if (usd >= 1) return `$${usd.toFixed(2)}`
  return `$${usd.toFixed(4)}`
}

function toMs (value: any) {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? ms : null
}

function toNumber (value: any) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value !== '' && Number.isFinite(Number(value))) return Number(value)
  return null
}

function formatNextEpochDay (date: any) {
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

export default function HomeHero ({ status, loading, rate, rateLoading, epochNumber, epochEndTime, transactions, transactionsLoading, blocks, blocksLoading }: any) {
  const epochNum = toNumber(epochNumber)
  const epochEndMs = toMs(epochEndTime)
  const epochEndDate = epochEndMs !== null ? new Date(epochEndMs) : null
  const epochReady = epochNum !== null
  const epochCount = useCountUp(epochReady ? epochNum : null)
  const height = toNumber(status?.api?.block?.height)
  const lastBlockTimestamp = toMs(status?.api?.block?.timestamp)
  const heightCount = useCountUp(height)
  const ready = !loading && status && Object.keys(status).length > 0
  const live = isNetworkLive(status)
  const badgeState = !ready ? 'is-loading' : (live ? 'is-live' : 'is-down')
  const apiOk = isApiOperational(status)
  const drive = status?.versions?.software?.drive
  const tenderdash = status?.versions?.software?.tenderdash
  const dotState = (ok: any) => (!ready ? 'is-loading' : (ok ? 'is-ok' : 'is-down'))
  const usd = typeof rate?.usd === 'number' && Number.isFinite(rate.usd) ? rate.usd : null
  const evoUsd = usd != null ? EVONODE_COLLATERAL_DASH * usd : null
  const evoUsdLabel = formatUsdPrice(evoUsd)
  const rateReady = !rateLoading && evoUsdLabel != null

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder HomeHero'}>
      <div className={'HomeHero__Glow'} aria-hidden={'true'}/>
      <div className={'HomeHero__BrandFx'} aria-hidden={'true'}>
        <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--a'}/>
        <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--b'}/>
        <span className={'HomeHero__BrandGrain'}/>
      </div>

      <Box className={'HomeHero__Inner'}>

        <div className={'HomeHero__Brand'}>
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

          <div className={`HomeHero__HeightRail ${loading ? 'HomeHero__HeightRail--Loading' : ''}`}>
            <div className={'HomeHero__HeightPair'}>
              <div className={'HomeHero__HeightCol HomeHero__HeightCol--evo'}>
                <Text className={'HomeHero__LiveLabel'}>Evonode</Text>
                <div className={'HomeHero__Height'}>
                  {rateReady
                    ? evoUsdLabel
                    : (rateLoading
                        ? <Skeleton w={'6ch'} h={'0.9em'} radius={4}/>
                        : `${EVONODE_COLLATERAL_DASH.toLocaleString('en-US')} Đ`)}
                </div>
              </div>

              <div className={'HomeHero__HeightSeam HomeHero__HeightSeam--a'} aria-hidden={'true'}/>

              <div className={'HomeHero__HeightCol HomeHero__HeightCol--block'}>
                <Text className={'HomeHero__LiveLabel'}>
                  <span role={'status'} className={`HomeHero__LiveBadge ${badgeState}`}>
                    {ready && !live ? 'Offline' : 'Live'}
                  </span>
                  {' '}Block Height
                </Text>
                <div className={'HomeHero__Height'}>
                  {typeof heightCount === 'number'
                    ? <BigNumber>{heightCount}</BigNumber>
                    : (ready ? '—' : <Skeleton w={'7ch'} h={'0.9em'} radius={4}/>)}
                </div>
              </div>

              <div className={'HomeHero__HeightSeam HomeHero__HeightSeam--b'} aria-hidden={'true'}/>

              <div className={'HomeHero__HeightCol HomeHero__HeightCol--epoch'} aria-busy={!epochReady}>
                <Text className={'HomeHero__LiveLabel'}>Epoch</Text>
                <div className={'HomeHero__Height'}>
                  {epochReady && typeof epochCount === 'number'
                    ? <BigNumber>{epochCount}</BigNumber>
                    : <Skeleton w={'5ch'} h={'0.9em'} radius={4}/>}
                </div>
              </div>

              <Text
                className={'HomeHero__LiveMeta HomeHero__HeightMeta HomeHero__HeightMeta--evo'}
                title={`${CREDITS_PER_DASH.toLocaleString('en-US')} credits per DASH`}
              >
                {EVONODE_COLLATERAL_DASH.toLocaleString('en-US')} DASH
                <span className={'HomeHero__LiveMetaSep'} aria-hidden={'true'}>·</span>
                1 DASH = {creditsPerDashCompact} credits
              </Text>

              <Text className={'HomeHero__LiveMeta HomeHero__HeightMeta HomeHero__HeightMeta--block'}>
                {lastBlockTimestamp
                  ? <>last block <TimeDelta endDate={new Date(lastBlockTimestamp)}/></>
                  : (ready ? 'Live' : <Skeleton w={'8ch'} h={'0.7em'} radius={4}/>)}
              </Text>

              {epochEndDate
                ? <span
                    className={'HomeHero__LiveMeta HomeHero__HeightMeta HomeHero__HeightMeta--epoch'}
                    title={nextEpochTitleFmt.format(epochEndDate)}
                  >
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
                : <Skeleton className={'HomeHero__HeightMeta HomeHero__HeightMeta--epoch'} w={'8ch'} h={'0.7em'} radius={4}/>}
            </div>
          </div>
        </div>

        <div className={'HomeHero__Bottom'}>
          <div className={'HomeHero__Live'} aria-busy={!ready}>
            <div className={'HomeHero__LiveStat'}>
              <div className={'HomeHero__LiveLabelRow'}>
                <span className={`HomeHero__LiveDot ${dotState(live)}`} aria-hidden={'true'}/>
                <Text className={'HomeHero__LiveLabel'}>Network</Text>
              </div>
              <div
                className={'HomeHero__LiveValue'}
                title={ready && status?.network ? String(status.network) : undefined}
              >
                {ready
                  ? (formatNetworkLabel(status?.network) || '—')
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
              <div className={'HomeHero__LiveLabelRow'}>
                <span className={`HomeHero__LiveDot ${dotState(apiOk)}`} aria-hidden={'true'}/>
                <Text className={'HomeHero__LiveLabel'}>API</Text>
              </div>
              <div className={'HomeHero__LiveValue'}>
                {ready
                  ? (apiOk ? 'online' : 'offline')
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
