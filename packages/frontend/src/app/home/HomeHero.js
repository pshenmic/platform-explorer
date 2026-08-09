'use client'

import Link from 'next/link'
import { Box, Heading, Text } from '@chakra-ui/react'
import { TimeDelta, BigNumber } from '../../components/data'
import { useCountUp } from '../../components/home/hooks'
import { Skeleton, CompactTxList, CompactBlocksList } from '../../components/home'
import { isNetworkLive, isApiOperational, formatNetworkLabel } from '../../components/home/utils'
import { creditsToDash, roundUsd, formatFullNumber } from '../../util'
import './HomeHero.scss'

// Platform host (evonode) collateral on Core — not a regular 1k Core masternode
const EVONODE_COLLATERAL_DASH = 4000

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

// full integers with grouping — explorers use K/M only when precision of +1 doesn't matter
function formatCount (value) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return null
  return formatFullNumber(Math.round(value))
}

function formatUsdPrice (usd) {
  if (typeof usd !== 'number' || !Number.isFinite(usd)) return null
  if (usd >= 100) return `$${Math.round(usd).toLocaleString('en-US')}`
  if (usd >= 1) return `$${usd.toFixed(2)}`
  return `$${roundUsd(usd)}`
}

function formatDashAmount (dash) {
  if (typeof dash !== 'number' || !Number.isFinite(dash)) return null
  if (dash >= 1000) return Math.round(dash).toLocaleString('en-US')
  if (dash >= 10) return dash.toFixed(1)
  if (dash >= 0.01) return dash.toFixed(2)
  return dash.toFixed(4)
}

/** Explore door or economy chip — Link when href is set */
function PulseChip ({ href, label, value, hint, loading, accent }) {
  const inner = (
    <>
      <span className={'HomeHero__PulseLabel'}>{label}</span>
      <span className={`HomeHero__PulseValue${accent ? ' HomeHero__PulseValue--accent' : ''}`}>
        {loading
          ? <Skeleton w={'3.5rem'} h={'1.05em'} radius={4}/>
          : (value ?? '—')}
      </span>
      {hint
        ? <span className={'HomeHero__PulseHint'}>{hint}</span>
        : null}
    </>
  )

  if (href) {
    return (
      <Link href={href} className={'HomeHero__PulseChip HomeHero__PulseChip--link'}>
        {inner}
      </Link>
    )
  }

  return (
    <div className={'HomeHero__PulseChip'}>
      {inner}
    </div>
  )
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
  rate,
  rateLoading,
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

  // brand pulse — platform composition + light economics (from /status + /rate)
  const identitiesN = toNumber(status?.identitiesCount)
  const contractsN = toNumber(status?.dataContractsCount)
  const documentsN = toNumber(status?.documentsCount)
  const feesDayCredits = toNumber(status?.totalCollectedFeesDay)
  const totalCreditsN = toNumber(status?.totalCredits)
  const usd = typeof rate?.usd === 'number' && Number.isFinite(rate.usd) ? rate.usd : null
  const rateReady = !rateLoading && usd != null

  const identitiesAnim = useCountUp(identitiesN)
  const contractsAnim = useCountUp(contractsN)
  const documentsAnim = useCountUp(documentsN)

  const creditsDash = totalCreditsN != null ? creditsToDash(totalCreditsN) : null
  const feesDash = feesDayCredits != null ? creditsToDash(feesDayCredits) : null
  const feesUsd = feesDash != null && usd != null ? feesDash * usd : null
  const evoUsd = usd != null ? EVONODE_COLLATERAL_DASH * usd : null

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder HomeHero'}>
      <div className={'HomeHero__Glow'} aria-hidden={'true'}/>

      <Box className={'HomeHero__Inner'}>
        {/* full Inner atmosphere — not clipped to Brand box edges */}
        <div className={'HomeHero__BrandFx'} aria-hidden={'true'}>
          <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--a'}/>
          <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--b'}/>
          <span className={'HomeHero__BrandGrid'}/>
          <span className={'HomeHero__BrandGrain'}/>
        </div>

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

          <nav className={'HomeHero__Pulse'} aria-label={'Platform at a glance'}>
            <div className={'HomeHero__PulseGroup'} aria-label={'Explore'}>
              <PulseChip
                href={'/identities'}
                label={'Identities'}
                hint={'Who builds'}
                loading={!ready}
                value={formatCount(typeof identitiesAnim === 'number' ? identitiesAnim : identitiesN)}
              />
              <PulseChip
                href={'/dataContracts'}
                label={'Contracts'}
                hint={'Apps & schemas'}
                loading={!ready}
                value={formatCount(typeof contractsAnim === 'number' ? contractsAnim : contractsN)}
              />
              <PulseChip
                href={'/dataContracts'}
                label={'Documents'}
                hint={'Data written'}
                loading={!ready}
                value={formatCount(typeof documentsAnim === 'number' ? documentsAnim : documentsN)}
              />
            </div>

            <div className={'HomeHero__PulseSep'} aria-hidden={'true'}/>

            <div className={'HomeHero__PulseGroup HomeHero__PulseGroup--economy'} aria-label={'Economy'}>
              <PulseChip
                label={'DASH'}
                hint={'Market'}
                accent
                loading={Boolean(rateLoading) || (!rateReady && !ready)}
                value={rateReady ? formatUsdPrice(usd) : null}
              />
              <PulseChip
                label={'Credits'}
                hint={creditsDash != null ? `${formatDashAmount(creditsDash)} DASH in system` : 'In system'}
                loading={!ready}
                value={
                  creditsDash != null && usd != null
                    ? formatUsdPrice(creditsDash * usd)
                    : (creditsDash != null ? `${formatDashAmount(creditsDash)} Đ` : null)
                }
              />
              <PulseChip
                label={'Fees 24h'}
                hint={feesUsd != null ? `${formatDashAmount(feesDash)} DASH` : 'Collected'}
                loading={!ready}
                value={
                  feesUsd != null
                    ? formatUsdPrice(feesUsd)
                    : (feesDash != null ? `${formatDashAmount(feesDash)} Đ` : null)
                }
              />
              <PulseChip
                href={'/validators'}
                label={'Evonode'}
                hint={`Platform host · ${EVONODE_COLLATERAL_DASH.toLocaleString('en-US')} DASH`}
                accent
                loading={Boolean(rateLoading) && !rateReady}
                value={
                  evoUsd != null
                    ? formatUsdPrice(evoUsd)
                    : `${EVONODE_COLLATERAL_DASH.toLocaleString('en-US')} Đ`
                }
              />
            </div>
          </nav>
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
                  ? (apiOk ? 'Online' : 'Offline')
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
