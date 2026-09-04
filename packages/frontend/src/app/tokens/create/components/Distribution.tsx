'use client'

import type { ChangeEvent } from 'react'
import { YesNoBadge } from './FeatureRow'
import { Row, GroupHeader } from './AdvancedRow'
import { useTokenWizard } from '../TokenWizardContext'
import type {
  IntervalUnit,
  PerpetualRecipient,
  PerpetualType,
  TokenForm
} from '../TokenWizardContext'
import './Advanced.css'
import './Features.css'

let __rowSeq = 0
const makeRowId = (): string => `pp${++__rowSeq}`

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

function Distribution() {
  const { form, setField } = useTokenWizard()

  const toggleField = (key: BooleanFormKey) => () => setField(key, !form[key])

  const addPreProgrammedRow = () => {
    const next = [
      ...(form.preProgrammedRows || []),
      { id: makeRowId(), time: '', identity: '', amount: '' }
    ]
    setField('preProgrammedRows', next)
  }

  return (
    <div className="Advanced">
      <div className="Advanced__Body">
        <Row
          label="Allow direct purchase"
          tooltip="Owner can set a price and accept direct purchases from holders."
        >
          <YesNoBadge
            value={form.allowDirectPurchase}
            onToggle={toggleField('allowDirectPurchase')}
          />
        </Row>

        <Row
          label="New tokens destination identity"
          tooltip="Identity ID that receives newly minted tokens. Empty = contract owner. Useful for treasury / vault setups."
        >
          <input
            className="WizardInput WizardInput--xs"
            placeholder="Optional Identity ID"
            value={form.destinationIdentity}
            onChange={e => setField('destinationIdentity', e.target.value)}
            style={{ width: '100%', maxWidth: '280px' }}
          />
        </Row>

        <GroupHeader
          label="Pre-programmed distribution"
          tooltip="One-off scheduled distributions. Each row sends a fixed amount to one identity at a specific time. Useful for airdrops or vesting unlocks. Amounts are in tokens (scaled by 10^decimals on chain)."
          onAdd={addPreProgrammedRow}
        />
        {(form.preProgrammedRows || []).length > 0 && (
          <p className="Advanced__Hint">
            Times are in your local zone ({tzOffsetLabel()}); the on-chain UTC instant is shown under
            each row.
          </p>
        )}
        {(form.preProgrammedRows || []).map((row, idx) => {
          const utc = row.time ? toUtcPreview(row.time) : null
          return (
            <div key={row.id} className="Advanced__RepeaterRow">
              <div className="Advanced__RepeaterFields">
                <input
                  className="WizardInput WizardInput--xs WizardInput--datetime"
                  type="datetime-local"
                  value={row.time}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const next = [...form.preProgrammedRows]
                    next[idx] = { ...row, time: e.target.value }
                    setField('preProgrammedRows', next)
                  }}
                  style={{ flex: '1 1 170px', colorScheme: 'dark' }}
                />
                <input
                  className="WizardInput WizardInput--xs"
                  placeholder="Identity ID"
                  value={row.identity}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const next = [...form.preProgrammedRows]
                    next[idx] = { ...row, identity: e.target.value }
                    setField('preProgrammedRows', next)
                  }}
                  style={{ flex: '2 1 160px' }}
                />
                <input
                  className="WizardInput WizardInput--xs"
                  placeholder="Amount"
                  value={row.amount}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const v = e.target.value.replace(/\D/g, '')
                    const next = [...form.preProgrammedRows]
                    next[idx] = { ...row, amount: v }
                    setField('preProgrammedRows', next)
                  }}
                  inputMode="numeric"
                  style={{ flex: '1 1 100px' }}
                />
                <button
                  type="button"
                  className="WizardIconBtn WizardIconBtn--ghost"
                  aria-label="Remove row"
                  onClick={() => {
                    const next = form.preProgrammedRows.filter((_, i) => i !== idx)
                    setField('preProgrammedRows', next)
                  }}
                >
                  ×
                </button>
              </div>
              {utc && <p className="Advanced__Utc">→ {utc}</p>}
            </div>
          )
        })}

        <GroupHeader
          label="Perpetual distribution"
          tooltip="Mints a fixed amount on every time interval. Advanced function shapes (linear/exponential/stepwise) and block- / epoch-based timing are not configurable here — use Dash Evo Tool for those."
        />
        <Row
          label="Enable perpetual emission"
          tooltip="Turn on to schedule a recurring auto-mint. Off keeps perpetualDistribution null."
        >
          <YesNoBadge value={form.perpetualEnabled} onToggle={toggleField('perpetualEnabled')} />
        </Row>
        {form.perpetualEnabled && (
          <>
            <Row
              label="Type"
              tooltip="How the emission interval is measured. Time = wall-clock; Block = every N blocks; Epoch = every N protocol epochs (~9 days each). Epoch unlocks the Evonodes recipient."
            >
              <select
                className="WizardSelect"
                value={form.perpetualType}
                onChange={e => {
                  const v = e.target.value as PerpetualType
                  setField('perpetualType', v)
                  if (v !== 'epoch' && form.perpetualRecipient === 'evonodes')
                    setField('perpetualRecipient', 'owner')
                }}
                style={{ flex: 1, minWidth: 0, maxWidth: '160px' }}
              >
                <option value="time">Time</option>
                <option value="block">Block</option>
                <option value="epoch">Epoch</option>
              </select>
            </Row>
            <Row label="Interval" tooltip="How often new tokens are emitted.">
              <div className="Advanced__Interval">
                <input
                  className="WizardInput WizardInput--xs"
                  placeholder="7"
                  value={form.perpetualIntervalValue}
                  onChange={e =>
                    setField('perpetualIntervalValue', e.target.value.replace(/\D/g, ''))
                  }
                  inputMode="numeric"
                  style={{ flex: 1, minWidth: 0 }}
                />
                {form.perpetualType === 'time' ? (
                  <select
                    className="WizardSelect"
                    value={form.perpetualIntervalUnit}
                    onChange={e =>
                      setField('perpetualIntervalUnit', e.target.value as IntervalUnit)
                    }
                    style={{ flex: 1, minWidth: 0 }}
                  >
                    <option value="seconds">seconds</option>
                    <option value="minutes">minutes</option>
                    <option value="hours">hours</option>
                    <option value="days">days</option>
                  </select>
                ) : (
                  <span className="Advanced__Unit">
                    {form.perpetualType === 'block' ? 'blocks' : 'epochs'}
                  </span>
                )}
              </div>
            </Row>
            <Row
              label="Amount per interval"
              tooltip="In tokens. Multiplied by 10^decimals on chain."
            >
              <input
                className="WizardInput WizardInput--xs"
                placeholder="1000"
                value={form.perpetualAmount}
                onChange={e => setField('perpetualAmount', e.target.value.replace(/\D/g, ''))}
                inputMode="numeric"
                style={{ flex: 1, minWidth: 0, maxWidth: '160px' }}
              />
            </Row>
            <Row
              label="Recipient"
              tooltip="Who receives the periodic emissions. Owner is the default."
            >
              <select
                className="WizardSelect"
                value={form.perpetualRecipient}
                onChange={e => setField('perpetualRecipient', e.target.value as PerpetualRecipient)}
                style={{ flex: 1, minWidth: 0, maxWidth: '180px' }}
              >
                <option value="owner">Contract owner</option>
                <option value="identity">Specific identity</option>
                {form.perpetualType === 'epoch' && (
                  <option value="evonodes">Evonodes by participation</option>
                )}
              </select>
            </Row>
            {form.perpetualRecipient === 'identity' && (
              <Row
                label="Recipient identity"
                tooltip="Identity ID that receives all emissions. Required when recipient is Specific identity."
              >
                <input
                  className="WizardInput WizardInput--xs"
                  placeholder="Identity ID"
                  value={form.perpetualRecipientIdentity}
                  onChange={e => setField('perpetualRecipientIdentity', e.target.value)}
                  style={{ flex: 1, minWidth: 0, maxWidth: '280px' }}
                />
              </Row>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default Distribution
