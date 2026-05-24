import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const benchmarks = {
  swing: {
    label: 'Swing Score',
    icon: '⚾',
    color: '#E85D24',
    groups: [
      { label: 'Youth (8-12)', avg: 45, elite: 65 },
      { label: 'Middle School (13-14)', avg: 55, elite: 72 },
      { label: 'High School (15-18)', avg: 65, elite: 80 },
      { label: 'College', avg: 78, elite: 90 },
      { label: 'Pro', avg: 88, elite: 97 },
    ]
  },
  command: {
    label: 'Command Score',
    icon: '🎯',
    color: '#3FB950',
    groups: [
      { label: 'Youth (8-12)', avg: 40, elite: 60 },
      { label: 'Middle School (13-14)', avg: 52, elite: 68 },
      { label: 'High School (15-18)', avg: 62, elite: 78 },
      { label: 'College', avg: 75, elite: 88 },
      { label: 'Pro', avg: 85, elite: 96 },
    ]
  },
  fielding: {
    label: 'Fielding Score',
    icon: '🧤',
    color: '#58A6FF',
    groups: [
      { label: 'Youth (8-12)', avg: 42, elite: 62 },
      { label: 'Middle School (13-14)', avg: 54, elite: 70 },
      { label: 'High School (15-18)', avg: 64, elite: 79 },
      { label: 'College', avg: 76, elite: 89 },
      { label: 'Pro', avg: 87, elite: 96 },
    ]
  },
  exitVelo: {
    label: 'Exit Velocity (mph)',
    icon: '💨',
    color: '#F0883E',
    groups: [
      { label: 'Youth (8-12)', avg: 55, elite: 70 },
      { label: 'Middle School (13-14)', avg: 65, elite: 80 },
      { label: 'High School (15-18)', avg: 78, elite: 90 },
      { label: 'College', avg: 88, elite: 98 },
      { label: 'Pro', avg: 95, elite: 110 },
    ]
  },
  pitchVelo: {
    label: 'Pitch Velocity (mph)',
    icon: '🔥',
    color: '#A371F7',
    groups: [
      { label: 'Youth (8-12)', avg: 45, elite: 60 },
      { label: 'Middle School (13-14)', avg: 58, elite: 72 },
      { label: 'High School (15-18)', avg: 72, elite: 85 },
      { label: 'College', avg: 85, elite: 93 },
      { label: 'Pro', avg: 92, elite: 100 },
    ]
  }
}

function BenchmarkBar({ label, avg, elite, userScore, color, unit }) {
  const max = elite * 1.1
  const userPct = userScore ? Math.min((userScore / max) * 100, 100) : 0
  const avgPct = Math.min((avg / max) * 100, 100)
  const elitePct = Math.min((elite / max) * 100, 100)

  const getRank = () => {
    if (!userScore) return null
    if (userScore >= elite) return { label: 'Elite', color: '#F0883E' }
    if (userScore >= avg) return { label: 'Above Average', color: '#3FB950' }
    if (userScore >= avg - (avg * 0.1)) return { label: 'Average', color: '#888' }
    return { label: 'Below Average', color: '#F85149' }
  }

  const rank = getRank()

  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
        <span style={{ color: '#fff', fontSize: '13px', fontWeight: '600' }}>{label}</span>
        {rank && (
          <span style={{ color: rank.color, fontSize: '11px', fontWeight: '700', padding: '2px 8px', background: `${rank.color}18`, borderRadius: '99px' }}>
            {rank.label}
          </span>
        )}
      </div>
      <div style={{ position: 'relative', height: '10px', background: '#21262D', borderRadius: '99px', overflow: 'visible' }}>
        <div style={{ position: 'absolute', left: `${avgPct}%`, top: '-4px', width: '2px', height: '18px', background: '#888', borderRadius: '99px' }} />
        <div style={{ position: 'absolute', left: `${elitePct}%`, top: '-4px', width: '2px', height: '18px', background: '#F0883E', borderRadius: '99px' }} />
        {userScore > 0 && (
          <div style={{
            position: 'absolute', left: 0, top: 0,
            width: `${userPct}%`, height: '100%',
            background: color, borderRadius: '99px',
            opacity: 0.85, transition: 'width 1s ease'
          }} />
        )}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
        <span style={{ color: '#888', fontSize: '11px' }}>Avg: {avg}{unit}</span>
        <span style={{ color: '#F0883E', fontSize: '11px' }}>Elite: {elite}{unit}</span>
        {userScore > 0 && (
          <span style={{ color: color, fontSize: '11px', fontWeight: '700' }}>You: {userScore}{unit}</span>
        )}
      </div>
    </div>
  )
}

