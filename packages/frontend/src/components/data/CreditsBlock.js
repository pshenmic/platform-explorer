import './CreditsBlock.scss'
import Credits from './Credits'
import { roundUsd, creditsToDash } from '../../util'

export default function CreditsBlock ({ credits, rate, format }) {
  return (
    <span className={'CreditsBlock'}>
      <span className={'CreditsBlock__Credits'}><Credits>{credits}</Credits> CREDITS</span>
      <span className={'CreditsBlock__Dash'}>({creditsToDash(Number(credits)).toFixed(8)} DASH)</span>
      {typeof rate?.data?.usd === 'number' &&
        <span className={'CreditsBlock__Usd'}>
          ~{roundUsd(creditsToDash(Number(credits)) * rate?.data?.usd)}$
        </span>
      }
    </span>
  )
}
