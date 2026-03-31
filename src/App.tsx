import { useEffect, useState } from 'react'
import Dashboard from './components/dashboard/Dashboard'
import MeditationScreen from './components/meditation/MeditationScreen'
import SettingsPanel from './components/settings/SettingsPanel'
import OnboardingScreen from './components/onboarding/OnboardingScreen'

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
