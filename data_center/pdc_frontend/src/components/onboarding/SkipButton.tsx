import { motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

const STYLES = {
  button: {
    position: 'fixed' as const,
    top: 24,
    left: 24,
    zIndex: 10040,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '10px 20px',
    maxWidth: 'fit-content',
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    WebkitBackdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.2)',
    borderRadius: 999,
    color: '#fff',
    fontSize: 14,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: 'inherit',
  },
}

interface SkipButtonProps {
  onClick: () => void
}

export default function SkipButton({ onClick }: SkipButtonProps) {
  return (
    <motion.button
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5, duration: 0.4 }}
      style={STYLES.button}
      onClick={onClick}
      aria-label="تخطي"
    >
      <ChevronLeft size={16} />
      تخطي
    </motion.button>
  )
}
