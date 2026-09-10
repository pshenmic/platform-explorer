'use client'

import Image from 'next/image'
import type { ImageProps } from 'next/image'
import { minidenticon } from 'minidenticons'
import { useMemo } from 'react'
import type { WithClassName } from '../../types/common'
import './ImageGenerator.css'

interface ImageGeneratorProps extends WithClassName, Omit<ImageProps, 'src' | 'alt' | 'className'> {
  username?: string | null
  hat?: string | null
  saturation?: number | string
  lightness?: number | string
}

export default function ImageGenerator ({
  username,
  className,
  hat = null,
  saturation,
  lightness,
  ...props
}: ImageGeneratorProps) {
  let name = username
  if (typeof name !== 'string') name = ''

  const svgURI = useMemo(
    () => 'data:image/svg+xml;utf8,' + encodeURIComponent(minidenticon(name, saturation, lightness)),
    [name, saturation, lightness]
  )

  const ImageElement = <Image src={svgURI} alt={name || ''} className={'ImageGenerator__Image'} {...props}/>

  const hatClasses: Record<string, string> = {
    christmas: 'ImageGenerator__Hat--Christmas'
  }

  if (name === '') return null

  return (
    <div className={`ImageGenerator ${className || ''}`}>
      {hat && <div className={`ImageGenerator__Hat ${hatClasses[hat] || ''}`}></div>}
      {ImageElement}
    </div>
  )
}
