import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import SkipButton from './SkipButton'

const VIDEOS = [
  { src: '/videos/ceramic.mp4', poster: '/videos/ceramic_poster.jpg', text: 'الجودة تبدأ من اللمسة الأولى' },
  { src: '/videos/sanitary.mp4', poster: '/videos/sanitary_poster.jpg', text: 'تفاصيل تصنع الفرق' },
  { src: '/videos/decorative.mp4', poster: '/videos/decorative_poster.jpg', text: 'إبداع يتحدث بصمت' },
]

const VIDEO_DURATION_MS = 5000
const CROSSFADE_MS = 800
const TEXT_FADE_IN_DELAY_MS = 500
const TEXT_FADE_OUT_BEFORE_END_MS = 1200

interface CinematicTourProps {
  onNext: () => void
}

export default function CinematicTour({ onNext }: CinematicTourProps) {
  const [currentVideo, setCurrentVideo] = useState(0)
  const [prevVideo, setPrevVideo] = useState<number | null>(null)
  const [showText, setShowText] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([])
  const mountedRef = useRef(true)

  const finish = useCallback(() => {
    videoRefs.current.forEach((v) => {
      if (v) { v.pause(); v.currentTime = 0 }
    })
    onNext()
  }, [onNext])

  useEffect(() => {
    mountedRef.current = true
    return () => { mountedRef.current = false }
  }, [])

  useEffect(() => {
    const vid = videoRefs.current[currentVideo]
    if (!vid) return

    let cancelled = false
    const timers: ReturnType<typeof setTimeout>[] = []

    vid.currentTime = 0
    setIsPlaying(false)
    setShowText(false)

    const startSequence = () => {
      if (cancelled) return
      setIsPlaying(true)

      timers.push(setTimeout(() => {
        if (!cancelled) setPrevVideo(null)
      }, CROSSFADE_MS + 100))

      timers.push(setTimeout(() => {
        if (!cancelled) setShowText(true)
      }, TEXT_FADE_IN_DELAY_MS))

      timers.push(setTimeout(() => {
        if (!cancelled) setShowText(false)
      }, VIDEO_DURATION_MS - TEXT_FADE_OUT_BEFORE_END_MS))

      timers.push(setTimeout(() => {
        if (cancelled) return
        if (currentVideo >= VIDEOS.length - 1) {
          finish()
        } else {
          const prevVid = videoRefs.current[currentVideo]
          if (prevVid) {
            timers.push(setTimeout(() => {
              if (!cancelled) prevVid.pause()
            }, CROSSFADE_MS + 200))
          }
          setPrevVideo(currentVideo)
          setCurrentVideo((p) => p + 1)
        }
      }, VIDEO_DURATION_MS - Math.floor(CROSSFADE_MS / 2)))
    }

    const attemptPlay = () => {
      if (cancelled) return
      vid.play().then(() => {
        if (!cancelled) startSequence()
      }).catch(() => {
        if (!cancelled) {
          timers.push(setTimeout(attemptPlay, 250))
        }
      })
    }

    if (vid.readyState >= 3) {
      attemptPlay()
    } else {
      const onReady = () => {
        vid.removeEventListener('canplaythrough', onReady)
        if (!cancelled) attemptPlay()
      }
      vid.addEventListener('canplaythrough', onReady)
      vid.load()
    }

    return () => {
      cancelled = true
      timers.forEach(clearTimeout)
    }
  }, [currentVideo, finish])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [finish])

  return (
    <motion.div
      key="tour"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        background: '#000',
        overflow: 'hidden',
      }}
    >
      <SkipButton onClick={finish} />

      {!isPlaying && (
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 10030,
        }}>
          <div style={{
            width: 40,
            height: 40,
            border: '3px solid rgba(255,255,255,0.2)',
            borderTopColor: '#fff',
            borderRadius: '50%',
            animation: 'onboarding-spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes onboarding-spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {VIDEOS.map((video, index) => {
        const isCurrent = index === currentVideo
        const isFadingOut = index === prevVideo
        const visible = (isCurrent && isPlaying) || isFadingOut

        return (
          <video
            key={video.src}
            ref={(el) => { if (el) videoRefs.current[index] = el }}
            src={video.src}
            poster={video.poster}
            muted
            playsInline
            preload="auto"
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              opacity: visible ? (isFadingOut && !isCurrent ? 0 : 1) : 0,
              transition: `opacity ${CROSSFADE_MS}ms ease-in-out`,
              zIndex: isCurrent ? 10011 : 10010,
            }}
          />
        )
      })}

      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '30%',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.4) 30%, transparent 60%)',
        pointerEvents: 'none',
        zIndex: 10020,
      }} />

      <AnimatePresence mode="wait">
        {showText && (
          <motion.p
            key={`text-${currentVideo}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.5 }}
            style={{
              position: 'absolute',
              bottom: '12%',
              left: 0,
              right: 0,
              textAlign: 'center',
              color: '#fff',
              fontSize: 'clamp(24px, 4.5vw, 36px)',
              fontWeight: 600,
              letterSpacing: '0.03em',
              textShadow: '0 2px 12px rgba(0,0,0,0.8)',
              padding: '0 24px',
              direction: 'rtl',
              zIndex: 10030,
            }}
          >
            {VIDEOS[currentVideo].text}
          </motion.p>
        )}
      </AnimatePresence>

      <div style={{
        position: 'absolute',
        bottom: 32,
        left: '50%',
        transform: 'translateX(-50%)',
        display: 'flex',
        gap: 8,
        zIndex: 10030,
      }}>
        {VIDEOS.map((_, i) => (
          <div
            key={i}
            style={{
              width: i === currentVideo ? 32 : 8,
              height: 8,
              borderRadius: 4,
              background: i === currentVideo ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.4)',
              transition: 'all 0.4s ease',
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}
