import { useState, useEffect } from 'react'

const useWindowSize = ({ useVisualViewport = false } = {}) => {
  const getSize = () => {
    if (typeof window === 'undefined') return { width: 0, height: 0 }

    const width = useVisualViewport && window?.visualViewport
      ? window.visualViewport?.width
      : window?.innerWidth

    const height = useVisualViewport && window?.visualViewport
      ? window.visualViewport?.height
      : window?.innerHeight

    return { width, height }
  }

  const [size, setSize] = useState(getSize)

  useEffect(() => {
    const handleResize = () => setSize(getSize())

    window.addEventListener('resize', handleResize)
    if (useVisualViewport && window?.visualViewport) {
      window.visualViewport.addEventListener('resize', handleResize)
    }

    return () => {
      window.removeEventListener('resize', handleResize)
      if (window.visualViewport) {
        window.visualViewport.removeEventListener('resize', handleResize)
      }
    }
  }, [useVisualViewport])

  return size
}

export default useWindowSize
