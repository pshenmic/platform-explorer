'use client'

import { Box, Heading, Text } from '@chakra-ui/react'
import { TimeDelta, BigNumber } from '../../components/data'
import { useCountUp } from '../../components/home/hooks'
import { Skeleton } from '../../components/home'
import { isNetworkLive } from '../../components/home/utils'
import './HomeHero.css'

function toMs(value: any) {
  if (value == null) return null
  if (typeof value === 'number' && Number.isFinite(value)) return value
  const ms = new Date(value).getTime()
  return Number.isFinite(ms) ? ms : null
}

function toNumber(value: any) {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string' && value !== '' && Number.isFinite(Number(value)))
    return Number(value)
  return null
}

function formatNextEpochDay(date: any) {
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

export default function HomeHero({
  status,
  loading,
  epochNumber,
  epochEndTime,
  avgBlockTimeSec
}: any) {
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
  const badgeState = !ready ? 'is-loading' : live ? 'is-live' : 'is-down'

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder HomeHero'}>
      <div className={'HomeHero__Glow'} aria-hidden={'true'} />
      <div className={'HomeHero__BrandFx'} aria-hidden={'true'}>
        <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--a'} />
        <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--b'} />
        <span className={'HomeHero__BrandGrain'} />
      </div>

      <Box className={'HomeHero__Inner'}>
        <div className={'HomeHero__Brand'}>
          <div className={'HomeHero__BrandCopy'}>
            <Text className={'HomeHero__Welcome'}>Welcome to</Text>
            <Heading as={'h1'} className={'HomeHero__Title'}>
              <span className={'HomeHero__TitleShine'}>Platform Explorer</span>
            </Heading>
            <Text className={'HomeHero__Tagline'}>The information resource about Dash Platform</Text>
            <Text className={'HomeHero__Description'}>
              Your portal for real-time and historical data across the Dash blockchain — track and
              verify transactions, identities, contracts and documents with confidence.
            </Text>
          </div>
        </div>

        <div className={`HomeHero__HeightRail ${loading ? 'HomeHero__HeightRail--Loading' : ''}`}>
          <div className={'HomeHero__Stat'}>
            <Text className={'HomeHero__LiveLabel'}>
              <span role={'status'} className={`HomeHero__LiveBadge ${badgeState}`}>
                {ready && !live ? 'Offline' : 'Live'}
              </span>{' '}
              Block Height
            </Text>
            <div className={'HomeHero__Height'}>
              {typeof heightCount === 'number' ? (
                <BigNumber>{heightCount}</BigNumber>
              ) : ready ? (
                '—'
              ) : (
                <Skeleton w={'7ch'} h={'0.9em'} radius={4} />
              )}
            </div>
            <Text className={'HomeHero__LiveMeta'}>
              {ready ? (
                <>
                  {typeof avgBlockTimeSec === 'number' ? `Avg ~${avgBlockTimeSec}s` : 'Live'}
                  {lastBlockTimestamp ? (
                    <>
                      {' '}
                      · last block <TimeDelta endDate={new Date(lastBlockTimestamp)} />
                    </>
                  ) : null}
                </>
              ) : (
                <Skeleton w={'8ch'} h={'0.7em'} radius={4} />
              )}
            </Text>
          </div>

          <div className={'HomeHero__Stat'} aria-busy={!epochReady}>
            <Text className={'HomeHero__LiveLabel'}>Epoch</Text>
            <div className={'HomeHero__Height HomeHero__Height--epoch'}>
              {epochReady && typeof epochCount === 'number' ? (
                <BigNumber>{epochCount}</BigNumber>
              ) : (
                <Skeleton w={'5ch'} h={'0.9em'} radius={4} />
              )}
            </div>
            {epochEndDate ? (
              <span
                className={'HomeHero__LiveMeta'}
                title={nextEpochTitleFmt.format(epochEndDate)}
              >
                <a
                  className={'HomeHero__LiveMetaLink HomeHero__LiveMetaLink--Next'}
                  href={'#home-epochs'}
                  aria-label={'Next epoch — scroll to Epochs'}
                  onClick={e => {
                    e.preventDefault()
                    const el = document.getElementById('home-epochs')
                    if (!el) return
                    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
                    try {
                      el.focus({ preventScroll: true })
                    } catch (_) {}
                  }}
                >
                  Next
                </a>
                <span className={'HomeHero__LiveMetaSep'} aria-hidden={'true'}>
                  ·
                </span>
                <TimeDelta
                  endDate={epochEndDate}
                  format={'compact'}
                  showTimestampTooltip={false}
                />
                <span className={'HomeHero__LiveMetaSep'} aria-hidden={'true'}>
                  ·
                </span>
                <span>{formatNextEpochDay(epochEndDate)}</span>
              </span>
            ) : (
              <Skeleton w={'8ch'} h={'0.7em'} radius={4} />
            )}
          </div>
        </div>
      </Box>
    </Box>
  )
}
