interface KeenSliderInstance {
  container?: HTMLElement | null
  track?: {
    details?: {
      slides?: unknown[]
    }
  }
  options?: {
    slides?: {
      perView?: number
    }
  }
  on: (event: string, callback: () => void) => void
}

interface WheelPosition {
  x: number
  y: number
}

const WheelControls = (slider: KeenSliderInstance) => {
  let touchTimeout: ReturnType<typeof setTimeout>
  let position: WheelPosition
  let wheelActive: boolean

  function dispatch (e: WheelEvent, name: string) {
    position.x -= e.deltaX
    position.y -= e.deltaY
    slider.container?.dispatchEvent(
      new CustomEvent(name, {
        detail: {
          x: position.x,
          y: position.y
        }
      })
    )
  }

  function wheelStart (e: WheelEvent) {
    position = {
      x: e.pageX,
      y: e.pageY
    }
    dispatch(e, 'ksDragStart')
  }

  function wheel (e: WheelEvent) {
    dispatch(e, 'ksDrag')
  }

  function wheelEnd (e: WheelEvent) {
    dispatch(e, 'ksDragEnd')
  }

  function eventWheel (e: WheelEvent) {
    e.preventDefault()
    if (!wheelActive) {
      wheelStart(e)
      wheelActive = true
    }
    wheel(e)
    clearTimeout(touchTimeout)
    touchTimeout = setTimeout(() => {
      wheelActive = false
      wheelEnd(e)
    }, 50)
  }

  const initPlugin = () => {
    if (!slider?.container) return

    const details = slider.track?.details
    const totalSlides = details?.slides?.length || 0
    const visibleSlides = slider.options?.slides?.perView || 1

    slider.container.removeEventListener('wheel', eventWheel)

    if (totalSlides > visibleSlides) {
      slider.container.addEventListener('wheel', eventWheel, { passive: false })
    }
  }

  slider.on('created', initPlugin)
  slider.on('optionsChanged', initPlugin)
}

export default WheelControls
