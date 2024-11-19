import Image from 'next/image'
import { minidenticon } from 'minidenticons'
import { useMemo } from 'react'

export default function ImageGenerator ({ username, saturation, lightness, ...props }) {
  const svgURI = useMemo(
    () => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(username, saturation, lightness)),
    [username, saturation, lightness]
  )

  return (<Image src={svgURI} alt={username || ''} {...props} />)
}
