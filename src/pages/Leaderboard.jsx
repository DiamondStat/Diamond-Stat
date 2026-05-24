import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Leaderboard() {
  const [leaders, setLeaders] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('swing')
  const [currentUser, setCurrentUser] = useState(null)

  const tabs = [
    { key: 'swing', label: 'Swing Score', icon: '⚾', color: '#E85D24', column: 'swing_score' },
    { key: 'command', label: 'Command Score', icon: '🎯', color: '#3FB950', column: 'command_score' },
    { key: 'fielding', label: 'Fielding Score', icon: '🧤', color: '#58A6FF', column: 'fielding_score' },
    { key: 'exitVelo', label: 'Exit Velocity', icon: '💨', color: '#F0883E', column: 'exit_velocity' },
    { key: 'pitchVelo', label: 'Pitch Velocity', icon: '🔥', color: '#A371F7', column: 'velocity' },
  ]

  useEffect(() => {
    const loadLeaderboard = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      setCurrentUser(user)

      const activeTabData = tabs.find(t => t.key === activeTab)
      const column = activeTabData.column

      const { data } = await supabase
        .from('sessions')
        .select(`user_id, ${column}`)
        .gt(column, 0)
        .order(column, { ascending: false })
        .limit(100)

      if (data) {
        // Get best score per user
        const bestPerUser = {}
        data.forEach(s => {
          if (!bestPerUser[s.user_id] || s[column] > bestPerUser[s.user_id]) {
            bestPerUser[s.user_id] = s[column]
          }
        })

        // Format leaderboard
        const formatted = Object.entries(bestPerUser)
          .map(([userId, score]) => ({ userId, score }))
          .sort((a, b) => b.score - a.score)
          .slice(0, 20)
          .map((entry, i) => ({
            ...entry,
            rank: i + 1,
            isCurrentUser: entry.userId === user?.id,
            name: entry.userId === user?.id
              ? localStorage.getItem('playerName') || 'You'
              : `Player ${entry.userId.slice(0, 4).toUpperCase()}`
          }))

        setLeaders(formatted)
      }
      setLoading(false)
    }
    loadLeaderboard()
  }, [activeTab])

  const activeTabData = tabs.find(t => t.key === activeTab)
  const unit = activeTab === 'exitVelo' || activeTab === 'pitchVelo' ? ' mph' : ''

  const getRankStyle = (rank) => {
    if (rank === 1) return { bg: '#FFD700', color: '#000', icon: '🥇' }
    if (rank === 2) return { bg: '#C0C0C0', color: '#000', icon: '🥈' }
    if (rank === 3) return { bg: '#CD7F32', color: '#fff', icon: '🥉' }
    return { bg: '#21262D', color: '#888', icon: `#${rank}` }
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#E85D24', fontSize: '32px', marginBottom: '4px' }}>Leaderboard</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '14px' }}>See how you rank against all DiamondStat players</p>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              background: activeTab === t.key ? t.color : '#161B22',
              color: activeTab === t.key ? '#fff' : '#888',
              fontSize: '13px', fontWeight: '600', fontFamily: 'Barlow, sans-serif',
              border: `1px solid ${activeTab === t.key ? t.color : '#21262D'}`,
              transition: 'all 0.2s ease'
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Top 3 podium */}
      {!loading && leaders.length >= 3 && (
        <div style={{ display: 'flex', gap: '12px', marginBottom: '1.5rem', alignItems: 'flex-end' }}>
          {/* 2nd place */}
          <div style={{ flex: 1, background: '#161B22', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: '1px solid #C0C0C033' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥈</div>
            <div style={{ color: '#C0C0C0', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{leaders[1]?.name}</div>
            <div style={{ color: '#C0C0C0', fontSize: '24px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif' }}>
              {leaders[1]?.score}{unit}
            </div>
          </div>
          {/* 1st place */}
          <div style={{ flex: 1, background: '#161B22', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #FFD70044', transform: 'scale(1.05)' }}>
            <div style={{ fontSize: '36px', marginBottom: '8px' }}>🥇</div>
            <div style={{ color: '#FFD700', fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>{leaders[0]?.name}</div>
            <div style={{ color: '#FFD700', fontSize: '28px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif' }}>
              {leaders[0]?.score}{unit}
            </div>
          </div>
          {/* 3rd place */}
          <div style={{ flex: 1, background: '#161B22', borderRadius: '12px', padding: '1.25rem', textAlign: 'center', border: '1px solid #CD7F3233' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>🥉</div>
            <div style={{ color: '#CD7F32', fontSize: '13px', fontWeight: '700', marginBottom: '4px' }}>{leaders[2]?.name}</div>
            <div style={{ color: '#CD7F32', fontSize: '24px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif' }}>
              {leaders[2]?.score}{unit}
            </div>
          </div>
        </div>
      )}

      {/* Full leaderboard */}
      <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', border: '1px solid #21262D' }}>
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '1rem' }}>
          {activeTabData.icon} {activeTabData.label} Rankings
        </div>

        {loading ? (
          <div style={{ color: '#888', fontSize: '14px', textAlign: 'center', padding: '2rem' }}>Loading leaderboard...</div>
        ) : leaders.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>🏆</div>
            <div style={{ color: '#888', fontSize: '15px', fontWeight: '600', marginBottom: '8px' }}>No scores yet</div>
            <div style={{ color: '#555', fontSize: '13px' }}>Be the first on the leaderboard! Complete an analysis to get ranked.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {leaders.map((player) => {
              const rankStyle = getRankStyle(player.rank)
              return (
                <div key={player.userId} style={{
                  display: 'flex', alignItems: 'center', gap: '14px',
                  padding: '12px 16px', borderRadius: '10px',
                  background: player.isCurrentUser ? `${activeTabData.color}15` : '#0D1117',
                  border: `1px solid ${player.isCurrentUser ? activeTabData.color + '44' : '#21262D'}`,
                  transition: 'all 0.2s ease'
                }}>
                  {/* Rank */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: rankStyle.bg, color: rankStyle.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: player.rank <= 3 ? '18px' : '12px',
                    fontWeight: '700', flexShrink: 0
                  }}>
                    {player.rank <= 3 ? rankStyle.icon : `#${player.rank}`}
                  </div>

                  {/* Name */}
                  <div style={{ flex: 1 }}>
                    <div style={{ color: player.isCurrentUser ? activeTabData.color : '#fff', fontSize: '14px', fontWeight: '600' }}>
                      {player.name} {player.isCurrentUser ? '← You' : ''}
                    </div>
                  </div>

                  {/* Score */}
                  <div style={{
                    color: player.rank === 1 ? '#FFD700' : player.isCurrentUser ? activeTabData.color : '#fff',
                    fontSize: '20px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif'
                  }}>
                    {player.score}{unit}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Your rank summary */}
      {!loading && leaders.length > 0 && (() => {
        const myEntry = leaders.find(l => l.isCurrentUser)
        if (!myEntry) return (
          <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.25rem', marginTop: '1rem', border: '1px solid #21262D', textAlign: 'center' }}>
            <div style={{ color: '#888', fontSize: '13px' }}>You're not ranked yet in this category. Complete an analysis to get on the board!</div>
          </div>
        )
        return (
          <div style={{ background: `${activeTabData.color}15`, borderRadius: '12px', padding: '1.25rem', marginTop: '1rem', border: `1px solid ${activeTabData.color}44`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: activeTabData.color, fontSize: '14px', fontWeight: '700' }}>Your Ranking</div>
              <div style={{ color: '#888', fontSize: '13px' }}>Keep training to move up the leaderboard!</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontSize: '28px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif' }}>
                #{myEntry.rank}
              </div>
              <div style={{ color: activeTabData.color, fontSize: '13px', fontWeight: '600' }}>{myEntry.score}{unit}</div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}

export default Leaderboard