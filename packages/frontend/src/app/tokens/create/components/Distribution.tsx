'use client'

import type { ChangeEvent } from 'react'
import { HStack, Stack, Input, Select, IconButton, Text } from '@chakra-ui/react'
import { YesNoBadge } from './FeatureRow'
import { Row, GroupHeader } from './AdvancedRow'
import { useTokenWizard } from '../TokenWizardContext'
import type { IntervalUnit, PerpetualRecipient, PerpetualType, TokenForm } from '../TokenWizardContext'
import './Advanced.css'

let __rowSeq = 0
const makeRowId = (): string => `pp${++__rowSeq}`

// datetime-local is local wall-clock; show the resolved UTC instant (chain stores UTC ms).
const pad = (n: number): string => String(n).padStart(2, '0')

const tzOffsetLabel = (): string => {
  const mins = -new Date().getTimezoneOffset()
  const sign = mins >= 0 ? '+' : '-'
  const h = Math.floor(Math.abs(mins) / 60)
  const m = Math.abs(mins) % 60
  return `UTC${sign}${h}${m ? ':' + pad(m) : ''}`
}

const toUtcPreview = (local: string): string | null => {
  const ts = Date.parse(local)
  if (Number.isNaN(ts)) return null
  const d = new Date(ts)
  return `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())} UTC`
}

type BooleanFormKey = {
  [K in keyof TokenForm]: TokenForm[K] extends boolean ? K : never
}[keyof TokenForm]

