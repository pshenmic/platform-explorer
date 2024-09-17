import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'

function Slider ({ children, settings = {}, plugins = [], className }) {
  const [sliderRef] = useKeenSlider(settings, plugins)

  return (
    <div ref={sliderRef} className={`keen-slider ${className || ''}`}>{children}</div>
  )
}

function SliderElement ({ children, className }) {
  return (
    <div className={`keen-slider__slide ${className || ''}`}>{children}</div>
  )
}

export {
  Slider,
  SliderElement
}
