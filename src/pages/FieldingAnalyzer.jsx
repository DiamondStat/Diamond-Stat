import { useState } from 'react'
import { supabase } from '../supabase'
import { checkAndIncrementUses } from '../useAILimit'
import Paywall from './Paywall'

function GradeBar({ label, grade }) {
  const gradeColor = (g) => {
    if (!g) return '#888'
    if (g.startsWith('A')) return '#3FB950'
    if (g.startsWith('B')) return '#7EE787'
    if (g.startsWith('C')) return '#F0883E'
    return '#F85149'
  }
  const gradeWidth = (g) => {
    if (!g) return '0%'
    if (g.startsWith('A')) return '95%'
    if (g.startsWith('B')) return '75%'
    if (g.startsWith('C')) return '55%'
    return '30%'
  }
  return (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
        <span style={{ color: '#888', fontSize: '13px' }}>{label}</span>
        <span style={{ color: gradeColor(grade), fontWeight: '700', fontSize: '14px' }}>{grade}</span>
      </div>
      <div style={{ height: '6px', background: '#21262D', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: gradeWidth(grade),
          background: gradeColor(grade), borderRadius: '99px',
          transition: 'width 1s ease'
        }} />
      </div>
    </div>
  )
}

function FieldingAnalyzer() {
  const [video, setVideo] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState(null)
  const [notes, setNotes] = useState('')
  const [position, setPosition] = useState('')
  const [saved, setSaved] = useState(false)
  const [showPaywall, setShowPaywall] = useState(false)
  const [uses, setUses] = useState(0)

  const handleVideo = (e) => {
    const file = e.target.files[0]
    if (file) setVideo(URL.createObjectURL(file))
  }

  const analyzeFielding = async () => {
    setLoading(true)
    setSaved(false)

    const { allowed, uses: currentUses } = await checkAndIncrementUses()
    setUses(currentUses)
    if (!allowed) {
      setShowPaywall(true)
      setLoading(false)
      return
    }

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': import.meta.env.VITE_ANTHROPIC_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-dangerous-direct-browser-access': true,
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `You are an elite baseball fielding coach. A player has uploaded a fielding video. Position: "${position || 'Unknown'}". Notes: "${notes || 'No notes provided'}".

Analyze their fielding mechanics and return ONLY a JSON object with no extra text:
{
  "fielding_score": number 0-100,
  "first_step": "grade A-F",
  "footwork": "grade A-F",
  "glove_position": "grade A-F",
  "body_position": "grade A-F",
  "throwing_mechanics": "grade A-F",
  "athleticism": "grade A-F",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "coach_tip": "one specific actionable tip"
}`
          }]
        }),
      })
      const data = await response.json()
      const text = data.content[0].text
      const parsed = JSON.parse(text.replace(/```json|```/g, '').trim())
      setAnalysis(parsed)

      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        await supabase.from('sessions').insert({
          user_id: user.id,
          type: 'fielding',
          fielding_score: parsed.fielding_score,
          notes: notes
        })
        setSaved(true)
      }
    } catch (err) {
      console.error(err)
      setAnalysis({ error: 'Analysis failed. Try again.' })
    }
    setLoading(false)
  }

  const scoreColor = (score) => {
    if (score >= 80) return '#3FB950'
    if (score >= 60) return '#F0883E'
    return '#F85149'
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#0D1117',
    border: '1px solid #21262D', borderRadius: '8px', color: 'white',
    fontSize: '14px', marginTop: '6px', fontFamily: 'Barlow, sans-serif'
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      {showPaywall && <Paywall uses={uses} onClose={() => setShowPaywall(false)} />}

      <h1 style={{ color: '#E85D24', fontSize: '32px', marginBottom: '4px' }}>Fielding Analyzer</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '14px' }}>Upload your fielding video and get instant AI coaching feedback</p>

      <div style={{ display: 'grid', gridTemplateColumns: analysis ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem' }}>
            <label style={{
              display: 'block', border: '2px dashed #21262D', borderRadius: '10px',
              padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: video ? '1rem' : '0'
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎥</div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>Upload Fielding Video</div>
              <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>MP4 or MOV up to 100MB</div>
              <input type="file" accept="video/*" onChange={handleVideo} style={{ display: 'none' }} />
            </label>

            {video && (
              <div style={{ marginTop: '1rem' }}>
                <video src={video} controls style={{ width: '100%', borderRadius: '8px' }} />
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  {[0.25, 0.5, 1].map(speed => (
                    <button key={speed}
                      onClick={() => {
                        const v = document.querySelector('video')
                        if (v) v.playbackRate = speed
                      }}
                      style={{
                        flex: 1, padding: '6px', background: '#21262D',
                        border: 'none', borderRadius: '6px', color: '#888',
                        fontSize: '12px', cursor: 'pointer', fontFamily: 'Barlow, sans-serif'
                      }}>
                      {speed}×
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem' }}>
            <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Your Position</label>
            <select style={inputStyle} value={position} onChange={e => setPosition(e.target.value)}>
              <option value="">Select position</option>
              <option value="Pitcher">Pitcher</option>
              <option value="Catcher">Catcher</option>
              <option value="First Base">First Base</option>
              <option value="Second Base">Second Base</option>
              <option value="Shortstop">Shortstop</option>
              <option value="Third Base">Third Base</option>
              <option value="Left Field">Left Field</option>
              <option value="Center Field">Center Field</option>
              <option value="Right Field">Right Field</option>
            </select>

            <label style={{ color: '#888', fontSize: '13px', display: 'block', marginTop: '12px', marginBottom: '4px' }}>Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Struggling with backhand plays, slow getting out of my stance..."
              style={{ ...inputStyle, height: '80px', resize: 'none' }} />
          </div>

          <button onClick={analyzeFielding} disabled={loading}
            style={{
              width: '100%', padding: '14px', background: loading ? '#555' : '#E85D24',
              border: 'none', borderRadius: '10px', color: 'white',
              fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif'
            }}>
            {loading ? 'Analyzing your fielding...' : 'Analyze My Fielding 🧤'}
          </button>

          {saved && (
            <div style={{ background: '#3FB95022', border: '1px solid #3FB950', borderRadius: '8px', padding: '10px 14px', color: '#3FB950', fontSize: '13px', textAlign: 'center' }}>
              ✅ Session saved to your profile!
            </div>
          )}
        </div>

        {analysis && !analysis.error && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{
              background: '#161B22', borderRadius: '12px', padding: '1.5rem',
              display: 'flex', alignItems: 'center', gap: '1.5rem'
            }}>
              <div style={{
                width: '90px', height: '90px', borderRadius: '50%',
                border: `4px solid ${scoreColor(analysis.fielding_score)}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <div style={{ fontSize: '28px', fontWeight: '800', color: scoreColor(analysis.fielding_score) }}>
                  {analysis.fielding_score}
                </div>
                <div style={{ fontSize: '11px', color: '#888' }}>/ 100</div>
              </div>
              <div>
                <div style={{ color: '#fff', fontSize: '18px', fontWeight: '700', marginBottom: '4px' }}>Fielding Score</div>
                <div style={{ color: '#888', fontSize: '13px' }}>
                  Position: <span style={{ color: '#fff', fontWeight: '600' }}>{position || 'Unknown'}</span>
                </div>
              </div>
            </div>

            <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>Mechanic Grades</div>
              <GradeBar label="First Step" grade={analysis.first_step} />
              <GradeBar label="Footwork" grade={analysis.footwork} />
              <GradeBar label="Glove Position" grade={analysis.glove_position} />
              <GradeBar label="Body Position" grade={analysis.body_position} />
              <GradeBar label="Throwing Mechanics" grade={analysis.throwing_mechanics} />
              <GradeBar label="Athleticism" grade={analysis.athleticism} />
            </div>

            <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', borderLeft: '4px solid #3FB950' }}>
              <div style={{ color: '#3FB950', fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>✅ What's Working</div>
              {analysis.strengths?.map((s, i) => (
                <div key={i} style={{ color: '#ccc', fontSize: '13px', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#3FB950' }}>•</span> {s}
                </div>
              ))}
            </div>

            <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', borderLeft: '4px solid #F0883E' }}>
              <div style={{ color: '#F0883E', fontSize: '14px', fontWeight: '700', marginBottom: '10px' }}>⚠️ Needs Work</div>
              {analysis.improvements?.map((s, i) => (
                <div key={i} style={{ color: '#ccc', fontSize: '13px', marginBottom: '8px', display: 'flex', gap: '8px' }}>
                  <span style={{ color: '#F0883E' }}>•</span> {s}
                </div>
              ))}
            </div>

            <div style={{ background: '#E85D24', borderRadius: '12px', padding: '1.5rem' }}>
              <div style={{ color: '#fff', fontSize: '13px', fontWeight: '700', marginBottom: '6px' }}>💡 Coach Tip</div>
              <div style={{ color: '#fff', fontSize: '14px', lineHeight: '1.7' }}>{analysis.coach_tip}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default FieldingAnalyzer