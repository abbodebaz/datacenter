import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const COLORS = {
  warmBeige: '#F5F1EA',
  navy: '#1B3D4F',
  navyDark: '#0F2530',
  gold: '#C9A961',
}

const WELCOME_LINE_1 = 'المعرض بين يديك الآن'
const WELCOME_LINE_2 = 'استكشف بكل حرية'
const CTA_TEXT = 'ابدأ الجولة'

const PARTICLE_COUNT = 35
const BG_PARTICLE_COUNT = 12
const TYPEWRITER_SPEED_MS = 40

const TIMINGS = {
  logoStart: 600,
  textStart: 1400,
  line2Start: 2600,
  ctaStart: 2800,
}

interface WelcomeTransitionProps {
  onComplete: () => void
}

function generateGoldParticles(count: number) {
  const particles = []
  for (let i = 0; i < count; i++) {
    const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.4
    const dist = 300 + Math.random() * 200
    particles.push({
      startX: Math.cos(angle) * dist,
      startY: Math.sin(angle) * dist,
      size: 3 + Math.random() * 3,
    })
  }
  return particles
}

function generateBgParticles(count: number) {
  const particles = []
  for (let i = 0; i < count; i++) {
    particles.push({
      x: 5 + Math.random() * 90,
      size: 6 + Math.random() * 8,
      duration: 30 + Math.random() * 10,
      delay: i * 2.5,
    })
  }
  return particles
}

function TypewriterText({ text, startDelay }: { text: string; startDelay: number }) {
  const [count, setCount] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setStarted(true), startDelay)
    return () => clearTimeout(t)
  }, [startDelay])

  useEffect(() => {
    if (!started || count >= text.length) return
    const t = setTimeout(() => setCount((c) => c + 1), TYPEWRITER_SPEED_MS)
    return () => clearTimeout(t)
  }, [started, count, text.length])

  if (!started) return null

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <motion.h2
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2 }}
      style={{
        color: COLORS.navy,
        fontSize: isMobile ? 26 : 32,
        fontWeight: 700,
        marginTop: 28,
        textAlign: 'center',
        direction: 'rtl',
        minHeight: isMobile ? 36 : 44,
      }}
    >
      {text.slice(0, count)}
      {count < text.length && (
        <span style={{ opacity: 0.4, animation: 'blink 0.6s step-end infinite' }}>|</span>
      )}
    </motion.h2>
  )
}

export default function WelcomeTransition({ onComplete }: WelcomeTransitionProps) {
  const [showCTA, setShowCTA] = useState(false)
  const [showLine2, setShowLine2] = useState(false)
  const goldParticles = useMemo(() => generateGoldParticles(PARTICLE_COUNT), [])
  const bgParticles = useMemo(() => generateBgParticles(BG_PARTICLE_COUNT), [])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const logoSize = isMobile ? 80 : 110

  useEffect(() => {
    const t1 = setTimeout(() => setShowLine2(true), TIMINGS.line2Start)
    const t2 = setTimeout(() => setShowCTA(true), TIMINGS.ctaStart)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [])

  return (
    <motion.div
      key="welcome"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      dir="rtl"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10000,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'radial-gradient(circle at center, #FAF7F2 0%, #F5F1EA 60%, #EDE4D5 100%)',
        overflow: 'hidden',
      }}
    >
      <style>{`@keyframes blink { 50% { opacity: 0 } }`}</style>

      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
      }}>
        {bgParticles.map((p, i) => (
          <motion.div
            key={`bg-${i}`}
            initial={{ y: '110vh', opacity: 0 }}
            animate={{
              y: '-10vh',
              opacity: [0, 0.4, 0.4, 0],
            }}
            transition={{
              duration: p.duration,
              delay: p.delay,
              repeat: Infinity,
              ease: 'linear',
            }}
            style={{
              position: 'absolute',
              left: `${p.x}%`,
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: 'rgba(27, 61, 79, 0.15)',
            }}
          />
        ))}
      </div>

      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
      }}>
        {goldParticles.map((p, i) => (
          <motion.div
            key={i}
            initial={{
              x: p.startX,
              y: p.startY,
              opacity: 0,
              scale: 0,
            }}
            animate={{
              x: 0,
              y: 0,
              opacity: [0, 0.7, 0],
              scale: [0, 1, 0],
            }}
            transition={{
              duration: 0.8,
              delay: i * 0.015,
              ease: 'easeOut',
            }}
            style={{
              position: 'absolute',
              width: p.size,
              height: p.size,
              borderRadius: '50%',
              background: COLORS.gold,
            }}
          />
        ))}
      </div>

      <motion.img
        src="/logo.png"
        alt="بيت الإباء"
        initial={{ opacity: 0, scale: 0.7, filter: 'blur(8px)' }}
        animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }}
        transition={{
          duration: 0.8,
          delay: TIMINGS.logoStart / 1000,
          ease: 'easeOut',
        }}
        style={{
          width: logoSize,
          height: 'auto',
          position: 'relative',
          zIndex: 3,
        }}
      />

      <div style={{ position: 'relative', zIndex: 3 }}>
        <TypewriterText text={WELCOME_LINE_1} startDelay={TIMINGS.textStart} />
      </div>

      <AnimatePresence>
        {showLine2 && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.65, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{
              color: COLORS.navy,
              fontSize: isMobile ? 16 : 20,
              fontWeight: 300,
              marginTop: 10,
              textAlign: 'center',
              letterSpacing: 0.5,
              position: 'relative',
              zIndex: 3,
            }}
          >
            {WELCOME_LINE_2}
          </motion.p>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showCTA && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onComplete}
            style={{
              marginTop: 40,
              padding: '14px 48px',
              background: COLORS.navy,
              border: 'none',
              borderRadius: 999,
              color: '#fff',
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontFamily: 'inherit',
              position: 'relative',
              zIndex: 3,
              transition: 'background 0.3s, transform 0.2s, box-shadow 0.3s',
              boxShadow: '0 4px 20px rgba(27, 61, 79, 0.25)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = COLORS.navyDark
              e.currentTarget.style.transform = 'scale(1.05)'
              e.currentTarget.style.boxShadow = '0 6px 28px rgba(27, 61, 79, 0.4)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = COLORS.navy
              e.currentTarget.style.transform = 'scale(1)'
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(27, 61, 79, 0.25)'
            }}
          >
            {CTA_TEXT}
            <ArrowLeft size={18} />
          </motion.button>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
