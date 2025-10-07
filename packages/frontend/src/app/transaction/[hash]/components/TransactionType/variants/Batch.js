import { InfoLine } from '@components/data'
import { TransitionCard } from '@components/transactions'

/**
 * Renders a batch of document transitions within a transaction.
 *
 * @param {Object} props
 * @param {Array<Object>} [props.transitions] - List of state transitions to display.
 * @param {string} [props.ownerId] - Identity identifier of the transaction owner.
 * @param {number} [props.rate] - Fiat/DASH conversion rate used by nested components.
 * @param {boolean} [props.loading] - Loading state flag.
 * @returns {JSX.Element}
 */
export const Batch = ({ transitions, ownerId, rate, loading }) => (
    <>
      <InfoLine
        className={'TransactionPage__InfoLine TransactionPage__InfoLine--Transitions'}
        title={`Transitions ${transitions !== undefined ? `(${transitions?.length})` : ''}`}
        value={(<>
          {transitions?.map((transition, i) => (
            <TransitionCard
              className={'TransactionPage__TransitionCard'}
              transition={transition}
              owner={ownerId}
              rate={rate}
              key={i}/>
          ))}
        </>)}
        loading={loading}
        error={transitions === undefined}
      />
    </>
)
