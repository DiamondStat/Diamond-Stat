import { useState } from 'react'

function Section({ title, color, icon, content }) {
  return (
    <div style={{
      background: '#161B22', borderRadius: '12px',
      padding: '1.5rem', borderLeft: `4px solid ${color}`
    }}>
      <div style={{ color: color, fontSize: '16px', fontWeight: '700', marginBottom: '12px' }}>
        {icon} {title}
      </div>
      <div style={{ color: '#ccc', fontSize: '14px', lineHeight: '1.8', whiteSpace: 'pre-wrap' }}>
        {content}
      </div>
    </div>
  )
}

function Profile() {
  const [form, setForm] = useState({
    name: '', age: '', position: '', skillLevel: '', goals: '', weaknesses: ''
  })
  const [sections, setSections] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const update = (field, value) => setForm(prev => ({ ...prev, [field]: value }))

  const generatePlan = async () => {
    setLoading(true)
    try {
      const key = import.meta.env.VITE_ANTHROPIC_KEY
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': key,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': true,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1500,
          messages: [{
            role: 'user',
            content: `You are an elite baseball coach. Create a detailed personalized weekly training plan for this player:
Name: ${form.name}
Age: ${form.age}
Position: ${form.position}
Skill Level: ${form.skillLevel}
Goals: ${form.goals}
Weaknesses: ${form.weaknesses}

Return a training plan with these exact numbered sections:
1. HITTING PLAN - 3 specific drills with sets/reps
2. PITCHING PLAN - 3 specific drills with sets/reps
3. FIELDING PLAN - 3 specific drills with sets/reps
4. DAILY WORKOUT - morning routine with exercises and reps
5. WEEKLY SCHEDULE - what to focus on each day Mon-Sun
6. COACH TIP - one personalized piece of advice

Be specific, motivating, and tailored exactly to this player's position and weaknesses.`
          }]
        }),
      })
      const data = await response.json()
      const text = data.content[0].text
      const parts = text.split(/\n(?=\d\.)/)
      setSections(parts)
      localStorage.setItem('playerName', form.name)
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      setSections(['Something went wrong. Check your API key.'])
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#0D1117',
    border: '1px solid #21262D', borderRadius: '8px', color: 'white',
    fontSize: '14px', marginTop: '6px', fontFamily: 'Barlow, sans-serif'
  }
  const labelStyle = { color: '#888', fontSize: '13px', display: 'block', marginTop: '16px' }
  const sectionColors = ['#E85D24', '#3FB950', '#58A6FF', '#F0883E', '#A371F7', '#F85149']
  const sectionIcons = ['baseball', 'dart', 'glove', 'muscle', 'calendar', 'bulb']

  return (
    <div style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ color: '#E85D24', fontSize: '32px', marginBottom: '8px' }}>My Training Plan</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '14px' }}>Fill out your profile and AI will build a fully personalized baseball training plan</p>

      {!submitted ? (
        <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem' }}>
          <label style={labelStyle}>Full Name</label>
          <input style={inputStyle} placeholder="e.g. Jake Miller" value={form.name} onChange={e => update('name', e.target.value)} />

          <label style={labelStyle}>Age</label>
          <input style={inputStyle} placeholder="e.g. 16" value={form.age} onChange={e => update('age', e.target.value)} />

          <label style={labelStyle}>Primary Position</label>
          <select style={inputStyle} value={form.position} onChange={e => update('position', e.target.value)}>
            <option value="">Select position</option>
            <option value="Pitcher">Pitcher</option>
            <option value="Catcher">Catcher</option>
            <option value="First Base">First Base</option>
            <option value="Second Base">Second Base</option>
            <option value="Shortstop">Shortstop</option>
            <option value="Third Base">Third Base</option>
            <option value="Outfield">Outfield</option>
            <option value="Designated Hitter">Designated Hitter</option>
          </select>

          <label style={labelStyle}>Skill Level</label>
          <select style={inputStyle} value={form.skillLevel} onChange={e => update('skillLevel', e.target.value)}>
            <option value="">Select level</option>
            <option value="Beginner">Beginner</option>
            <option value="Youth League">Youth League</option>
            <option value="High School">High School</option>
            <option value="College">College</option>
            <option value="Semi-Pro / Pro">Semi-Pro / Pro</option>
          </select>

          <label style={labelStyle}>Your Goals</label>
          <textarea style={{ ...inputStyle, height: '80px', resize: 'none' }}
            placeholder="e.g. Increase exit velocity, make varsity team, improve curveball command"
            value={form.goals} onChange={e => update('goals', e.target.value)} />

          <label style={labelStyle}>Your Weaknesses</label>
          <textarea style={{ ...inputStyle, height: '80px', resize: 'none' }}
            placeholder="e.g. Slow bat speed, inconsistent release point, poor footwork"
            value={form.weaknesses} onChange={e => update('weaknesses', e.target.value)} />

          <button onClick={generatePlan} disabled={loading || !form.name || !form.position}
            style={{
              width: '100%', padding: '14px', background: loading ? '#555' : '#E85D24',
              border: 'none', borderRadius: '10px', color: 'white', marginTop: '1.5rem',
              fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif'
            }}>
            {loading ? 'AI is building your plan...' : 'Generate My Training Plan'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <h2 style={{ color: '#fff', fontSize: '22px' }}>{form.name}'s Personalized Plan</h2>
            <button onClick={() => setSubmitted(false)}
              style={{
                padding: '8px 16px', background: 'transparent', border: '1px solid #21262D',
                borderRadius: '8px', color: '#888', fontSize: '13px', cursor: 'pointer',
                fontFamily: 'Barlow, sans-serif'
              }}>
              Edit Profile
            </button>
          </div>
          {sections?.map((section, i) => (
            <Section
              key={i}
              title={section.split('\n')[0].replace(/^\d\.\s*/, '')}
              content={section.split('\n').slice(1).join('\n').trim()}
              color={sectionColors[i] || '#888'}
              icon={sectionIcons[i] || ''}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default Profile