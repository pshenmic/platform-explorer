import React, { useState, useEffect } from 'react'
import { Progress } from '@chakra-ui/react'
import { useKeenSlider } from 'keen-slider/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import 'keen-slider/keen-slider.min.css'
import './Slider.scss'
import './SliderNavigation.scss'

function Slider ({
  children,
  settings = {},
  plugins = [],
  className,
  showProgressBar = true,
  showNavButtons = true,
  autoPlaySpeed = 5000
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = React.Children.count(children)
  const [progress, setProgress] = useState(0)
  const [sliderRef, slider] = useKeenSlider({
    ...settings,
    slideChanged (s) {
      setCurrentSlide(s.track.details.rel)
      resetProgress()
    }
  }, plugins)
  const resetProgress = () => setProgress(0)

  const updateProgress = () => {
    setProgress((prev) => {
      if (prev >= 100) {
        if (currentSlide !== totalSlides - 1) {
          slider.current?.next()
        } else {
          slider.current?.moveToIdx(0)
        }

        return 0
      }
      return prev + (100 / (autoPlaySpeed / 10))
    })
  }

  useEffect(() => {
    const interval = setInterval(updateProgress, 10)
    return () => clearInterval(interval)
  }, [currentSlide, updateProgress])

  return (
    <div className={'Slider'}>
      <div ref={sliderRef} className={`Slider__Carousel keen-slider ${className || ''}`}>{children}</div>

      <div className={'Slider__Navigation SliderNavigation'}>
        {showProgressBar && (
          <div className={'SliderNavigation__ProgressBars'}>
            {[...Array(totalSlides)].map((_, index) => (
              <Progress
                className={'SliderNavigation__ProgressBar'}
                value={currentSlide === index ? progress : 0}
                height={'2px'}
                key={index}
                colorScheme={'gray'}
              />
            ))}
          </div>
        )}

        {showNavButtons && (
          <div className={'SliderNavigation__Buttons'}>
            <button
              className={'SliderNavigation__Button SliderNavigation__Button--Prev ' +
                `${currentSlide === 0
                  ? 'SliderNavigation__Button--Disabled'
                  : ''}`
              }
              onClick={() => {
                if (currentSlide !== 0) {
                  slider.current?.prev()
                  resetProgress()
                }
              }}
            >
              <ChevronLeftIcon color={'#ddd'}/>
            </button>
            <button
              className={'SliderNavigation__Button SliderNavigation__Button--Next ' +
                `${currentSlide === totalSlides - 1
                  ? 'SliderNavigation__Button--Disabled'
                  : ''}`
              }
              onClick={() => {
                if (currentSlide !== totalSlides - 1) {
                  slider.current?.next()
                  resetProgress()
                }
              }}
            >
              <ChevronRightIcon color={'#ddd'}/>
            </button>
          </div>
        )}
      </div>
    </div>
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
