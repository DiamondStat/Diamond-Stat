import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

function Goals() {
  const [goals, setGoals] = useState([])
  const [userStats, setUserStats] = useState({})
  const [loading, setLoading] = useState(true)
  const [newGoal, setNewGoal] = useState({ metric: '', target: '', deadline: '' })
  const [adding, setAdding] = useState(false)

  const metricOptions = [
    { key: 'swing_score', label: 'Swing Score', icon: '⚾', color: '#E85D24', unit: '' },
    { key: 'command_score', label: 'Command Score', icon: '🎯', color: '#3FB950', unit: '' },
    { key: 'fielding_score', label: 'Fielding Score', icon: '🧤', color: '#58A6FF', unit: '' },
    { key: 'exit_velocity', label: 'Exit Velocity', icon: '💨', color: '#F0883E', unit: ' mph' },
    { key: 'velocity', label: 'Pitch Velocity', icon: '🔥', color: '#A371F7', unit: ' mph' },
  ]

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Load sessions for current stats
        const { data: sessions } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)

        if (sessions && sessions.length > 0) {
          const avg = (arr, key) => {
            const valid = arr.filter(s => s[key] > 0)
            return valid.length > 0 ? Math.round(valid.reduce((sum, s) => sum + s[key], 0) / valid.length) : 0
          }
          setUserStats({
            swing_score: avg(sessions, 'swing_score'),
            command_score: avg(sessions, 'command_score'),
            fielding_score: avg(sessions, 'fielding_score'),
            exit_velocity: avg(sessions, 'exit_velocity'),
            velocity: avg(sessions, 'velocity'),
          })
        }

        // Load saved goals
        const saved = localStorage.getItem(`goals_${user.id}`)
        if (saved) setGoals(JSON.parse(saved))
      }
      setLoading(false)
    }
    load()
  }, [])

  const saveGoals = async (updated) => {
    const { data: { user } } = await supabase.auth.getUser()
    if (user) localStorage.setItem(`goals_${user.id}`, JSON.stringify(updated))
    setGoals(updated)
  }

  const addGoal = async () => {
    if (!newGoal.metric || !newGoal.target) return
    const metric = metricOptions.find(m => m.key === newGoal.metric)
    const current = userStats[newGoal.metric] || 0
    const goal = {
      id: Date.now(),
      metric: newGoal.metric,
      label: metric.label,
      icon: metric.icon,
      color: metric.color,
      unit: metric.unit,
      target: parseFloat(newGoal.target),
      current,
      deadline: newGoal.deadline,
      createdAt: new Date().toISOString(),
      achieved: false,
    }
    const updated = [...goals, goal]
    await saveGoals(updated)
    setNewGoal({ metric: '', target: '', deadline: '' })
    setAdding(false)
  }

  const deleteGoal = async (id) => {
    const updated = goals.filter(g => g.id !== id)
    await saveGoals(updated)
  }

  const getProgress = (goal) => {
    const current = userStats[goal.metric] || goal.current
    const pct = Math.min(Math.round((current / goal.target) * 100), 100)
    return { current, pct }
  }

  const getDaysLeft = (deadline) => {
    if (!deadline) return null
    const diff = Math.ceil((new Date(deadline) - new Date()) / (1000 * 60 * 60 * 24))
    return diff
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#0D1117',
    border: '1px solid #21262D', borderRadius: '8px', color: 'white',
    fontSize: '14px', fontFamily: 'Barlow, sans-serif'
  }

  if (loading) return (
    <div style={{ padding: '2rem', color: '#888', fontSize: '14px' }}>Loading your goals...</div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#E85D24', fontSize: '32px', marginBottom: '4px' }}>Goal Setting</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '14px' }}>Set targets and track your journey to reaching them</p>

      {/* Current stats */}
      <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #21262D' }}>
        <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Your Current Stats</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '10px' }}>
          {metricOptions.map(({ key, label, icon, color, unit }) => (
            <div key={key} style={{ background: '#0D1117', borderRadius: '8px', padding: '10px', textAlign: 'center', border: '1px solid #21262D' }}>
              <div style={{ fontSize: '18px', marginBottom: '4px' }}>{icon}</div>
              <div style={{ color: userStats[key] > 0 ? color : '#333', fontSize: '20px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif' }}>
                {userStats[key] > 0 ? `${userStats[key]}${unit}` : '—'}
              </div>
              <div style={{ color: '#555', fontSize: '11px', marginTop: '2px' }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Add goal button */}
      {!adding && (
        <button onClick={() => setAdding(true)}
          style={{
            width: '100%', padding: '14px', background: '#E85D24',
            border: 'none', borderRadius: '10px', color: 'white',
            fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            fontFamily: 'Barlow, sans-serif', marginBottom: '1.5rem'
          }}>
          + Set New Goal
        </button>
      )}

      {/* Add goal form */}
      {adding && (
        <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #E85D2444' }}>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>New Goal</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <div>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>Metric</div>
              <select style={inputStyle} value={newGoal.metric} onChange={e => setNewGoal(p => ({ ...p, metric: e.target.value }))}>
                <option value="">Select metric</option>
                {metricOptions.map(m => (
                  <option key={m.key} value={m.key}>{m.icon} {m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>Target</div>
              <input style={inputStyle} type="number" placeholder="e.g. 85"
                value={newGoal.target} onChange={e => setNewGoal(p => ({ ...p, target: e.target.value }))} />
            </div>
            <div>
              <div style={{ color: '#888', fontSize: '12px', marginBottom: '6px' }}>Deadline (optional)</div>
              <input style={inputStyle} type="date"
                value={newGoal.deadline} onChange={e => setNewGoal(p => ({ ...p, deadline: e.target.value }))} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={addGoal}
              style={{
                padding: '10px 24px', background: '#E85D24', border: 'none',
                borderRadius: '8px', color: 'white', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'Barlow, sans-serif'
              }}>
              Save Goal
            </button>
            <button onClick={() => setAdding(false)}
              style={{
                padding: '10px 24px', background: 'transparent', border: '1px solid #21262D',
                borderRadius: '8px', color: '#888', fontSize: '14px',
                fontWeight: '600', cursor: 'pointer', fontFamily: 'Barlow, sans-serif'
              }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Goals list */}
      {goals.length === 0 ? (
        <div style={{ background: '#161B22', borderRadius: '12px', padding: '3rem', textAlign: 'center', border: '1px solid #21262D' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>🎯</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>No goals yet</div>
          <div style={{ color: '#555', fontSize: '13px' }}>Set your first goal above to start tracking your journey!</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {goals.map(goal => {
            const { current, pct } = getProgress(goal)
            const daysLeft = getDaysLeft(goal.deadline)
            const achieved = pct >= 100

            return (
              <div key={goal.id} style={{
                background: '#161B22', borderRadius: '12px', padding: '1.5rem',
                border: `1px solid ${achieved ? '#3FB95044' : '#21262D'}`,
                borderLeft: `4px solid ${achieved ? '#3FB950' : goal.color}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div style={{ fontSize: '24px' }}>{goal.icon}</div>
                    <div>
                      <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700' }}>{goal.label}</div>
                      {goal.deadline && (
                        <div style={{ color: daysLeft < 7 ? '#F85149' : '#888', fontSize: '12px', marginTop: '2px' }}>
                          {daysLeft > 0 ? `${daysLeft} days left` : daysLeft === 0 ? 'Due today!' : 'Deadline passed'}
                        </div>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    {achieved && (
                      <span style={{ background: '#3FB95022', border: '1px solid #3FB950', borderRadius: '99px', padding: '4px 12px', color: '#3FB950', fontSize: '12px', fontWeight: '700' }}>
                        🎉 Achieved!
                      </span>
                    )}
                    <button onClick={() => deleteGoal(goal.id)}
                      style={{ background: 'transparent', border: 'none', color: '#555', fontSize: '18px', cursor: 'pointer' }}>
                      ×
                    </button>
                  </div>
                </div>

                {/* Progress bar */}
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ height: '10px', background: '#21262D', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%', width: `${pct}%`,
                      background: achieved ? '#3FB950' : goal.color,
                      borderRadius: '99px', transition: 'width 1s ease'
                    }} />
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: '#888', fontSize: '13px' }}>
                    Current: <span style={{ color: goal.color, fontWeight: '700' }}>{current > 0 ? `${current}${goal.unit}` : 'No data yet'}</span>
                  </span>
                  <span style={{ color: '#888', fontSize: '13px' }}>
                    Target: <span style={{ color: '#fff', fontWeight: '700' }}>{goal.target}{goal.unit}</span>
                    <span style={{ color: achieved ? '#3FB950' : goal.color, fontWeight: '700', marginLeft: '8px' }}>({pct}%)</span>
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default Goals