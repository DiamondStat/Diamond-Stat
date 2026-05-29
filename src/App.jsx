import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from './supabase'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import SwingAnalyzer from './pages/SwingAnalyzer'
import PitchAnalyzer from './pages/PitchAnalyzer'
import FieldingAnalyzer from './pages/FieldingAnalyzer'
import CatchingAnalyzer from './pages/CatchingAnalyzer'
import Progress from './pages/Progress'
import Benchmarks from './pages/Benchmarks'
import Schedule from './pages/Schedule'
import Leaderboard from './pages/Leaderboard'
import Goals from './pages/Goals'
import RecruitingProfile from './pages/RecruitingProfile'
import VideoGenerator from './pages/VideoGenerator'
import Auth from './pages/Auth'

function Navbar({ user, onSignOut }) {
  const location = useLocation()
  const [openMenu, setOpenMenu] = useState(null)

  const navLink = (to, label, emoji) => {
    const active = location.pathname === to
    return (
      <Link to={to} style={{
        textDecoration: 'none', fontSize: '13px', fontWeight: '600',
        color: active ? '#fff' : '#888', padding: '7px 14px', borderRadius: '8px',
        background: active ? '#E85D24' : 'transparent',
        border: `1px solid ${active ? '#E85D24' : 'transparent'}`,
        transition: 'all 0.2s ease', display: 'flex', alignItems: 'center',
        gap: '6px', whiteSpace: 'nowrap'
      }}
        onMouseEnter={e => {
          if (!active) {
            e.currentTarget.style.background = 'rgba(232,93,36,0.1)'
            e.currentTarget.style.borderColor = 'rgba(232,93,36,0.3)'
            e.currentTarget.style.color = '#fff'
          }
        }}
        onMouseLeave={e => {
          if (!active) {
            e.currentTarget.style.background = 'transparent'
            e.currentTarget.style.borderColor = 'transparent'
            e.currentTarget.style.color = '#888'
          }
        }}
      >
        <span>{emoji}</span> {label}
      </Link>
    )
  }

  const dropdown = (key, label, emoji, items, activeRoutes) => {
    const isOpen = openMenu === key
    const active = activeRoutes.includes(location.pathname)
    return (
      <div style={{ position: 'relative' }}
        onMouseEnter={() => setOpenMenu(key)}
        onMouseLeave={() => setOpenMenu(null)}>
        <button style={{
          fontSize: '13px', fontWeight: '600',
          color: active ? '#fff' : '#888', padding: '7px 14px', borderRadius: '8px',
          background: active ? '#E85D24' : isOpen ? 'rgba(232,93,36,0.1)' : 'transparent',
          border: `1px solid ${active ? '#E85D24' : isOpen ? 'rgba(232,93,36,0.3)' : 'transparent'}`,
          transition: 'all 0.2s ease', display: 'flex', alignItems: 'center',
          gap: '6px', cursor: 'pointer', fontFamily: 'Barlow, sans-serif', whiteSpace: 'nowrap'
        }}>
          {emoji} {label} {isOpen ? '▲' : '▼'}
        </button>

        {isOpen && (
          <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '0px', paddingTop: '8px', zIndex: 200 }}>
            <div style={{
              background: '#161B22', border: '1px solid #21262D', borderRadius: '12px',
              padding: '8px', minWidth: '220px', boxShadow: '0 16px 48px rgba(0,0,0,0.5)',
            }}>
              {items.map(({ to, icon, label: itemLabel, desc }) => {
                const itemActive = location.pathname === to
                return (
                  <Link key={to} to={to} onClick={() => setOpenMenu(null)} style={{ textDecoration: 'none' }}>
                    <div style={{
                      display: 'flex', alignItems: 'center', gap: '12px',
                      padding: '10px 12px', borderRadius: '8px',
                      background: itemActive ? 'rgba(232,93,36,0.15)' : 'transparent',
                      transition: 'background 0.15s ease', cursor: 'pointer'
                    }}
                      onMouseEnter={e => { if (!itemActive) e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                      onMouseLeave={e => { if (!itemActive) e.currentTarget.style.background = 'transparent' }}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '8px',
                        background: itemActive ? 'rgba(232,93,36,0.2)' : '#21262D',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '18px', flexShrink: 0
                      }}>{icon}</div>
                      <div>
                        <div style={{ color: itemActive ? '#E85D24' : '#fff', fontSize: '13px', fontWeight: '600' }}>{itemLabel}</div>
                        <div style={{ color: '#555', fontSize: '12px' }}>{desc}</div>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    )
  }

  return (
    <div style={{
      background: 'rgba(22, 27, 34, 0.95)', backdropFilter: 'blur(12px)',
      padding: '0 2rem', display: 'flex', alignItems: 'center', gap: '4px',
      borderBottom: '1px solid #21262D', height: '64px', position: 'sticky', top: 0, zIndex: 100
    }}>
      <Link to="/" style={{ textDecoration: 'none', marginRight: '20px', flexShrink: 0 }}>
        <div style={{
          color: '#E85D24', fontSize: '22px', fontWeight: '800',
          fontFamily: 'Barlow Condensed, sans-serif', letterSpacing: '-0.5px',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          💎 DiamondStat
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '4px', alignItems: 'center', flex: 1 }}>
        {navLink('/', 'Dashboard', '🏠')}

        {dropdown('train', 'Training', '📋', [
          { to: '/profile', icon: '📋', label: 'My Plan', desc: 'AI personalized training plan' },
          { to: '/schedule', icon: '📅', label: 'Weekly Schedule', desc: 'Mon–Sun training schedule' },
          { to: '/goals', icon: '🎯', label: 'Goal Setting', desc: 'Set and track your targets' },
        ], ['/profile', '/schedule', '/goals'])}

        {dropdown('analyze', 'Analyzers', '🎮', [
          { to: '/swing', icon: '⚾', label: 'Swing Analyzer', desc: 'Analyze your hitting' },
          { to: '/pitch', icon: '🎯', label: 'Pitch Analyzer', desc: 'Analyze your pitching' },
          { to: '/fielding', icon: '🧤', label: 'Fielding Analyzer', desc: 'Analyze your fielding' },
          { to: '/catching', icon: '⚾', label: 'Catching Analyzer', desc: 'Analyze your catching' },
        ], ['/swing', '/pitch', '/fielding', '/catching'])}

        {dropdown('stats', 'Stats', '📊', [
          { to: '/progress', icon: '📈', label: 'Progress Tracker', desc: 'Track improvement over time' },
          { to: '/benchmarks', icon: '🏆', label: 'Benchmarks', desc: 'Compare to your age group' },
          { to: '/leaderboard', icon: '🥇', label: 'Leaderboard', desc: 'Rank against all players' },
        ], ['/progress', '/benchmarks', '/leaderboard'])}

        {dropdown('more', 'More', '⋯', [
          { to: '/recruiting', icon: '📄', label: 'Recruiting Profile', desc: 'Generate profile for coaches' },
          { to: '/videogenerator', icon: '🎬', label: 'Stats Video', desc: 'Download video with stats overlay' },
        ], ['/recruiting', '/videogenerator'])}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: 'auto' }}>
        <div style={{ color: '#555', fontSize: '12px' }}>{user?.email}</div>
        <button onClick={onSignOut} style={{
          padding: '6px 14px', background: 'transparent', border: '1px solid #21262D',
          borderRadius: '8px', color: '#888', fontSize: '13px', cursor: 'pointer',
          fontFamily: 'Barlow, sans-serif', fontWeight: '600'
        }}>
          Sign Out
        </button>
      </div>
    </div>
  )
}

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
  }

  if (loading) return (
    <div style={{
      height: '100vh', background: '#0D1117', display: 'flex',
      alignItems: 'center', justifyContent: 'center', color: '#888'
    }}>Loading...</div>
  )

  if (!user) return <Auth />

  return (
    <BrowserRouter>
      <Navbar user={user} onSignOut={handleSignOut} />
      <div style={{ minHeight: '100vh', background: '#0D1117' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/goals" element={<Goals />} />
          <Route path="/swing" element={<SwingAnalyzer />} />
          <Route path="/pitch" element={<PitchAnalyzer />} />
          <Route path="/fielding" element={<FieldingAnalyzer />} />
          <Route path="/catching" element={<CatchingAnalyzer />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/benchmarks" element={<Benchmarks />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/recruiting" element={<RecruitingProfile />} />
          <Route path="/videogenerator" element={<VideoGenerator />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}

export default App