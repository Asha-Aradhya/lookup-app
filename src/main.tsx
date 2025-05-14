import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.scss'
import App from './App.tsx'
import ErrorHandler from './components/ErrorHandler/ErrorHandler.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorHandler>
      <App />
    </ErrorHandler>
  </StrictMode>,
)
