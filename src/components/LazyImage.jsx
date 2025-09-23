import React, { useState, useRef, useEffect } from 'react'
import { Box, Skeleton } from '@mui/material'

const LazyImage = ({ 
  src, 
  alt, 
  style = {}, 
  placeholder = null,
  onLoad = () => {},
  onError = () => {},
  threshold = 0.1,
  rootMargin = '50px',
  ...props 
}) => {
  const [isLoaded, setIsLoaded] = useState(false)
  const [isInView, setIsInView] = useState(false)
  const [hasError, setHasError] = useState(false)
  const imgRef = useRef(null)
  const observerRef = useRef(null)

  useEffect(() => {
    const currentImg = imgRef.current
    
    if (!currentImg) return

    // Check if IntersectionObserver is supported
    if (typeof IntersectionObserver === 'undefined') {
      // Fallback: load image immediately if IntersectionObserver is not supported
      setIsInView(true)
      return
    }

    // Create intersection observer
    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries
        if (entry.isIntersecting) {
          setIsInView(true)
          // Disconnect observer once image is in view
          if (observerRef.current) {
            observerRef.current.disconnect()
          }
        }
      },
      {
        threshold,
        rootMargin
      }
    )

    // Start observing
    observerRef.current.observe(currentImg)

    // Cleanup
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect()
      }
    }
  }, [threshold, rootMargin])

  const handleImageLoad = () => {
    setIsLoaded(true)
    onLoad()
  }

  const handleImageError = () => {
    setHasError(true)
    onError()
  }

  // Default placeholder component
  const defaultPlaceholder = (
    <Skeleton 
      variant="rectangular" 
      width={style.width || '100%'} 
      height={style.height || 120}
      sx={{ borderRadius: 1 }}
    />
  )

  return (
    <Box 
      ref={imgRef}
      style={{
        position: 'relative',
        overflow: 'hidden',
        ...style
      }}
      {...props}
    >
      {!isInView && (placeholder || defaultPlaceholder)}
      
      {isInView && !hasError && (
        <>
          {!isLoaded && (placeholder || defaultPlaceholder)}
          <img
            src={src}
            alt={alt}
            onLoad={handleImageLoad}
            onError={handleImageError}
            style={{
              ...style,
              opacity: isLoaded ? 1 : 0,
              transition: 'opacity 0.3s ease-in-out',
              position: isLoaded ? 'static' : 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%'
            }}
          />
        </>
      )}
      
      {hasError && (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: style.width || '100%',
            height: style.height || 120,
            bgcolor: 'grey.100',
            color: 'grey.500',
            fontSize: '0.75rem',
            textAlign: 'center',
            border: '1px solid',
            borderColor: 'grey.300',
            borderRadius: 1
          }}
        >
          Failed to load image
        </Box>
      )}
    </Box>
  )
}

export default LazyImage
