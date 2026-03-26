import { useEffect, useState } from 'react'
import Dashboard from './components/dashboard/Dashboard'
import MeditationScreen from './components/meditation/MeditationScreen'
import SettingsPanel from './components/settings/SettingsPanel'

type Route = 'dashboard' | 'meditation' | 'settings'

function App() {
  const [route, setRoute] = useState<Route>('dashboard')

  useEffect(() => {
    const hash = window.location.hash.replace('#', '')
    if (hash === '/meditation') setRoute('meditation')
    else if (hash === '/settings') setRoute('settings')
    else setRoute('dashboard')
  }, [])

  // Meditation is always its own window, so it gets the full route
  if (route === 'meditation') return <MeditationScreen />

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
