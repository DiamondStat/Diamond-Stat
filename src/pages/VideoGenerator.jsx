import { useState, useRef, useEffect } from 'react'
import { supabase } from '../supabase'

function VideoGenerator() {
  const [video, setVideo] = useState(null)
  const [videoFile, setVideoFile] = useState(null)
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [notes, setNotes] = useState('')
  const [exitVelo, setExitVelo] = useState('')
  const [analyzeType, setAnalyzeType] = useState('hitting')
  const [playerName, setPlayerName] = useState(localStorage.getItem('playerName') || 'Player')
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const downloadRef = useRef(null)

  const handleVideo = (e) => {
    const file = e.target.files[0]
    if (file) {
      setVideoFile(file)
      setVideo(URL.createObjectURL(file))
      setGenerated(false)
      setAnalysis(null)
    }
  }

  const analyzeVideo = async () => {
    setLoading(true)
    try {
      const prompt = analyzeType === 'hitting'
        ? `You are an elite baseball hitting coach. Analyze this player's swing. Notes: "${notes}". Exit velocity: "${exitVelo ? exitVelo + ' mph' : 'Not provided'}".
Return ONLY JSON:
{
  "score": number 0-100,
  "exit_velocity": "${exitVelo || 'N/A'} mph",
  "bat_speed": "grade A-F",
  "contact_point": "Early/Ideal/Late",
  "hip_rotation": "grade A-F",
  "timing": "grade A-F",
  "follow_through": "grade A-F",
  "coach_tip": "one short tip under 12 words"
}`
        : analyzeType === 'pitching'
        ? `You are an elite baseball pitching coach. Analyze this pitcher. Notes: "${notes}".
Return ONLY JSON:
{
  "score": number 0-100,
  "velocity": "${exitVelo || 'N/A'} mph",
  "arm_angle": "grade A-F",
  "release_point": "grade A-F",
  "hip_separation": "grade A-F",
  "follow_through": "grade A-F",
  "balance": "grade A-F",
  "coach_tip": "one short tip under 12 words"
}`
        : `You are an elite baseball fielding coach. Analyze this player's fielding. Notes: "${notes}".
Return ONLY JSON:
{
  "score": number 0-100,
  "first_step": "grade A-F",
  "footwork": "grade A-F",
  "glove_position": "grade A-F",
  "throwing": "grade A-F",
  "body_position": "grade A-F",
  "coach_tip": "one short tip under 12 words"
}`

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
          max_tokens: 500,
          messages: [{ role: 'user', content: prompt }]
        }),
      })
      const data = await response.json()
      const parsed = JSON.parse(data.content[0].text.replace(/```json|```/g, '').trim())
      setAnalysis(parsed)
    } catch (err) {
      console.error(err)
      alert('Analysis failed. Try again.')
    }
    setLoading(false)
  }

  const generateVideo = async () => {
    if (!analysis || !videoRef.current) return
    setGenerating(true)

    const video = videoRef.current
    const canvas = canvasRef.current
    canvas.width = video.videoWidth || 1280
    canvas.height = video.videoHeight || 720
    const ctx = canvas.getContext('2d')

    const stream = canvas.captureStream(30)
    const recorder = new MediaRecorder(stream, { mimeType: 'video/webm; codecs=vp9' })
    const chunks = []
    recorder.ondataavailable = e => chunks.push(e.data)
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      const url = URL.createObjectURL(blob)
      downloadRef.current.href = url
      downloadRef.current.download = `DiamondStat_${playerName}_${analyzeType}.webm`
      downloadRef.current.click()
      setGenerating(false)
      setGenerated(true)
    }

    recorder.start()
    video.currentTime = 0
    video.play()

    const drawFrame = () => {
      if (video.ended || video.paused) {
        recorder.stop()
        return
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height)

      const overlayH = Math.floor(canvas.height * 0.28)
      const overlayY = canvas.height - overlayH

      // Dark gradient overlay at bottom
      const grad = ctx.createLinearGradient(0, overlayY - 40, 0, canvas.height)
      grad.addColorStop(0, 'rgba(0,0,0,0)')
      grad.addColorStop(0.3, 'rgba(0,0,0,0.85)')
      grad.addColorStop(1, 'rgba(0,0,0,0.95)')
      ctx.fillStyle = grad
      ctx.fillRect(0, overlayY - 40, canvas.width, overlayH + 40)

      const pad = Math.floor(canvas.width * 0.03)
      const scoreColor = analysis.score >= 80 ? '#3FB950' : analysis.score >= 60 ? '#F0883E' : '#F85149'

      // DiamondStat branding bar
      ctx.fillStyle = '#E85D24'
      ctx.fillRect(0, overlayY - 4, canvas.width, 4)

      // Logo text
      ctx.font = `bold ${Math.floor(canvas.width * 0.022)}px Barlow, sans-serif`
      ctx.fillStyle = '#E85D24'
      ctx.textAlign = 'left'
      ctx.fillText('💎 DiamondStat', pad, overlayY + Math.floor(canvas.height * 0.04))

      // Player name and type
      ctx.font = `${Math.floor(canvas.width * 0.018)}px Barlow, sans-serif`
      ctx.fillStyle = '#ffffff'
      ctx.fillText(`${playerName} — ${analyzeType.charAt(0).toUpperCase() + analyzeType.slice(1)} Analysis`, pad, overlayY + Math.floor(canvas.height * 0.075))

      // Score circle
      const circleX = canvas.width - pad - Math.floor(canvas.width * 0.06)
      const circleY = overlayY + Math.floor(overlayH * 0.45)
      const circleR = Math.floor(canvas.width * 0.055)

      ctx.beginPath()
      ctx.arc(circleX, circleY, circleR, 0, Math.PI * 2)
      ctx.fillStyle = 'rgba(0,0,0,0.6)'
      ctx.fill()
      ctx.strokeStyle = scoreColor
      ctx.lineWidth = Math.floor(canvas.width * 0.004)
      ctx.stroke()

      ctx.font = `bold ${Math.floor(canvas.width * 0.035)}px Barlow, sans-serif`
      ctx.fillStyle = scoreColor
      ctx.textAlign = 'center'
      ctx.fillText(analysis.score, circleX, circleY + Math.floor(canvas.width * 0.013))

      ctx.font = `${Math.floor(canvas.width * 0.012)}px Barlow, sans-serif`
      ctx.fillStyle = '#888'
      ctx.fillText('SCORE', circleX, circleY + Math.floor(canvas.width * 0.028))

      // Stats grid
      const stats = Object.entries(analysis).filter(([k]) =>
        !['score', 'coach_tip', 'contact_point'].includes(k)
      )

      const cols = 4
      const statW = (canvas.width - pad * 2 - Math.floor(canvas.width * 0.15)) / cols
      const statStartY = overlayY + Math.floor(overlayH * 0.35)

      const gradeColor = (g) => {
        if (!g) return '#888'
        if (typeof g === 'string') {
          if (g.startsWith('A')) return '#3FB950'
          if (g.startsWith('B')) return '#7EE787'
          if (g.startsWith('C')) return '#F0883E'
          if (g.includes('mph') || g.includes('Ideal')) return '#3FB950'
        }
        return '#F85149'
      }

      stats.slice(0, 8).forEach(([key, value], i) => {
        const col = i % cols
        const row = Math.floor(i / cols)
        const x = pad + col * statW
        const y = statStartY + row * Math.floor(canvas.height * 0.1)

        const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
        ctx.font = `${Math.floor(canvas.width * 0.011)}px Barlow, sans-serif`
        ctx.fillStyle = '#888888'
        ctx.textAlign = 'left'
        ctx.fillText(label, x, y)

        ctx.font = `bold ${Math.floor(canvas.width * 0.016)}px Barlow, sans-serif`
        ctx.fillStyle = gradeColor(value)
        ctx.fillText(String(value), x, y + Math.floor(canvas.height * 0.04))
      })

      // Coach tip at very bottom
      ctx.font = `italic ${Math.floor(canvas.width * 0.013)}px Barlow, sans-serif`
      ctx.fillStyle = '#E85D24'
      ctx.textAlign = 'left'
      ctx.fillText(`💡 ${analysis.coach_tip}`, pad, canvas.height - Math.floor(canvas.height * 0.025))

      // Website watermark
      ctx.font = `${Math.floor(canvas.width * 0.011)}px Barlow, sans-serif`
      ctx.fillStyle = 'rgba(255,255,255,0.4)'
      ctx.textAlign = 'right'
      ctx.fillText('diamond-stat.vercel.app', canvas.width - pad, canvas.height - Math.floor(canvas.height * 0.025))

      requestAnimationFrame(drawFrame)
    }

    video.addEventListener('play', drawFrame, { once: true })
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', background: '#0D1117',
    border: '1px solid #21262D', borderRadius: '8px', color: 'white',
    fontSize: '14px', fontFamily: 'Barlow, sans-serif', marginTop: '6px'
  }

  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      <h1 style={{ color: '#E85D24', fontSize: '32px', marginBottom: '4px' }}>Stats Video Generator</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '14px' }}>Upload your video, get AI analysis, and download it with your stats overlaid at the bottom</p>

      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <a ref={downloadRef} style={{ display: 'none' }}>download</a>

      <div style={{ display: 'grid', gridTemplateColumns: video && analysis ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>

        {/* Left panel */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Video upload */}
          <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem' }}>
            <label style={{
              display: 'block', border: '2px dashed #21262D', borderRadius: '10px',
              padding: '2rem', textAlign: 'center', cursor: 'pointer', marginBottom: video ? '1rem' : 0
            }}>
              <div style={{ fontSize: '40px', marginBottom: '8px' }}>🎥</div>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>Upload Your Video</div>
              <div style={{ color: '#888', fontSize: '13px', marginTop: '4px' }}>MP4 or MOV — swing, pitch, or fielding</div>
              <input type="file" accept="video/*" onChange={handleVideo} style={{ display: 'none' }} />
            </label>

            {video && (
              <video ref={videoRef} src={video} controls
                style={{ width: '100%', borderRadius: '8px' }} />
            )}
          </div>

          {/* Settings */}
          <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem' }}>
            <label style={{ color: '#888', fontSize: '13px', display: 'block', marginBottom: '4px' }}>Analysis Type</label>
            <select style={inputStyle} value={analyzeType} onChange={e => setAnalyzeType(e.target.value)}>
              <option value="hitting">Hitting</option>
              <option value="pitching">Pitching</option>
              <option value="fielding">Fielding</option>
            </select>

            <label style={{ color: '#888', fontSize: '13px', display: 'block', marginTop: '12px', marginBottom: '4px' }}>
              {analyzeType === 'hitting' ? 'Exit Velocity (mph)' : 'Pitch Velocity (mph)'} — optional
            </label>
            <input style={inputStyle} type="number"
              placeholder={analyzeType === 'hitting' ? 'e.g. 87' : 'e.g. 78'}
              value={exitVelo} onChange={e => setExitVelo(e.target.value)} />

            <label style={{ color: '#888', fontSize: '13px', display: 'block', marginTop: '12px', marginBottom: '4px' }}>Notes (optional)</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="e.g. Working on hip rotation, felt late on fastballs..."
              style={{ ...inputStyle, height: '70px', resize: 'none' }} />
          </div>

          <button onClick={analyzeVideo} disabled={loading || !video}
            style={{
              width: '100%', padding: '14px', background: loading ? '#555' : '#E85D24',
              border: 'none', borderRadius: '10px', color: 'white',
              fontSize: '16px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: 'Barlow, sans-serif'
            }}>
            {loading ? 'Analyzing...' : 'Analyze Video ⚾'}
          </button>
        </div>

        {/* Right panel — results + generate */}
        {analysis && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Score */}
            <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', textAlign: 'center', border: '1px solid #21262D' }}>
              <div style={{ color: '#888', fontSize: '13px', marginBottom: '8px' }}>Overall Score</div>
              <div style={{
                fontSize: '64px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif',
                color: analysis.score >= 80 ? '#3FB950' : analysis.score >= 60 ? '#F0883E' : '#F85149'
              }}>
                {analysis.score}
              </div>
              <div style={{ color: '#888', fontSize: '13px' }}>out of 100</div>
            </div>

            {/* Stats preview */}
            <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', border: '1px solid #21262D' }}>
              <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Stats that will appear on video</div>
              {Object.entries(analysis).filter(([k]) => !['score', 'coach_tip'].includes(k)).map(([key, value]) => (
                <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #21262D' }}>
                  <span style={{ color: '#888', fontSize: '13px' }}>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  <span style={{ color: '#E85D24', fontSize: '13px', fontWeight: '700' }}>{value}</span>
                </div>
              ))}
              <div style={{ marginTop: '10px', padding: '10px', background: '#0D1117', borderRadius: '8px' }}>
                <div style={{ color: '#E85D24', fontSize: '12px', marginBottom: '4px' }}>💡 Coach Tip</div>
                <div style={{ color: '#ccc', fontSize: '13px' }}>{analysis.coach_tip}</div>
              </div>
            </div>

            {/* Generate button */}
            <button onClick={generateVideo} disabled={generating}
              style={{
                width: '100%', padding: '14px',
                background: generating ? '#555' : 'linear-gradient(135deg, #E85D24, #FF7F4F)',
                border: 'none', borderRadius: '10px', color: 'white',
                fontSize: '16px', fontWeight: '700', cursor: generating ? 'not-allowed' : 'pointer',
                fontFamily: 'Barlow, sans-serif'
              }}>
              {generating ? '⏳ Generating your video...' : '🎬 Generate & Download Stats Video'}
            </button>

            {generated && (
              <div style={{ background: '#3FB95022', border: '1px solid #3FB950', borderRadius: '8px', padding: '12px', textAlign: 'center' }}>
                <div style={{ color: '#3FB950', fontSize: '14px', fontWeight: '700', marginBottom: '4px' }}>✅ Video downloaded!</div>
                <div style={{ color: '#888', fontSize: '12px' }}>Share it on Instagram, TikTok, or Twitter with #DiamondStat</div>
              </div>
            )}

            <div style={{ background: '#161B22', borderRadius: '10px', padding: '12px', border: '1px solid #21262D' }}>
              <div style={{ color: '#888', fontSize: '12px', lineHeight: '1.6' }}>
                📱 The video will download as a .webm file. To share on social media, convert it to MP4 using a free tool like <span style={{ color: '#E85D24' }}>cloudconvert.com</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default VideoGenerator