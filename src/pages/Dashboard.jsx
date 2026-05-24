import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Dashboard() {
  const [stats, setStats] = useState({
    avgSwingScore: null,
    avgCommandScore: null,
    avgFieldingScore: null,
    totalSessions: 0,
    topSwingScore: null,
  })
  const [name, setName] = useState(localStorage.getItem('playerName') || 'Player')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadStats = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)

        if (data && data.length > 0) {
          const swings = data.filter(s => s.swing_score > 0)
          const pitches = data.filter(s => s.command_score > 0)
          const fielding = data.filter(s => s.fielding_score > 0)

          const avg = (arr, key) => arr.length > 0
            ? Math.round(arr.reduce((sum, s) => sum + s[key], 0) / arr.length)
            : null

          const max = (arr, key) => arr.length > 0
            ? Math.max(...arr.map(s => s[key]))
            : null

          setStats({
            avgSwingScore: avg(swings, 'swing_score'),
            avgCommandScore: avg(pitches, 'command_score'),
            avgFieldingScore: avg(fielding, 'fielding_score'),
            totalSessions: data.length,
            topSwingScore: max(swings, 'swing_score'),
          })
        }
      }
      setLoading(false)
    }
    loadStats()
  }, [])

  const statCard = (label, value, unit, color, icon) => (
    <div className="card fade-in" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ color: '#888', fontSize: '13px', fontWeight: '500' }}>{label}</div>
        <div style={{ fontSize: '20px' }}>{icon}</div>
      </div>
      <div style={{
        color: value !== null ? color : '#333',
        fontSize: '38px', fontWeight: '800',
        fontFamily: 'Barlow Condensed, sans-serif', lineHeight: 1
      }}>
        {value !== null ? value : '—'}
      </div>
      <div style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>
        {value !== null ? unit : 'No data yet'}
      </div>
    </div>
  )

  const analyzerCard = (to, icon, title, desc, color) => (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="card fade-in" style={{
        padding: '1.5rem', cursor: 'pointer', height: '100%',
        transition: 'all 0.25s ease'
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = color
          e.currentTarget.style.transform = 'translateY(-3px)'
          e.currentTarget.style.boxShadow = `0 8px 30px ${color}22`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = '#21262D'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        <div style={{
          width: '44px', height: '44px', borderRadius: '10px',
          background: `${color}18`, display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '22px', marginBottom: '12px',
          border: `1px solid ${color}33`
        }}>{icon}</div>
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>{title}</div>
        <div style={{ color: '#666', fontSize: '13px', lineHeight: '1.5' }}>{desc}</div>
        <div style={{ color: color, fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>
          Open Analyzer →
        </div>
      </div>
    </Link>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1100px', margin: '0 auto' }}>

      {/* Header */}
      <div className="fade-in" style={{ marginBottom: '2rem' }}>
        <div style={{ color: '#888', fontSize: '14px', marginBottom: '4px' }}>Good day,</div>
        <h1 style={{ fontSize: '36px', color: '#fff' }}>
          Welcome back, <span style={{ color: '#E85D24' }}>{name}</span> 👋
        </h1>
        <p style={{ color: '#555', fontSize: '14px', marginTop: '4px' }}>Here's your DiamondStat training overview</p>
      </div>

      {/* Stats */}
      {loading ? (
        <div style={{ color: '#555', fontSize: '14px', marginBottom: '2rem' }}>Loading your stats...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '2rem' }}>
          {statCard('Avg Swing Score', stats.avgSwingScore, 'out of 100', '#E85D24', '⚾')}
          {statCard('Total Sessions', stats.totalSessions || null, 'sessions logged', '#fff', '📅')}
          {statCard('Top Swing Score', stats.topSwingScore, 'personal best', '#3FB950', '🏆')}
          {statCard('Avg Command Score', stats.avgCommandScore, 'out of 100', '#58A6FF', '🎯')}
        </div>
      )}

      {/* No data message */}
      {!loading && stats.totalSessions === 0 && (
        <div style={{
          background: '#161B22', border: '1px solid #21262D', borderRadius: '12px',
          padding: '1.5rem', marginBottom: '2rem', textAlign: 'center'
        }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '4px' }}>No stats yet</div>
          <div style={{ color: '#888', fontSize: '13px' }}>Complete your first analysis below to start tracking your progress!</div>
        </div>
      )}

      {/* Analyzers */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ color: '#555', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          Analyzers
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {analyzerCard('/swing', '⚾', 'Swing Analyzer', 'Upload a hitting video and get instant AI feedback on your mechanics', '#E85D24')}
          {analyzerCard('/pitch', '🎯', 'Pitch Analyzer', 'Upload a pitching video and get AI feedback on velocity and delivery', '#3FB950')}
          {analyzerCard('/fielding', '🧤', 'Fielding Analyzer', 'Upload a fielding video and get AI feedback on your technique', '#58A6FF')}
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '2rem' }}>
        <Link to="/profile" style={{ textDecoration: 'none' }}>
          <div style={{
            background: 'linear-gradient(135deg, #E85D24, #FF7F4F)',
            borderRadius: '14px', padding: '1.5rem', cursor: 'pointer',
            transition: 'all 0.25s ease', border: '1px solid #E85D24'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 8px 30px #E85D2444'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📋</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>My Training Plan</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '13px', lineHeight: '1.5' }}>
              View your personalized AI hitting, pitching and fielding plan
            </div>
            <div style={{ color: '#fff', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>View Plan →</div>
          </div>
        </Link>

        <Link to="/progress" style={{ textDecoration: 'none' }}>
          <div className="card" style={{
            padding: '1.5rem', cursor: 'pointer', transition: 'all 0.25s ease'
          }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#58A6FF'
              e.currentTarget.style.transform = 'translateY(-3px)'
              e.currentTarget.style.boxShadow = '0 8px 30px #58A6FF22'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = '#21262D'
              e.currentTarget.style.transform = 'translateY(0)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          >
            <div style={{ fontSize: '28px', marginBottom: '10px' }}>📈</div>
            <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '6px' }}>Progress Tracker</div>
            <div style={{ color: '#555', fontSize: '13px', lineHeight: '1.5' }}>
              See your improvement over time across all skills
            </div>
            <div style={{ color: '#58A6FF', fontSize: '13px', fontWeight: '600', marginTop: '12px' }}>View Progress →</div>
          </div>
        </Link>
      </div>

      {/* Daily tips */}
      <div>
        <div style={{ color: '#555', fontSize: '12px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
          Daily Tips
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { tip: 'Keep your hands inside the ball and drive through the hitting zone to maximize exit velocity.', label: 'Hitting', color: '#E85D24' },
            { tip: 'Focus on hip-to-shoulder separation in your windup — this is the #1 source of velocity.', label: 'Pitching', color: '#3FB950' },
            { tip: 'Get your glove down early and field ground balls out in front of your body.', label: 'Fielding', color: '#58A6FF' },
          ].map(({ tip, label, color }) => (
            <div key={label} className="card fade-in" style={{
              padding: '1rem 1.25rem', borderLeft: `3px solid ${color}`,
              display: 'flex', gap: '14px', alignItems: 'flex-start'
            }}>
              <div style={{
                background: `${color}18`, borderRadius: '6px', padding: '4px 10px',
                color: color, fontSize: '11px', fontWeight: '700',
                textTransform: 'uppercase', letterSpacing: '0.06em', flexShrink: 0, marginTop: '1px'
              }}>{label}</div>
              <div style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6' }}>{tip}</div>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}

export default Dashboard