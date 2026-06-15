import React, { useState } from 'react'
import Login from './Login'
import Workspace from './Workspace'

function App() {
  // In the future, this state will be checked against your secure tokens
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  const handleGoogleLogin = () => {
    console.log("Triggering Google OAuth via IPC Bridge...")
    
    // Define the target URL (eventually your Node backend auth URL)
    const authUrl = 'https://google.com'
    
    // Trigger the desktop bridge
    if (window.electronAPI) {
      window.electronAPI.openAuthLink(authUrl)
    } else {
      // Fallback if testing in a standard web browser environment
      window.open(authUrl, '_blank')
    }
  }

  // If they aren't logged in, show the Login screen. If they are, show the Workspace.
  return isAuthenticated ? (
    <Workspace />
  ) : (
    <Login onLogin={handleGoogleLogin} />
  )
}

export default App