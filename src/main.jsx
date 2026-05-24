import { StrictMode, useState, useEffect } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

function LoadingScreen() {
  return (
    <div style={{
      height: '100vh', background: '#0D1117',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: '24px'
    }}>

      {/* Diamond on top */}
      <div style={{ fontSize: '64px', animation: 'pulse 2s ease-in-out infinite' }}>💎</div>

      <div style={{
        color: '#E85D24', fontSize: '36px', fontWeight: '800',
        fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '-1px'
      }}>
        DiamondStat
      </div>

      <div style={{ color: '#888', fontSize: '14px' }}>Loading your training data...</div>

      {/* Bar + baseball connected */}
      <div style={{
        width: '220px', position: 'relative', height: '24px', marginTop: '8px'
      }}>
        {/* Gray track */}
        <div style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          left: 0, right: 0, height: '4px',
          background: '#21262D', borderRadius: '99px'
        }} />

        {/* Orange bar that grows from left */}
        <div style={{
          position: 'absolute', top: '50%', transform: 'translateY(-50%)',
          left: 0, height: '4px',
          background: '#E85D24', borderRadius: '99px',
          animation: 'grow 1.6s ease-in-out infinite'
        }} />

        {/* Baseball sitting right on the bar end */}
        <div style={{
          position: 'absolute',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          fontSize: '20px',
          lineHeight: '1',
          animation: 'slide 1.6s ease-in-out infinite'
        }}>⚾</div>
      </div>

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1); }
          50%  { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes grow {
          0%   { width: 0px; }
          50%  { width: 210px; }
          100% { width: 0px; }
        }
        @keyframes slide {
          0%   { left: 0px; }
          50%  { left: 210px; }
          100% { left: 0px; }
        }
      `}</style>
    </div>
  )
}

function Root() {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2200)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <LoadingScreen />
  return (
    <StrictMode>
      <App />
    </StrictMode>
  )
}

createRoot(document.getElementById('root')).render(<Root />)