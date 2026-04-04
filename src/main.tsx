import React from 'react'
import ReactDOM from 'react-dom/client'
import * as amplitude from '@amplitude/unified'
import App from './App'
import './styles/globals.css'

amplitude.initAll('874a0f06996069ced2020914719cc7e9', {
  analytics: { autocapture: true },
  sessionReplay: { sampleRate: 1 },
})

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
