import BigNumber from './BigNumber'
import { roundUsd, removeTrailingZeros, creditsToDash } from '../../util'
import './CreditsBlock.scss'

export default function CreditsBlock ({ credits, rate }) {
  return (
    <span className={'CreditsBlock'}>
      {typeof credits === 'number'
        ? <>
          <span className={'CreditsBlock__Credits'}><BigNumber>{credits}</BigNumber> CREDITS</span>
            <span className={'CreditsBlock__Dash'}>({removeTrailingZeros(creditsToDash(Number(credits)).toFixed(8))} DASH)</span>
            {typeof rate?.data?.usd === 'number' &&
              <span className={'CreditsBlock__Usd'}>
                ~{roundUsd(creditsToDash(Number(credits)) * rate?.data?.usd)}$
              </span>
            }
        </>
        : <span className={'CreditsBlock__NotActive'}>n/a</span>
      }
    </span>
  )
}
