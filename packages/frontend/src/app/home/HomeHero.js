'use client'

import Link from 'next/link'
import { Box, Heading, Text } from '@chakra-ui/react'
import { TimeDelta, BigNumber } from '../../components/data'
import { useCountUp } from '../../components/home/hooks'
import { Skeleton, CompactTxList, CompactBlocksList } from '../../components/home'
import { isNetworkLive, isApiOperational, formatNetworkLabel } from '../../components/home/utils'
import { creditsToDash, roundUsd, formatFullNumber } from '../../util'
import './HomeHero.scss'

// Core collateral for a Platform host (evonode), not a 1k regular MN
const EVONODE_COLLATERAL_DASH = 4000
// matches creditsToDash (1 DASH = 1e11 credits)
const CREDITS_PER_DASH = 100_000_000_000

// ISO strings and epoch-ms both show up on /status
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

// full grouped integers so +1 growth stays visible
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

// value-first row; link only when drill-down exists
function PanelStat ({ href, label, value, hint, loading, accent }) {
  const inner = (
    <>
      <span className={'HomeHero__PanelStatMeta'}>
        <span className={'HomeHero__PanelStatLabel'}>{label}</span>
        {hint
          ? <span className={'HomeHero__PanelStatHint'}>{hint}</span>
          : null}
      </span>
      <span className={`HomeHero__PanelStatValue${accent ? ' HomeHero__PanelStatValue--accent' : ''}`}>
        {loading
          ? <Skeleton w={'4.5rem'} h={'1.05em'} radius={4}/>
          : (value ?? '-')}
      </span>
    </>
  )

  if (href) {
    return (
      <Link href={href} className={'HomeHero__PanelStat HomeHero__PanelStat--link'}>
        {inner}
      </Link>
    )
  }

  return (
    <div className={'HomeHero__PanelStat'}>
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
  // avoid Online/Offline flash before first /status paint
  const ready = !loading && status && Object.keys(status).length > 0
  const live = isNetworkLive(status)
  const apiOk = isApiOperational(status)
  const drive = status?.versions?.software?.drive
  const tenderdash = status?.versions?.software?.tenderdash
  const dotState = ok => (!ready ? 'is-loading' : (ok ? 'is-ok' : 'is-down'))

  const identitiesN = toNumber(status?.identitiesCount)
  const contractsN = toNumber(status?.dataContractsCount)
  const documentsN = toNumber(status?.documentsCount)
  const txsN = toNumber(status?.transactionsCount)
  const feesDayCredits = toNumber(status?.totalCollectedFeesDay)
  const totalCreditsN = toNumber(status?.totalCredits)
  const usd = typeof rate?.usd === 'number' && Number.isFinite(rate.usd) ? rate.usd : null
  const rateReady = !rateLoading && usd != null

  const identitiesAnim = useCountUp(identitiesN)
  const contractsAnim = useCountUp(contractsN)
  const documentsAnim = useCountUp(documentsN)
  const txsAnim = useCountUp(txsN)

  const creditsDash = totalCreditsN != null ? creditsToDash(totalCreditsN) : null
  const feesDash = feesDayCredits != null ? creditsToDash(feesDayCredits) : null
  const feesUsd = feesDash != null && usd != null ? feesDash * usd : null
  const evoUsd = usd != null ? EVONODE_COLLATERAL_DASH * usd : null
  const creditsUsd = creditsDash != null && usd != null ? creditsDash * usd : null

  return (
    <Box className={'InfoBlock InfoBlock--NoBorder HomeHero'}>
      <div className={'HomeHero__Glow'} aria-hidden={'true'}/>

      <Box className={'HomeHero__Inner'}>
        <div className={'HomeHero__BrandFx'} aria-hidden={'true'}>
          <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--a'}/>
          <span className={'HomeHero__BrandOrb HomeHero__BrandOrb--b'}/>
          <span className={'HomeHero__BrandGrid'}/>
          <span className={'HomeHero__BrandGrain'}/>
        </div>

        <div className={'HomeHero__Brand'} aria-label={'Platform Explorer intro'}>
          <article className={'HomeHero__Panel HomeHero__Panel--story'}>
            <header className={'HomeHero__PanelMark'}>
              <span className={'HomeHero__PanelNum'} aria-hidden={'true'}>01</span>
              <span className={'HomeHero__PanelTag'}>Story</span>
            </header>
            <div className={'HomeHero__BrandCopy'}>
              <Text className={'HomeHero__Welcome'}>Welcome to</Text>
              <Heading as={'h1'} className={'HomeHero__Title'}>
                <span className={'HomeHero__TitleShine'}>Platform Explorer</span>
              </Heading>
              <Text className={'HomeHero__Tagline'}>
                The public window onto Dash&apos;s application layer
              </Text>

              <div
                className={'HomeHero__Bridge'}
                role={'note'}
                aria-label={'One DASH locks into one hundred billion Platform credits'}
              >
                <span className={'HomeHero__BridgeSide HomeHero__BridgeSide--core'}>
                  <span className={'HomeHero__BridgeLayer'}>Core</span>
                  <span className={'HomeHero__BridgeUnit'}>
                    1 DASH
                    {rateReady
                      ? <span className={'HomeHero__BridgeFiat'}>{formatUsdPrice(usd)}</span>
                      : null}
                  </span>
                </span>

                <span className={'HomeHero__BridgeFlow'} aria-hidden={'true'}>
                  <span className={'HomeHero__BridgeFlowLabel'}>lock</span>
                  <svg className={'HomeHero__BridgeBolt'} viewBox={'0 0 48 16'} fill={'none'}>
                    <path
                      d={'M2 8 H18 L22 3 L28 13 L32 8 H46'}
                      stroke={'currentColor'}
                      strokeWidth={'1.5'}
                      strokeLinecap={'round'}
                      strokeLinejoin={'round'}
                    />
                    <path d={'M42 4 L46 8 L42 12'} stroke={'currentColor'} strokeWidth={'1.5'} strokeLinecap={'round'} strokeLinejoin={'round'}/>
                  </svg>
                </span>

                <span className={'HomeHero__BridgeSide HomeHero__BridgeSide--platform'}>
                  <span className={'HomeHero__BridgeLayer'}>Platform</span>
                  <span className={'HomeHero__BridgeUnit HomeHero__BridgeUnit--accent'}>
                    {formatFullNumber(CREDITS_PER_DASH)}
                    <span className={'HomeHero__BridgeUnitSuffix'}>credits</span>
                  </span>
                </span>
              </div>

              <Text className={'HomeHero__Description'}>
                Dash Core moves digital cash. Platform is where identities and apps settle on-chain,
                funded when DASH is locked from Core into credits. Explore the live trail, no wallet required.
              </Text>
            </div>
          </article>

          <div className={'HomeHero__Gutter'} aria-hidden={'true'}>
            <svg className={'HomeHero__GutterBolt HomeHero__GutterBolt--v'} viewBox={'0 0 12 100'} preserveAspectRatio={'none'}>
              <path className={'HomeHero__GutterBoltPath'} d={'M6 0 L7 18 L3 28 L8 42 L4 54 L9 68 L5 80 L7 100'} fill={'none'} vectorEffect={'non-scaling-stroke'}/>
            </svg>
            <svg className={'HomeHero__GutterBolt HomeHero__GutterBolt--h'} viewBox={'0 0 100 12'} preserveAspectRatio={'none'}>
              <path className={'HomeHero__GutterBoltPath'} d={'M0 6 L14 3 L28 9 L42 2 L56 8 L70 4 L84 10 L100 6'} fill={'none'} vectorEffect={'non-scaling-stroke'}/>
            </svg>
          </div>

          <article className={'HomeHero__Panel HomeHero__Panel--platform'}>
            <header className={'HomeHero__PanelMark'}>
              <span className={'HomeHero__PanelNum'} aria-hidden={'true'}>02</span>
              <span className={'HomeHero__PanelTag'}>Platform</span>
            </header>
            <p className={'HomeHero__PanelLede'}>What is on Platform</p>
            <nav className={'HomeHero__PanelStats'} aria-label={'Platform composition'}>
              <PanelStat
                href={'/identities'}
                label={'Identities'}
                hint={'People and apps on the network'}
                loading={!ready}
                value={formatCount(typeof identitiesAnim === 'number' ? identitiesAnim : identitiesN)}
              />
              <PanelStat
                href={'/dataContracts'}
                label={'Contracts'}
                hint={'App blueprints stored on-chain'}
                loading={!ready}
                value={formatCount(typeof contractsAnim === 'number' ? contractsAnim : contractsN)}
              />
              <PanelStat
                href={'/dataContracts'}
                label={'Documents'}
                hint={'Data those apps have written'}
                loading={!ready}
                value={formatCount(typeof documentsAnim === 'number' ? documentsAnim : documentsN)}
              />
              <PanelStat
                href={'/transactions'}
                label={'Transactions'}
                hint={'Actions settled so far'}
                loading={!ready}
                value={formatCount(typeof txsAnim === 'number' ? txsAnim : txsN)}
              />
            </nav>
          </article>

          <div className={'HomeHero__Gutter'} aria-hidden={'true'}>
            <svg className={'HomeHero__GutterBolt HomeHero__GutterBolt--v'} viewBox={'0 0 12 100'} preserveAspectRatio={'none'}>
              <path className={'HomeHero__GutterBoltPath'} d={'M6 0 L4 16 L8 30 L3 44 L9 58 L4 72 L8 86 L6 100'} fill={'none'} vectorEffect={'non-scaling-stroke'}/>
            </svg>
            <svg className={'HomeHero__GutterBolt HomeHero__GutterBolt--h'} viewBox={'0 0 100 12'} preserveAspectRatio={'none'}>
              <path className={'HomeHero__GutterBoltPath'} d={'M0 6 L12 9 L26 2 L40 8 L54 3 L68 10 L82 4 L100 6'} fill={'none'} vectorEffect={'non-scaling-stroke'}/>
            </svg>
          </div>

          <article className={'HomeHero__Panel HomeHero__Panel--economy'}>
            <header className={'HomeHero__PanelMark'}>
              <span className={'HomeHero__PanelNum'} aria-hidden={'true'}>03</span>
              <span className={'HomeHero__PanelTag'}>Economy</span>
            </header>
            <p className={'HomeHero__PanelLede'}>How money powers it</p>
            <div className={'HomeHero__PanelStats'} aria-label={'Platform economy'}>
              <PanelStat
                label={'DASH price'}
                hint={'Market price of Dash today'}
                accent
                loading={Boolean(rateLoading) || (!rateReady && !ready)}
                value={rateReady ? formatUsdPrice(usd) : null}
              />
              <PanelStat
                label={'Credits in system'}
                hint={
                  creditsDash != null
                    ? `About ${formatDashAmount(creditsDash)} DASH ready to spend on Platform`
                    : 'Dash locked for use on Platform'
                }
                loading={!ready}
                value={
                  creditsUsd != null
                    ? formatUsdPrice(creditsUsd)
                    : (creditsDash != null ? `${formatDashAmount(creditsDash)} Đ` : null)
                }
              />
              <PanelStat
                label={'Fees (24h)'}
                hint={
                  feesDash != null
                    ? `About ${formatDashAmount(feesDash)} DASH spent on network fees today`
                    : 'Fees paid on Platform today'
                }
                loading={!ready}
                value={
                  feesUsd != null
                    ? formatUsdPrice(feesUsd)
                    : (feesDash != null ? `${formatDashAmount(feesDash)} Đ` : null)
                }
              />
              <PanelStat
                href={'/validators'}
                label={'Evonode bond'}
                hint={`DASH required to run a Platform host (${EVONODE_COLLATERAL_DASH.toLocaleString('en-US')})`}
                accent
                loading={Boolean(rateLoading) && !rateReady}
                value={
                  evoUsd != null
                    ? formatUsdPrice(evoUsd)
                    : `${EVONODE_COLLATERAL_DASH.toLocaleString('en-US')} Đ`
                }
              />
            </div>
          </article>
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
                        aria-label={'Next epoch, scroll to Epochs'}
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
                  ? (formatNetworkLabel(status?.network) || '-')
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
                      : '-')
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
                      : '-')
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