function Benchmarks() {
  const [userStats, setUserStats] = useState({
    swing: 0, command: 0, fielding: 0, exitVelo: 0, pitchVelo: 0
  })
  const [ageGroup, setAgeGroup] = useState('High School (15-18)')
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('swing')

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
          const exitVelos = data.filter(s => s.exit_velocity > 0)
          const pitchVelos = data.filter(s => s.velocity > 0)

          const avg = (arr, key) => arr.length > 0
            ? Math.round(arr.reduce((sum, s) => sum + s[key], 0) / arr.length)
            : 0

          setUserStats({
            swing: avg(swings, 'swing_score'),
            command: avg(pitches, 'command_score'),
            fielding: avg(fielding, 'fielding_score'),
            exitVelo: avg(exitVelos, 'exit_velocity'),
            pitchVelo: avg(pitchVelos, 'velocity'),
          })
        }
      }
      setLoading(false)
    }
    loadStats()
  }, [])

  const tabs = [
    { key: 'swing', label: 'Swing Score', icon: '⚾', unit: '' },
    { key: 'command', label: 'Command Score', icon: '🎯', unit: '' },
    { key: 'fielding', label: 'Fielding Score', icon: '🧤', unit: '' },
    { key: 'exitVelo', label: 'Exit Velocity', icon: '💨', unit: ' mph' },
    { key: 'pitchVelo', label: 'Pitch Velocity', icon: '🔥', unit: ' mph' },
  ]

  const current = benchmarks[activeTab]
  const activeTabData = tabs.find(t => t.key === activeTab)
  const unit = activeTabData?.unit || ''

  const getUserScore = () => {
    if (activeTab === 'swing') return userStats.swing
    if (activeTab === 'command') return userStats.command
    if (activeTab === 'fielding') return userStats.fielding
    if (activeTab === 'exitVelo') return userStats.exitVelo
    if (activeTab === 'pitchVelo') return userStats.pitchVelo
    return 0
  }

  const userScore = getUserScore()
  const selectedGroup = current.groups.find(g => g.label === ageGroup) || current.groups[2]

  const overallRank = () => {
    if (!userScore) return null
    if (userScore >= selectedGroup.elite) return { label: '🔥 Elite Level', color: '#F0883E', desc: `You are performing at or above the elite level for ${ageGroup} players!` }
    if (userScore >= selectedGroup.avg) return { label: '✅ Above Average', color: '#3FB950', desc: `You are above average for ${ageGroup} players. Keep pushing!` }
    if (userScore >= selectedGroup.avg * 0.9) return { label: '📊 Average', color: '#888', desc: `You are right at the average for ${ageGroup} players. Focus on your weak spots to move up.` }
    return { label: '📈 Below Average', color: '#F85149', desc: `You have room to grow compared to ${ageGroup} players. Use your training plan to improve!` }
  }

  const rank = overallRank()

  if (loading) return (
    <div style={{ padding: '2rem', color: '#888', fontSize: '14px' }}>Loading your benchmarks...</div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ color: '#E85D24', fontSize: '32px', marginBottom: '4px' }}>Age Group Benchmarks</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '14px' }}>See how you compare to players your age, college athletes, and pros</p>

      {/* Age group selector */}
      <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #21262D' }}>
        <div style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Select your age group</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {benchmarks.swing.groups.map(g => (
            <button key={g.label} onClick={() => setAgeGroup(g.label)}
              style={{
                padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
                background: ageGroup === g.label ? '#E85D24' : '#21262D',
                color: ageGroup === g.label ? '#fff' : '#888',
                fontSize: '13px', fontWeight: '600', fontFamily: 'Barlow, sans-serif',
                border: `1px solid ${ageGroup === g.label ? '#E85D24' : '#21262D'}`,
                transition: 'all 0.2s ease'
              }}>
              {g.label}
            </button>
          ))}
        </div>
      </div>

      {/* Rank card */}
      {rank && (
        <div style={{
          background: `${rank.color}18`, border: `1px solid ${rank.color}44`,
          borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem',
          display: 'flex', gap: '16px', alignItems: 'center'
        }}>
          <div style={{ fontSize: '40px' }}>🏆</div>
          <div>
            <div style={{ color: rank.color, fontSize: '20px', fontWeight: '800', marginBottom: '4px' }}>{rank.label}</div>
            <div style={{ color: '#aaa', fontSize: '13px', lineHeight: '1.6' }}>{rank.desc}</div>
          </div>
        </div>
      )}

      {!userScore && (
        <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '32px', marginBottom: '8px' }}>📊</div>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: '600', marginBottom: '4px' }}>No data yet for this category</div>
          <div style={{ color: '#888', fontSize: '13px' }}>Complete an analysis and enter your velocity to see how you compare!</div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
        {tabs.map(t => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            style={{
              padding: '8px 14px', borderRadius: '8px', cursor: 'pointer',
              background: activeTab === t.key ? '#E85D24' : '#161B22',
              color: activeTab === t.key ? '#fff' : '#888',
              fontSize: '13px', fontWeight: '600', fontFamily: 'Barlow, sans-serif',
              border: `1px solid ${activeTab === t.key ? '#E85D24' : '#21262D'}`,
              transition: 'all 0.2s ease'
            }}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Benchmark bars */}
      <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #21262D' }}>
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '6px' }}>
          {current.icon} {current.label} — All Age Groups
        </div>
        <div style={{ color: '#555', fontSize: '12px', marginBottom: '20px' }}>
          Gray line = average · Orange line = elite · Colored bar = your score
        </div>
        {current.groups.map(g => (
          <BenchmarkBar
            key={g.label}
            label={g.label}
            avg={g.avg}
            elite={g.elite}
            userScore={userScore}
            color={current.color}
            unit={unit}
          />
        ))}
      </div>

      {/* Your stats summary */}
      <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #21262D' }}>
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '1rem' }}>📊 Your Stats Summary</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Swing Score', value: userStats.swing, unit: '', color: '#E85D24', icon: '⚾' },
            { label: 'Command Score', value: userStats.command, unit: '', color: '#3FB950', icon: '🎯' },
            { label: 'Fielding Score', value: userStats.fielding, unit: '', color: '#58A6FF', icon: '🧤' },
            { label: 'Exit Velocity', value: userStats.exitVelo, unit: ' mph', color: '#F0883E', icon: '💨' },
            { label: 'Pitch Velocity', value: userStats.pitchVelo, unit: ' mph', color: '#A371F7', icon: '🔥' },
          ].map(({ label, value, unit, color, icon }) => (
            <div key={label} style={{ background: '#0D1117', borderRadius: '10px', padding: '1rem', border: '1px solid #21262D' }}>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>{icon} {label}</div>
              <div style={{ color: value > 0 ? color : '#333', fontSize: '28px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif' }}>
                {value > 0 ? `${value}${unit}` : '—'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* College comparison */}
      <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', border: '1px solid #21262D' }}>
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>🎓 College Athlete Comparison</div>
        <div style={{ color: '#555', fontSize: '13px', marginBottom: '1.5rem' }}>How close are you to a college level player?</div>

        {tabs.map(({ key, icon, label, unit }) => {
          const b = benchmarks[key]
          const college = b.groups[3]
          const score = key === 'swing' ? userStats.swing
            : key === 'command' ? userStats.command
            : key === 'fielding' ? userStats.fielding
            : key === 'exitVelo' ? userStats.exitVelo
            : userStats.pitchVelo
          const gap = Math.round(college.avg - score)
          const pct = Math.min(Math.round((score / college.avg) * 100), 100)

          return (
            <div key={key} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ color: '#888', fontSize: '13px' }}>{icon} {label}</span>
                <span style={{ color: b.color, fontSize: '13px', fontWeight: '700' }}>
                  {score > 0 ? `${pct}% of college avg` : 'No data yet'}
                </span>
              </div>
              <div style={{ height: '8px', background: '#21262D', borderRadius: '99px', overflow: 'hidden' }}>
                <div style={{
                  height: '100%', width: `${score > 0 ? pct : 0}%`,
                  background: b.color, borderRadius: '99px', transition: 'width 1s ease'
                }} />
              </div>
              {score > 0 && gap > 0 && (
                <div style={{ color: '#555', fontSize: '12px', marginTop: '4px' }}>
                  {gap}{unit} away from college average ({college.avg}{unit})
                </div>
              )}
              {score > 0 && gap <= 0 && (
                <div style={{ color: '#3FB950', fontSize: '12px', marginTop: '4px' }}>
                  🎉 You are at or above the college average!
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Benchmarks