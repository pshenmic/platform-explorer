import React, { useState, useEffect } from 'react'
import { Progress } from '@chakra-ui/react'
import { useKeenSlider } from 'keen-slider/react'
import 'keen-slider/keen-slider.min.css'
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
  const [progress, setProgress] = useState(0)
  const [sliderRef, slider] = useKeenSlider({
    ...settings,
    slideChanged (s) {
      setCurrentSlide(s.track.details.rel) // обновляем текущий слайд
      resetProgress()
    }
  }, plugins)

  const resetProgress = () => setProgress(0)

  // Обновляем прогресс слайдов
  const updateProgress = () => {
    setProgress((prev) => {
      if (prev >= 100) {
        slider.current?.next() // Переход к следующему слайду
        return 0
      }
      return prev + (100 / (autoPlaySpeed / 100)) // Увеличиваем прогресс
    })
  }

  // Устанавливаем таймер для автопрокрутки
  useEffect(() => {
    const interval = setInterval(updateProgress, 100)
    return () => clearInterval(interval)
  }, [currentSlide])

  const totalSlides = React.Children.count(children)

  return (
    <div>
      <div ref={sliderRef} className={`keen-slider ${className || ''}`}>{children}</div>

      <div className={'SliderNavigation'}>

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
          <div className={''}>
            <button
              className={''}
              onClick={() => {
                slider.current?.prev()
                resetProgress()
              }}
            >
              {'<'}
            </button>
            <button
              className={''}
              onClick={() => {
                slider.current?.next()
                resetProgress()
              }}
            >
              {'>'}
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
