import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import { AuthProvider } from './features/auth/context/AuthContext.jsx' // 👈 Importe aqui

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider> {/* 👈 Envolva o App */}
      <App />
    </AuthProvider>
  </StrictMode>,
)