function Distribution () {
  const { form, setField } = useTokenWizard()

  const toggleField = (key: BooleanFormKey) => () => setField(key, !form[key])

  const addPreProgrammedRow = () => {
    const next = [...(form.preProgrammedRows || []), { id: makeRowId(), time: '', identity: '', amount: '' }]
    setField('preProgrammedRows', next)
  }

  return (
    <div className='Advanced'>
      <Stack spacing={2} className='Advanced__Body'>

        <Row
          label='Allow direct purchase'
          tooltip='Owner can set a price and accept direct purchases from holders.'
        >
          <YesNoBadge
            value={form.allowDirectPurchase}
            onToggle={toggleField('allowDirectPurchase')}
          />
        </Row>

        <Row
          label='New tokens destination identity'
          tooltip='Identity ID that receives newly minted tokens. Empty = contract owner. Useful for treasury / vault setups.'
        >
          <Input
            size='xs'
            variant='filled'
            placeholder='Optional Identity ID'
            value={form.destinationIdentity}
            onChange={(e) => setField('destinationIdentity', e.target.value)}
            fontFamily='mono'
            w='100%'
            maxW='280px'
          />
        </Row>

        <GroupHeader
          label='Pre-programmed distribution'
          tooltip='One-off scheduled distributions. Each row sends a fixed amount to one identity at a specific time. Useful for airdrops or vesting unlocks. Amounts are in tokens (scaled by 10^decimals on chain).'
          onAdd={addPreProgrammedRow}
        />
        {(form.preProgrammedRows || []).length > 0 && (
          <Text fontSize='0.6875rem' fontFamily='var(--font-body)' color='var(--chakra-colors-white-50)'>
            Times are in your local zone ({tzOffsetLabel()}); the on-chain UTC instant is shown under each row.
          </Text>
        )}
        {(form.preProgrammedRows || []).map((row, idx) => {
          const utc = row.time ? toUtcPreview(row.time) : null
          return (
            <Stack key={row.id} spacing={1} className='Advanced__RepeaterRow'>
              <HStack spacing={2} align='center' flexWrap='wrap'>
                <Input
                  size='xs'
                  variant='filled'
                  type='datetime-local'
                  value={row.time}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const next = [...form.preProgrammedRows]
                    next[idx] = { ...row, time: e.target.value }
                    setField('preProgrammedRows', next)
                  }}
                  fontFamily='mono'
                  flex='1 1 170px'
                  // Dark popup + visible calendar glyph on the dark field.
                  sx={{
                    colorScheme: 'dark',
                    '&::-webkit-calendar-picker-indicator': { filter: 'invert(0.8)', cursor: 'pointer' }
                  }}
                />
                <Input
                  size='xs'
                  variant='filled'
                  placeholder='Identity ID'
                  value={row.identity}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const next = [...form.preProgrammedRows]
                    next[idx] = { ...row, identity: e.target.value }
                    setField('preProgrammedRows', next)
                  }}
                  fontFamily='mono'
                  flex='2 1 160px'
                />
                <Input
                  size='xs'
                  variant='filled'
                  placeholder='Amount'
                  value={row.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const v = e.target.value.replace(/\D/g, '')
                    const next = [...form.preProgrammedRows]
                    next[idx] = { ...row, amount: v }
                    setField('preProgrammedRows', next)
                  }}
                  fontFamily='mono'
                  inputMode='numeric'
                  flex='1 1 100px'
                />
                <IconButton
                  size='xs'
                  variant='ghost'
                  aria-label='Remove row'
                  icon={<span style={{ fontSize: '14px', lineHeight: 1 }}>×</span>}
                  onClick={() => {
                    const next = form.preProgrammedRows.filter((_, i) => i !== idx)
                    setField('preProgrammedRows', next)
                  }}
                />
              </HStack>
              {utc && (
                <Text fontSize='0.625rem' fontFamily='mono' color='var(--chakra-colors-white-50)'>
                  → {utc}
                </Text>
              )}
            </Stack>
          )
        })}

        <GroupHeader
          label='Perpetual distribution'
          tooltip='Mints a fixed amount on every time interval. Advanced function shapes (linear/exponential/stepwise) and block- / epoch-based timing are not configurable here — use Dash Evo Tool for those.'
        />
        <Row
          label='Enable perpetual emission'
          tooltip='Turn on to schedule a recurring auto-mint. Off keeps perpetualDistribution null.'
        >
          <YesNoBadge
            value={form.perpetualEnabled}
            onToggle={toggleField('perpetualEnabled')}
          />
        </Row>
        {form.perpetualEnabled && (
          <>
            <Row
              label='Type'
              tooltip='How the emission interval is measured. Time = wall-clock; Block = every N blocks; Epoch = every N protocol epochs (~9 days each). Epoch unlocks the Evonodes recipient.'
            >
              <Select
                size='xs'
                variant='filled'
                value={form.perpetualType}
                onChange={(e) => {
                  const v = e.target.value as PerpetualType
                  setField('perpetualType', v)
                  if (v !== 'epoch' && form.perpetualRecipient === 'evonodes') setField('perpetualRecipient', 'owner')
                }}
                flex='1'
                minW='0'
                maxW='160px'
                fontFamily='mono'
              >
                <option value='time'>Time</option>
                <option value='block'>Block</option>
                <option value='epoch'>Epoch</option>
              </Select>
            </Row>
            <Row
              label='Interval'
              tooltip='How often new tokens are emitted.'
            >
              <HStack spacing={2} flex='1' minW='0' maxW='240px'>
                <Input
                  size='xs'
                  variant='filled'
                  placeholder='7'
                  value={form.perpetualIntervalValue}
                  onChange={(e) => setField('perpetualIntervalValue', e.target.value.replace(/\D/g, ''))}
                  fontFamily='mono'
                  inputMode='numeric'
                  flex='1'
                  minW='0'
                />
                {form.perpetualType === 'time'
                  ? (
                    <Select
                      size='xs'
                      variant='filled'
                      value={form.perpetualIntervalUnit}
                      onChange={(e) => setField('perpetualIntervalUnit', e.target.value as IntervalUnit)}
                      flex='1'
                      minW='0'
                      fontFamily='mono'
                    >
                      <option value='seconds'>seconds</option>
                      <option value='minutes'>minutes</option>
                      <option value='hours'>hours</option>
                      <option value='days'>days</option>
                    </Select>
                    )
                  : (
                    <span style={{ fontFamily: 'mono', fontSize: '12px', color: 'var(--chakra-colors-gray-300)', alignSelf: 'center' }}>
                      {form.perpetualType === 'block' ? 'blocks' : 'epochs'}
                    </span>
                    )}
              </HStack>
            </Row>
            <Row
              label='Amount per interval'
              tooltip='In tokens. Multiplied by 10^decimals on chain.'
            >
              <Input
                size='xs'
                variant='filled'
                placeholder='1000'
                value={form.perpetualAmount}
                onChange={(e) => setField('perpetualAmount', e.target.value.replace(/\D/g, ''))}
                fontFamily='mono'
                inputMode='numeric'
                flex='1'
                minW='0'
                maxW='160px'
              />
            </Row>
            <Row
              label='Recipient'
              tooltip='Who receives the periodic emissions. Owner is the default.'
            >
              <Select
                size='xs'
                variant='filled'
                value={form.perpetualRecipient}
                onChange={(e) => setField('perpetualRecipient', e.target.value as PerpetualRecipient)}
                flex='1'
                minW='0'
                maxW='180px'
                fontFamily='mono'
              >
                <option value='owner'>Contract owner</option>
                <option value='identity'>Specific identity</option>
                {form.perpetualType === 'epoch' && <option value='evonodes'>Evonodes by participation</option>}
              </Select>
            </Row>
            {form.perpetualRecipient === 'identity' && (
              <Row
                label='Recipient identity'
                tooltip='Identity ID that receives all emissions. Required when recipient is Specific identity.'
              >
                <Input
                  size='xs'
                  variant='filled'
                  placeholder='Identity ID'
                  value={form.perpetualRecipientIdentity}
                  onChange={(e) => setField('perpetualRecipientIdentity', e.target.value)}
                  fontFamily='mono'
                  flex='1'
                  minW='0'
                  maxW='280px'
                />
              </Row>
            )}
          </>
        )}

      </Stack>
    </div>
  )
}

export default Distribution
