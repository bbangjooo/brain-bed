import { useEffect, useState } from 'react'
import Dashboard from './components/dashboard/Dashboard'
import MeditationScreen from './components/meditation/MeditationScreen'
import SettingsPanel from './components/settings/SettingsPanel'
import OnboardingScreen from './components/onboarding/OnboardingScreen'
import { track } from './analytics'

type Route = 'dashboard' | 'meditation' | 'settings' | 'onboarding'

function App() {
  const [route, setRoute] = useState<Route>('dashboard')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash === '/meditation') setRoute('meditation')
    else if (hash === '/settings') setRoute('settings')
    else if (hash === '/onboarding') setRoute('onboarding')
    else setRoute('dashboard')
  }, [])

  // Forward analytics events from main process
  useEffect(() => {
    const unsub = window.electronAPI?.onAnalyticsTrack((data) => {
      track(data.event as any, data.properties as any)
    })
    return () => unsub?.()
  }, [])

  if (route === 'meditation') return <MeditationScreen />
  if (route === 'onboarding') return <OnboardingScreen />

  // Dashboard and Settings share the main window
  return (
    <div className="h-full">
      {route === 'settings' ? (
        <SettingsPanel onBack={() => setRoute('dashboard')} />
      ) : (
        <Dashboard onNavigate={setRoute} />
      )}
    </div>
  )
}

export default App
