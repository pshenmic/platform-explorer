import React, { useState, useEffect, useCallback, memo } from 'react'
import { Progress } from '@chakra-ui/react'
import { useKeenSlider } from 'keen-slider/react'
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons'
import 'keen-slider/keen-slider.min.css'
import './Slider.scss'
import './SliderNavigation.scss'

const SliderProgressBar = memo(function SliderProgressBar ({ isActive, autoPlaySpeed, onComplete }) {
  const [progress, setProgress] = useState(0)
  const transitionInterval = 1000

  useEffect(() => {
    if (!isActive) {
      setProgress(0)
      return
    }

    const updateProgress = () => {
      setProgress(prev => {
        if (prev >= 100) {
          onComplete()
          return 0
        }
        return prev + (100 / (autoPlaySpeed / transitionInterval))
      })
    }

    updateProgress()
    const interval = setInterval(updateProgress, transitionInterval)
    return () => clearInterval(interval)
  }, [isActive, autoPlaySpeed, onComplete])

  return (
    <Progress
      className={'SliderNavigation__ProgressBar'}
      value={progress}
      height={'2px'}
      colorScheme={'gray'}
      sx={{
        '& > div': {
          transition: `width ${progress !== 0 ? transitionInterval : 0}ms linear`
        }
      }}
    />
  )
})

function Slider ({
  children,
  settings = {},
  plugins = [],
  className,
  showProgressBar = true,
  showNavButtons = true,
  autoPlaySpeed = 5000,
  createdCallback
}) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = React.Children.count(children)

  const [sliderRef, slider] = useKeenSlider({
    ...settings,
    slideChanged (s) {
      setCurrentSlide(s.track.details.rel)
    },
    created () {
      if (typeof createdCallback === 'function') createdCallback(true)
    }
  }, plugins)

  const handleNextSlide = useCallback(() => {
    if (currentSlide !== totalSlides - 1) {
      slider.current?.next()
    } else {
      slider.current?.moveToIdx(0)
    }
  }, [currentSlide, totalSlides, slider])

  const handlePrevSlide = useCallback(() => {
    if (currentSlide !== 0) {
      slider.current?.prev()
    }
  }, [currentSlide, slider])

  return (
    <div className={'Slider'}>
      <div ref={sliderRef} className={`Slider__Carousel keen-slider ${className || ''}`}>{children}</div>

      <div className={'Slider__Navigation SliderNavigation'}>
        {showProgressBar && (
          <div className={'SliderNavigation__ProgressBars'}>
            {[...Array(totalSlides)].map((_, index) => (
              <SliderProgressBar
                key={index}
                isActive={currentSlide === index}
                autoPlaySpeed={autoPlaySpeed}
                onComplete={handleNextSlide}
              />
            ))}
          </div>
        )}

        {showNavButtons && (
          <div className={'SliderNavigation__Buttons'}>
            <button
              className={`SliderNavigation__Button SliderNavigation__Button--Prev ${
                currentSlide === 0 ? 'SliderNavigation__Button--Disabled' : ''
              }`}
              onClick={handlePrevSlide}
            >
              <ChevronLeftIcon color={'#ddd'}/>
            </button>
            <button
              className={`SliderNavigation__Button SliderNavigation__Button--Next ${
                currentSlide === totalSlides - 1 ? 'SliderNavigation__Button--Disabled' : ''
              }`}
              onClick={handleNextSlide}
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
