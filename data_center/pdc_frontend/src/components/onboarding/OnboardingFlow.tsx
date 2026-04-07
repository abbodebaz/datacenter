import { useState, useCallback, useEffect } from 'react'
import { AnimatePresence } from 'framer-motion'
import SplashScreen from './SplashScreen'
import CinematicTour from './CinematicTour'
import WelcomeTransition from './WelcomeTransition'

const ONBOARDING_KEY = 'baytalebaa_onboarding_seen'

type Stage = 'splash' | 'tour' | 'welcome' | 'exiting'

export function hasSeenOnboarding(): boolean {
  try {
    return localStorage.getItem(ONBOARDING_KEY) === 'true'
  } catch {
    return false
  }
}

export function resetOnboarding(): void {
  try {
    localStorage.removeItem(ONBOARDING_KEY)
    window.location.reload()
  } catch {}
}

function markOnboardingSeen(): void {
  try {
    localStorage.setItem(ONBOARDING_KEY, 'true')
  } catch {}
}

const prefersReducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches

interface OnboardingFlowProps {
  onComplete: () => void
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [stage, setStage] = useState<Stage>(
    prefersReducedMotion ? 'welcome' : 'splash'
  )

  const goToTour = useCallback(() => setStage('tour'), [])
  const goToWelcome = useCallback(() => setStage('welcome'), [])

  const finish = useCallback(() => {
    markOnboardingSeen()
    setStage('exiting')
  }, [])

  const handleExitComplete = useCallback(() => {
    if (stage === 'exiting') {
      onComplete()
    }
  }, [stage, onComplete])

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && stage === 'splash') {
        finish()
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [stage, finish])

  return (
    <AnimatePresence mode="wait" onExitComplete={handleExitComplete}>
      {stage === 'splash' && <SplashScreen key="splash" onNext={goToTour} />}
      {stage === 'tour' && <CinematicTour key="tour" onNext={goToWelcome} />}
      {stage === 'welcome' && <WelcomeTransition key="welcome" onComplete={finish} />}
    </AnimatePresence>
  )
}
