import BigNumber from './BigNumber'
import { roundUsd, removeTrailingZeros, creditsToDash } from '../../util'
import { NotActive } from './index'
import './CreditsBlock.scss'

export default function CreditsBlock ({ credits, rate }) {
  credits = Number(credits)

  return (
    <span className={'CreditsBlock'}>
      {!isNaN(credits)
        ? <>
          <span className={'CreditsBlock__Credits'}><BigNumber>{credits}</BigNumber> CREDITS</span>
            <span className={'CreditsBlock__Dash'}>({removeTrailingZeros(creditsToDash(Number(credits)).toFixed(8))} DASH)</span>
            {typeof rate?.data?.usd === 'number' &&
              <span className={'CreditsBlock__Usd'}>
                ~{roundUsd(creditsToDash(Number(credits)) * rate?.data?.usd)}$
              </span>
            }
        </>
        : <NotActive/>
      }
    </span>
  )
}
