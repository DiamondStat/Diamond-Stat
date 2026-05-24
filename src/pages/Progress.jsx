import { useState, useEffect } from 'react'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts'
import { supabase } from '../supabase'

function Progress() {
  const [sessions, setSessions] = useState([])
  const [loading, setLoading] = useState(true)
  const [newSession, setNewSession] = useState({
    date: '', swingScore: '', commandScore: '', fieldingScore: ''
  })

  useEffect(() => {
    const loadSessions = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('sessions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: true })

        if (data && data.length > 0) {
          const formatted = data.map(s => ({
            date: new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            swingScore: s.swing_score || 0,
            commandScore: s.command_score || 0,
            fieldingScore: s.fielding_score || 0,
            exitVelo: s.exit_velocity || 0,
            pitchVelo: s.velocity || 0,
          }))
          setSessions(formatted)
        }
      }
      setLoading(false)
    }
    loadSessions()
  }, [])

  const addSession = async () => {
    if (!newSession.date || !newSession.swingScore) return
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('sessions').insert({
        user_id: user.id,
        type: 'manual',
        swing_score: parseInt(newSession.swingScore) || 0,
        command_score: parseInt(newSession.commandScore) || 0,
        fielding_score: parseInt(newSession.fieldingScore) || 0,
      })
      const updated = [...sessions, {
        date: newSession.date,
        swingScore: parseInt(newSession.swingScore) || 0,
        commandScore: parseInt(newSession.commandScore) || 0,
        fieldingScore: parseInt(newSession.fieldingScore) || 0,
        exitVelo: 0,
        pitchVelo: 0,
      }]
      setSessions(updated)
      setNewSession({ date: '', swingScore: '', commandScore: '', fieldingScore: '' })
    }
  }

  const latest = sessions[sessions.length - 1] || {}
  const first = sessions[0] || {}

  const diff = (key) => {
    if (!latest[key] || !first[key]) return '+0'
    const d = latest[key] - first[key]
    return d > 0 ? `+${d}` : `${d}`
  }

  const diffColor = (key) => {
    if (!latest[key] || !first[key]) return '#888'
    return latest[key] - first[key] >= 0 ? '#3FB950' : '#F85149'
  }

  const inputStyle = {
    padding: '8px 12px', background: '#0D1117',
    border: '1px solid #21262D', borderRadius: '8px', color: 'white',
    fontSize: '13px', width: '100%', fontFamily: 'Barlow, sans-serif'
  }

  if (loading) return (
    <div style={{ padding: '2rem', color: '#888', fontSize: '14px' }}>Loading your sessions...</div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ color: '#E85D24', fontSize: '32px', marginBottom: '4px' }}>Progress Tracker</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '14px' }}>Track your improvement over time across all skills</p>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', marginBottom: '2rem' }}>
        {[
          { label: 'Swing Score', key: 'swingScore', icon: '⚾', color: '#E85D24' },
          { label: 'Command Score', key: 'commandScore', icon: '🎯', color: '#3FB950' },
          { label: 'Fielding Score', key: 'fieldingScore', icon: '🧤', color: '#58A6FF' },
        ].map(({ label, key, icon, color }) => (
          <div key={key} style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', border: '1px solid #21262D' }}>
            <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>{icon} {label}</div>
            <div style={{ color: latest[key] > 0 ? color : '#333', fontSize: '38px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif' }}>
              {latest[key] > 0 ? latest[key] : '—'}
            </div>
            {latest[key] > 0 && (
              <div style={{ color: diffColor(key), fontSize: '13px', marginTop: '4px', fontWeight: '600' }}>
                {diff(key)} since you started
              </div>
            )}
            {!latest[key] && (
              <div style={{ color: '#555', fontSize: '13px', marginTop: '4px' }}>No data yet</div>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #21262D' }}>
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '1.5rem' }}>Score History</div>
        {sessions.length > 0 ? (
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={sessions}>
              <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis domain={[0, 100]} tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#888', fontSize: '13px' }} />
              <Line type="monotone" dataKey="swingScore" stroke="#E85D24" strokeWidth={2} dot={{ fill: '#E85D24', r: 3 }} name="Swing" />
              <Line type="monotone" dataKey="commandScore" stroke="#3FB950" strokeWidth={2} dot={{ fill: '#3FB950', r: 3 }} name="Command" />
              <Line type="monotone" dataKey="fieldingScore" stroke="#58A6FF" strokeWidth={2} dot={{ fill: '#58A6FF', r: 3 }} name="Fielding" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ textAlign: 'center', padding: '3rem', color: '#555' }}>
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>📊</div>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#888', marginBottom: '8px' }}>No sessions yet</div>
            <div style={{ fontSize: '13px' }}>Complete an analysis to start tracking your progress!</div>
          </div>
        )}
      </div>

      {/* Velocity chart */}
      {sessions.some(s => s.exitVelo > 0 || s.pitchVelo > 0) && (
        <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #21262D' }}>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '1.5rem' }}>Velocity History (mph)</div>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={sessions}>
              <XAxis dataKey="date" tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: '#888', fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '8px', color: '#fff' }} />
              <Legend wrapperStyle={{ color: '#888', fontSize: '13px' }} />
              <Line type="monotone" dataKey="exitVelo" stroke="#F0883E" strokeWidth={2} dot={{ fill: '#F0883E', r: 3 }} name="Exit Velo" />
              <Line type="monotone" dataKey="pitchVelo" stroke="#A371F7" strokeWidth={2} dot={{ fill: '#A371F7', r: 3 }} name="Pitch Velo" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Session list */}
      {sessions.length > 0 && (
        <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #21262D' }}>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '1rem' }}>Session History</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[...sessions].reverse().map((s, i) => (
              <div key={i} style={{ display: 'flex', gap: '16px', alignItems: 'center', padding: '10px 14px', background: '#0D1117', borderRadius: '8px', border: '1px solid #21262D' }}>
                <div style={{ color: '#888', fontSize: '13px', minWidth: '60px' }}>{s.date}</div>
                {s.swingScore > 0 && <div style={{ color: '#E85D24', fontSize: '13px', fontWeight: '600' }}>⚾ {s.swingScore}</div>}
                {s.commandScore > 0 && <div style={{ color: '#3FB950', fontSize: '13px', fontWeight: '600' }}>🎯 {s.commandScore}</div>}
                {s.fieldingScore > 0 && <div style={{ color: '#58A6FF', fontSize: '13px', fontWeight: '600' }}>🧤 {s.fieldingScore}</div>}
                {s.exitVelo > 0 && <div style={{ color: '#F0883E', fontSize: '13px', fontWeight: '600' }}>💨 {s.exitVelo} mph</div>}
                {s.pitchVelo > 0 && <div style={{ color: '#A371F7', fontSize: '13px', fontWeight: '600' }}>🔥 {s.pitchVelo} mph</div>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add session manually */}
      <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', border: '1px solid #21262D' }}>
        <div style={{ color: '#fff', fontSize: '16px', fontWeight: '700', marginBottom: '1rem' }}>Log a Session Manually</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '12px', marginBottom: '12px' }}>
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Date</div>
            <input style={inputStyle} placeholder="e.g. May 23"
              value={newSession.date} onChange={e => setNewSession(p => ({ ...p, date: e.target.value }))} />
          </div>
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Swing Score</div>
            <input style={inputStyle} type="number" placeholder="0-100"
              value={newSession.swingScore} onChange={e => setNewSession(p => ({ ...p, swingScore: e.target.value }))} />
          </div>
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Command Score</div>
            <input style={inputStyle} type="number" placeholder="0-100"
              value={newSession.commandScore} onChange={e => setNewSession(p => ({ ...p, commandScore: e.target.value }))} />
          </div>
          <div>
            <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>Fielding Score</div>
            <input style={inputStyle} type="number" placeholder="0-100"
              value={newSession.fieldingScore} onChange={e => setNewSession(p => ({ ...p, fieldingScore: e.target.value }))} />
          </div>
        </div>
        <button onClick={addSession}
          style={{
            padding: '10px 24px', background: '#E85D24', border: 'none',
            borderRadius: '8px', color: 'white', fontSize: '14px',
            fontWeight: '600', cursor: 'pointer', fontFamily: 'Barlow, sans-serif'
          }}>
          + Add Session
        </button>
      </div>
    </div>
  )
}

export default Progress