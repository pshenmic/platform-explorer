'use client'

import { useQuery } from '@tanstack/react-query'
import * as Api from '../../../util/Api'
import { removeTrailingZeros, roundUsd } from '../../../util'

export default function ValidatorAmountDetails({ dash }: { dash?: number | null }) {
  const valid = dash != null && Number.isFinite(dash) && dash >= 0
  const rate = useQuery({
    queryKey: ['rate'],
    queryFn: () => Api.getRate(),
    staleTime: 60_000,
    enabled: valid
  })
  const usd =
    valid && !rate.isError && rate.data?.usd != null && rate.data.usd > 0
      ? dash * rate.data.usd
      : null

  if (!valid) return <>Unavailable</>

  return (
    <>
      <div>{removeTrailingZeros(dash.toFixed(8))} DASH</div>
      <div>
        {usd != null && Number.isFinite(usd)
          ? `$${roundUsd(usd)} USD`
          : rate.isPending
            ? 'USD loading…'
            : 'USD unavailable'}
      </div>
    </>
  )
}
