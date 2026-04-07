import { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'

const COLORS = {
  navyDark: '#0F2530',
  navy: '#1B3D4F',
  tealLight: '#2A5A75',
}

const TAGLINE = 'حيث يبدأ كل تفصيل'
const CTA_TEXT = 'ادخل الكتالوج'
const CTA_DELAY_MS = 2000
const BUBBLE_COUNT = 25
const LOGO_SIZE_DESKTOP = 160
const LOGO_SIZE_MOBILE = 110

interface SplashScreenProps {
  onNext: () => void
}

function Bubble({ index }: { index: number }) {
  const style = useMemo(() => {
    const size = 4 + Math.random() * 10
    const left = Math.random() * 100
    const duration = 18 + Math.random() * 14
    const delay = Math.random() * 10
    return {
      position: 'absolute' as const,
      width: size,
      height: size,
      borderRadius: '50%',
      background: COLORS.tealLight,
      opacity: 0.45 + Math.random() * 0.1,
      left: `${left}%`,
      bottom: -20,
      animation: `bubbleFloat ${duration}s ${delay}s linear infinite`,
    }
  }, [index])

  return <div style={style} />
}

export default function SplashScreen({ onNext }: SplashScreenProps) {
  const [showCTA, setShowCTA] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setShowCTA(true), CTA_DELAY_MS)
    return () => clearTimeout(t)
  }, [])

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640
  const logoSize = isMobile ? LOGO_SIZE_MOBILE : LOGO_SIZE_DESKTOP

  return (
    <motion.div
      key="splash"
      initial={{ opacity: 1 }}
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
        backgroundImage: "url('/images/storefront.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(180deg, rgba(15,37,48,0.85) 0%, rgba(27,61,79,0.93) 100%)',
          zIndex: 0,
        }}
      />

      <style>{`
        @keyframes bubbleFloat {
          0%   { transform: translateY(0) translateX(0); opacity: 0; }
          10%  { opacity: 0.5; }
          90%  { opacity: 0.35; }
          100% { transform: translateY(-110vh) translateX(${20 - Math.random() * 40}px); opacity: 0; }
        }
      `}</style>

      {Array.from({ length: BUBBLE_COUNT }).map((_, i) => (
        <Bubble key={i} index={i} />
      ))}

      <motion.img
        src="/logo.png"
        alt="بيت الإباء"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        style={{
          width: logoSize,
          height: 'auto',
          filter: 'brightness(0) invert(1)',
          marginBottom: 8,
          position: 'relative',
          zIndex: 1,
        }}
      />

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 0.95, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
        style={{
          color: 'rgba(255, 255, 255, 0.95)',
          fontSize: isMobile ? 20 : 26,
          fontWeight: 500,
          fontFamily: "var(--font-arabic, '29LT Bukra', 'Readex Pro', sans-serif)",
          marginTop: 20,
          letterSpacing: '0.02em',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {TAGLINE}
      </motion.p>

      <AnimatePresence>
        {showCTA && (
          <motion.button
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            onClick={onNext}
            style={{
              marginTop: 40,
              padding: '14px 36px',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '1.5px solid rgba(255,255,255,0.3)',
              borderRadius: 9999,
              color: '#fff',
              fontSize: 16,
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              position: 'relative',
              zIndex: 1,
              fontFamily: 'inherit',
              transition: 'all 0.3s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.2)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
              e.currentTarget.style.transform = 'translateY(-1px)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
              e.currentTarget.style.transform = 'translateY(0)'
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
