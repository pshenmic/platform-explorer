import Image from 'next/image'
import { minidenticon } from 'minidenticons'
import { useMemo } from 'react'
import './ImageGenerator.scss'

export default function ImageGenerator ({ username, className, hat = null, saturation, lightness, ...props }) {
  const svgURI = useMemo(
    () => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(username, saturation, lightness)),
    [username, saturation, lightness]
  )

  const ImageElement = <Image src={svgURI} alt={username || ''} className={'ImageGenerator__Image'} {...props}/>

  const hatClasses = {
    christmas: 'ImageGenerator__Hat--Christmas'
  }

  return (
    <div className={`ImageGenerator ${className || ''}`}>
      {hat && <div className={`ImageGenerator__Hat ${hatClasses?.[hat] || ''}`}></div>}
      {ImageElement}
    </div>
  )
}
