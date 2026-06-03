'use client'

import { HStack, Stack, Input, Select, IconButton } from '@chakra-ui/react'
import { YesNoBadge } from './FeatureRow'
import { Row, GroupHeader } from './AdvancedRow'
import { useTokenWizard } from '../TokenWizardContext'
import './Advanced.scss'

let __rowSeq = 0
const makeRowId = () => `pp${++__rowSeq}`

function Distribution () {
  const { form, setField } = useTokenWizard()

  const toggleField = (key) => () => setField(key, !form[key])

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
            width='280px'
          />
        </Row>

        <GroupHeader
          label='Pre-programmed distribution'
          tooltip='One-off scheduled distributions. Each row sends a fixed amount to one identity at a specific time. Useful for airdrops or vesting unlocks. Amounts are in tokens (scaled by 10^decimals on chain).'
          onAdd={addPreProgrammedRow}
        />
        {(form.preProgrammedRows || []).map((row, idx) => (
          <HStack key={row.id} className='Advanced__RepeaterRow' spacing={2} align='center'>
            <Input
              size='xs'
              variant='filled'
              type='datetime-local'
              value={row.time}
              onChange={(e) => {
                const next = [...form.preProgrammedRows]
                next[idx] = { ...row, time: e.target.value }
                setField('preProgrammedRows', next)
              }}
              fontFamily='mono'
              width='200px'
            />
            <Input
              size='xs'
              variant='filled'
              placeholder='Identity ID'
              value={row.identity}
              onChange={(e) => {
                const next = [...form.preProgrammedRows]
                next[idx] = { ...row, identity: e.target.value }
                setField('preProgrammedRows', next)
              }}
              fontFamily='mono'
              flex={1}
            />
            <Input
              size='xs'
              variant='filled'
              placeholder='Amount'
              value={row.amount}
              onChange={(e) => {
                const v = e.target.value.replace(/\D/g, '')
                const next = [...form.preProgrammedRows]
                next[idx] = { ...row, amount: v }
                setField('preProgrammedRows', next)
              }}
              fontFamily='mono'
              inputMode='numeric'
              width='120px'
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
        ))}

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
              label='Interval'
              tooltip='How often new tokens are emitted. Stored on chain as TimestampMillisInterval.'
            >
              <HStack spacing={2}>
                <Input
                  size='xs'
                  variant='filled'
                  placeholder='7'
                  value={form.perpetualIntervalValue}
                  onChange={(e) => setField('perpetualIntervalValue', e.target.value.replace(/\D/g, ''))}
                  fontFamily='mono'
                  inputMode='numeric'
                  width='80px'
                />
                <Select
                  size='xs'
                  variant='filled'
                  value={form.perpetualIntervalUnit}
                  onChange={(e) => setField('perpetualIntervalUnit', e.target.value)}
                  width='110px'
                  fontFamily='mono'
                >
                  <option value='seconds'>seconds</option>
                  <option value='minutes'>minutes</option>
                  <option value='hours'>hours</option>
                  <option value='days'>days</option>
                </Select>
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
                width='160px'
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
                onChange={(e) => setField('perpetualRecipient', e.target.value)}
                width='180px'
                fontFamily='mono'
              >
                <option value='owner'>Contract owner</option>
                <option value='identity'>Specific identity</option>
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
                  width='280px'
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
