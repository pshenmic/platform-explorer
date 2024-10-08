import './CreditsBlock.scss'

export default function CreditsBlock ({ credits, usd, format }) {
  return (
    <span className={'CreditsBlock'}>
      <span className={'CreditsBlock__Credits'}>{credits} CREDITS</span>
      <span className={'CreditsBlock__Dash'}>({credits / 1000} DASH)</span>
      <span className={'CreditsBlock__Usd'}>~{usd}$</span>
    </span>
  )
}
