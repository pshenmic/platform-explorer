import React, { useState, useEffect, useCallback, memo } from 'react'
import type { ReactNode } from 'react'
import { useKeenSlider } from 'keen-slider/react'
import type { KeenSliderOptions, KeenSliderPlugin } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
import './Slider.css'
import './SliderNavigation.css'
import type { WithChildren, WithClassName } from '../../../types/common'

interface SliderProgressBarProps {
  isActive: boolean
  autoPlaySpeed: number
  onComplete: () => void
}

const SliderProgressBar = memo(function SliderProgressBar({
  isActive,
  autoPlaySpeed,
  onComplete
}: SliderProgressBarProps) {
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
        return prev + 100 / (autoPlaySpeed / transitionInterval)
      })
    }

    updateProgress()
    const interval = setInterval(updateProgress, transitionInterval)
    return () => clearInterval(interval)
  }, [isActive, autoPlaySpeed, onComplete])

  return (
    <div className={'SliderNavigation__ProgressBar Progress Progress--gray'}>
      <div
        className={'Progress__Fill'}
        style={{
          width: `${progress}%`,
          transition: `width ${progress !== 0 ? transitionInterval : 0}ms linear`
        }}
      />
    </div>
  )
})

interface SliderProps extends WithChildren, WithClassName {
  settings?: KeenSliderOptions
  plugins?: KeenSliderPlugin[]
  showProgressBar?: boolean
  showNavButtons?: boolean
  autoPlaySpeed?: number
  createdCallback?: (created: boolean) => void
}

function Slider({
  children,
  settings = {},
  plugins = [],
  className,
  showProgressBar = true,
  showNavButtons = true,
  autoPlaySpeed = 5000,
  createdCallback
}: SliderProps) {
  const [currentSlide, setCurrentSlide] = useState(0)
  const totalSlides = React.Children.count(children)

  const [sliderRef, slider] = useKeenSlider(
    {
      ...settings,
      slideChanged(s) {
        setCurrentSlide(s.track.details.rel)
      },
      created() {
        if (typeof createdCallback === 'function') createdCallback(true)
      }
    },
    plugins
  )

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
      <div ref={sliderRef} className={`Slider__Carousel keen-slider ${className || ''}`}>
        {children}
      </div>

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
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ddd" aria-hidden="true">
                <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
              </svg>
            </button>
            <button
              className={`SliderNavigation__Button SliderNavigation__Button--Next ${
                currentSlide === totalSlides - 1 ? 'SliderNavigation__Button--Disabled' : ''
              }`}
              onClick={handleNextSlide}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#ddd" aria-hidden="true">
                <path d="M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface SliderElementProps extends WithChildren, WithClassName {}

function SliderElement({ children, className }: SliderElementProps) {
  return <div className={`keen-slider__slide ${className || ''}`}>{children}</div>
}

export { Slider, SliderElement }

export type { SliderProps, SliderElementProps }
