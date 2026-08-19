import type { Rate } from '../../types'
import type { LoadableState } from '../../types/common'
import BigNumber from './BigNumber'
import { roundUsd, removeTrailingZeros, creditsToDash } from '../../util'
import { NotActive } from './index'
import './CreditsBlock.css'

interface CreditsBlockProps {
  credits?: number | string | null
  rate?: LoadableState<Rate> | { data?: Pick<Rate, 'usd'> | null } | null
}

export default function CreditsBlock({ credits, rate }: CreditsBlockProps) {
  const creditsNumber = Number(credits)

  return (
    <span className={'CreditsBlock'}>
      {!isNaN(creditsNumber) ? (
        <>
          <span className={'CreditsBlock__Credits'}>
            <BigNumber>{creditsNumber}</BigNumber> CREDITS
          </span>
          <span className={'CreditsBlock__Dash'}>
            ({removeTrailingZeros(creditsToDash(Number(creditsNumber)).toFixed(8))} DASH)
          </span>
          {typeof rate?.data?.usd === 'number' && (
            <span className={'CreditsBlock__Usd'}>
              ~{roundUsd(creditsToDash(Number(creditsNumber)) * rate?.data?.usd)}$
            </span>
          )}
        </>
      ) : (
        <NotActive />
      )}
    </span>
  )
}
