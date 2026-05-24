import { useState, useEffect } from 'react'
import { supabase } from '../supabase'

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const scheduleTemplates = {
  Pitcher: {
    Monday: { focus: 'Bullpen Day', activities: ['Long toss warm up — 10 min', 'Fastball command drills — 30 pitches', 'Breaking ball work — 20 pitches', 'Cool down stretching'], type: 'pitching', intensity: 'High' },
    Tuesday: { focus: 'Hitting & Fielding', activities: ['Tee work — 50 swings', 'Soft toss — 30 swings', 'Fielding ground balls — 20 reps', 'Pop fly practice — 15 reps'], type: 'hitting', intensity: 'Medium' },
    Wednesday: { focus: 'Recovery & Film', activities: ['Light stretching — 20 min', 'Ice arm if needed', 'Watch film of last bullpen', 'Mental preparation work'], type: 'recovery', intensity: 'Low' },
    Thursday: { focus: 'Command Day', activities: ['Flat ground work — 30 pitches', 'Location drills — inside/outside', 'Changeup development', 'PFP — pitcher fielding practice'], type: 'pitching', intensity: 'Medium' },
    Friday: { focus: 'Game Prep', activities: ['Light catch — 10 min', 'Visualization — 15 min', 'Review opposing lineup', 'Rest and hydrate'], type: 'recovery', intensity: 'Low' },
    Saturday: { focus: 'Game Day / Live BP', activities: ['Full warm up routine', 'Live batting practice or game', 'Post game arm care', 'Review performance'], type: 'game', intensity: 'Max' },
    Sunday: { focus: 'Rest Day', activities: ['Full rest or light walk', 'Foam roll and stretch', 'Nutrition and hydration focus', 'Mental reset'], type: 'rest', intensity: 'Rest' },
  },
  Hitter: {
    Monday: { focus: 'Power Day', activities: ['Tee work — 75 swings', 'Soft toss — 40 swings', 'BP — 50 swings', 'Exit velocity tracking'], type: 'hitting', intensity: 'High' },
    Tuesday: { focus: 'Fielding Day', activities: ['Ground ball drills — 30 reps', 'Throwing mechanics — 20 min', 'Double play practice', 'Outfield routes if applicable'], type: 'fielding', intensity: 'Medium' },
    Wednesday: { focus: 'Situational Hitting', activities: ['Hit and run drills', 'Two strike approach work', 'Opposite field hitting — 30 swings', 'Bunting practice'], type: 'hitting', intensity: 'Medium' },
    Thursday: { focus: 'Speed & Agility', activities: ['Base running drills — 20 min', 'First step quickness', 'Sprint intervals — 10 reps', 'Lateral movement work'], type: 'fitness', intensity: 'High' },
    Friday: { focus: 'Game Prep', activities: ['Light tee work — 20 swings', 'Visualization — 15 min', 'Review opposing pitcher', 'Rest and hydrate'], type: 'recovery', intensity: 'Low' },
    Saturday: { focus: 'Game Day', activities: ['Full warm up routine', 'Game — focus on approach', 'Post game review', 'Stat tracking'], type: 'game', intensity: 'Max' },
    Sunday: { focus: 'Rest Day', activities: ['Full rest', 'Foam roll and stretch', 'Nutrition focus', 'Watch MLB film'], type: 'rest', intensity: 'Rest' },
  },
  Catcher: {
    Monday: { focus: 'Blocking Day', activities: ['Blocking drills — 30 reps', 'Framing practice — 50 pitches', 'Pop time work — 15 throws', 'Receiving drills'], type: 'catching', intensity: 'High' },
    Tuesday: { focus: 'Hitting Day', activities: ['Tee work — 60 swings', 'Soft toss — 40 swings', 'Catcher specific BP', 'Power drills'], type: 'hitting', intensity: 'High' },
    Wednesday: { focus: 'Game Calling', activities: ['Film study — opposing hitters', 'Sign system practice', 'Communication with pitchers', 'Light catch — 20 min'], type: 'recovery', intensity: 'Low' },
    Thursday: { focus: 'Throwing Day', activities: ['Pop time drills — 20 throws', 'Pick off plays', 'Footwork drills', 'Arm strengthening'], type: 'catching', intensity: 'High' },
    Friday: { focus: 'Game Prep', activities: ['Light work only', 'Gear check', 'Pitcher meetings', 'Rest and hydrate'], type: 'recovery', intensity: 'Low' },
    Saturday: { focus: 'Game Day', activities: ['Full gear warm up', 'Game — lead the defense', 'Post game arm care', 'Review performance'], type: 'game', intensity: 'Max' },
    Sunday: { focus: 'Rest Day', activities: ['Full rest', 'Stretch and recover', 'Nutrition focus', 'Mental reset'], type: 'rest', intensity: 'Rest' },
  },
  Fielder: {
    Monday: { focus: 'Ground Ball Day', activities: ['Ground ball drills — 40 reps', 'Backhand practice — 20 reps', 'Throwing mechanics', 'Double play turns'], type: 'fielding', intensity: 'High' },
    Tuesday: { focus: 'Hitting Day', activities: ['Tee work — 75 swings', 'Soft toss — 40 swings', 'Live BP — 50 swings', 'Exit velocity work'], type: 'hitting', intensity: 'High' },
    Wednesday: { focus: 'Speed & Agility', activities: ['First step drills — 20 min', 'Lateral shuffle — 15 min', 'Sprint work — 10 reps', 'Route running'], type: 'fitness', intensity: 'High' },
    Thursday: { focus: 'Situational Defense', activities: ['Cut off plays', 'Relay throws', 'Positioning work', 'Communication drills'], type: 'fielding', intensity: 'Medium' },
    Friday: { focus: 'Game Prep', activities: ['Light tee work', 'Visualization', 'Review opposing hitters', 'Rest and hydrate'], type: 'recovery', intensity: 'Low' },
    Saturday: { focus: 'Game Day', activities: ['Full warm up', 'Game — focus on defense', 'Post game review', 'Stat tracking'], type: 'game', intensity: 'Max' },
    Sunday: { focus: 'Rest Day', activities: ['Full rest', 'Foam roll and stretch', 'Nutrition focus', 'Watch film'], type: 'rest', intensity: 'Rest' },
  },
}

function Schedule() {
  const [position, setPosition] = useState('')
  const [selectedDay, setSelectedDay] = useState('Monday')
  const [completedActivities, setCompletedActivities] = useState({})
  const [loading, setLoading] = useState(true)
  const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]

  useEffect(() => {
    const loadProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const savedPosition = localStorage.getItem('playerPosition') || ''
        const savedCompleted = localStorage.getItem('completedActivities')
        setPosition(savedPosition)
        if (savedCompleted) setCompletedActivities(JSON.parse(savedCompleted))
      }
      setLoading(false)
    }
    loadProfile()
    setSelectedDay(today)
  }, [])

  const savePosition = (pos) => {
    setPosition(pos)
    localStorage.setItem('playerPosition', pos)
  }

  const toggleActivity = (day, activity) => {
    const key = `${day}-${activity}`
    const updated = { ...completedActivities, [key]: !completedActivities[key] }
    setCompletedActivities(updated)
    localStorage.setItem('completedActivities', JSON.stringify(updated))
  }

  const getTypeColor = (type) => {
    if (type === 'hitting') return '#E85D24'
    if (type === 'pitching') return '#3FB950'
    if (type === 'fielding') return '#58A6FF'
    if (type === 'catching') return '#A371F7'
    if (type === 'fitness') return '#F0883E'
    if (type === 'game') return '#F85149'
    if (type === 'recovery') return '#888'
    return '#555'
  }

  const getIntensityColor = (intensity) => {
    if (intensity === 'Max') return '#F85149'
    if (intensity === 'High') return '#F0883E'
    if (intensity === 'Medium') return '#3FB950'
    if (intensity === 'Low') return '#58A6FF'
    return '#555'
  }

  const template = scheduleTemplates[position] || null

  if (loading) return (
    <div style={{ padding: '2rem', color: '#888', fontSize: '14px' }}>Loading your schedule...</div>
  )

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1 style={{ color: '#E85D24', fontSize: '32px', marginBottom: '4px' }}>Weekly Schedule</h1>
      <p style={{ color: '#888', marginBottom: '2rem', fontSize: '14px' }}>Your personalized Mon–Sun training plan based on your position</p>

      {/* Position selector */}
      <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #21262D' }}>
        <div style={{ color: '#888', fontSize: '13px', marginBottom: '10px' }}>Select your position to get your schedule</div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['Pitcher', 'Hitter', 'Catcher', 'Fielder'].map(pos => (
            <button key={pos} onClick={() => savePosition(pos)}
              style={{
                padding: '8px 18px', borderRadius: '8px', cursor: 'pointer',
                background: position === pos ? '#E85D24' : '#21262D',
                color: position === pos ? '#fff' : '#888',
                fontSize: '14px', fontWeight: '600', fontFamily: 'Barlow, sans-serif',
                border: `1px solid ${position === pos ? '#E85D24' : '#21262D'}`,
                transition: 'all 0.2s ease'
              }}>
              {pos}
            </button>
          ))}
        </div>
      </div>

      {!position && (
        <div style={{ background: '#161B22', border: '1px solid #21262D', borderRadius: '12px', padding: '2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>📅</div>
          <div style={{ color: '#fff', fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>Select your position above</div>
          <div style={{ color: '#888', fontSize: '13px' }}>We'll build you a custom Mon–Sun training schedule</div>
        </div>
      )}

      {template && (
        <>
          {/* Day selector */}
          <div style={{ display: 'flex', gap: '6px', marginBottom: '1.5rem', overflowX: 'auto', paddingBottom: '4px' }}>
            {days.map(day => {
              const isToday = day === today
              const active = day === selectedDay
              const dayData = template[day]
              return (
                <button key={day} onClick={() => setSelectedDay(day)}
                  style={{
                    padding: '10px 14px', borderRadius: '10px', cursor: 'pointer', flexShrink: 0,
                    background: active ? '#E85D24' : isToday ? 'rgba(232,93,36,0.1)' : '#161B22',
                    color: active ? '#fff' : isToday ? '#E85D24' : '#888',
                    fontSize: '13px', fontWeight: '600', fontFamily: 'Barlow, sans-serif',
                    border: `1px solid ${active ? '#E85D24' : isToday ? 'rgba(232,93,36,0.3)' : '#21262D'}`,
                    transition: 'all 0.2s ease', minWidth: '100px', textAlign: 'center'
                  }}>
                  <div>{day.slice(0, 3)}</div>
                  <div style={{ fontSize: '11px', marginTop: '2px', color: active ? 'rgba(255,255,255,0.8)' : getTypeColor(dayData.type) }}>
                    {dayData.focus.split(' ')[0]}
                  </div>
                </button>
              )
            })}
          </div>

          {/* Selected day detail */}
          {template[selectedDay] && (() => {
            const dayData = template[selectedDay]
            const typeColor = getTypeColor(dayData.type)
            return (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                {/* Left — day info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', border: `1px solid ${typeColor}44`, borderLeft: `4px solid ${typeColor}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                      <div>
                        <div style={{ color: '#888', fontSize: '12px', marginBottom: '4px' }}>{selectedDay}</div>
                        <div style={{ color: '#fff', fontSize: '22px', fontWeight: '700' }}>{dayData.focus}</div>
                      </div>
                      <div style={{
                        padding: '4px 12px', borderRadius: '99px', fontSize: '12px', fontWeight: '700',
                        background: `${getIntensityColor(dayData.intensity)}18`,
                        color: getIntensityColor(dayData.intensity),
                        border: `1px solid ${getIntensityColor(dayData.intensity)}44`
                      }}>
                        {dayData.intensity} Intensity
                      </div>
                    </div>
                    <div style={{
                      display: 'inline-block', padding: '4px 12px', borderRadius: '99px',
                      background: `${typeColor}18`, color: typeColor,
                      fontSize: '12px', fontWeight: '700', textTransform: 'capitalize'
                    }}>
                      {dayData.type}
                    </div>
                  </div>

                  {/* Weekly overview */}
                  <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', border: '1px solid #21262D' }}>
                    <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '12px' }}>Week Overview</div>
                    {days.map(day => {
                      const d = template[day]
                      const isSelected = day === selectedDay
                      const isToday = day === today
                      return (
                        <div key={day} onClick={() => setSelectedDay(day)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '8px 10px', borderRadius: '8px', cursor: 'pointer', marginBottom: '4px',
                            background: isSelected ? 'rgba(232,93,36,0.1)' : 'transparent',
                            border: `1px solid ${isSelected ? 'rgba(232,93,36,0.3)' : 'transparent'}`
                          }}>
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: getTypeColor(d.type), flexShrink: 0
                          }} />
                          <div style={{ color: isToday ? '#E85D24' : '#888', fontSize: '12px', width: '80px', fontWeight: isToday ? '700' : '400' }}>
                            {day} {isToday ? '← Today' : ''}
                          </div>
                          <div style={{ color: '#fff', fontSize: '13px', fontWeight: '500' }}>{d.focus}</div>
                          <div style={{ marginLeft: 'auto', color: getIntensityColor(d.intensity), fontSize: '11px' }}>{d.intensity}</div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Right — activities checklist */}
                <div style={{ background: '#161B22', borderRadius: '12px', padding: '1.5rem', border: '1px solid #21262D' }}>
                  <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', marginBottom: '16px' }}>
                    Today's Activities
                    <span style={{ color: '#888', fontSize: '13px', fontWeight: '400', marginLeft: '8px' }}>
                      ({dayData.activities.filter(a => completedActivities[`${selectedDay}-${a}`]).length}/{dayData.activities.length} done)
                    </span>
                  </div>

                  {dayData.activities.map((activity, i) => {
                    const key = `${selectedDay}-${activity}`
                    const done = completedActivities[key]
                    return (
                      <div key={i} onClick={() => toggleActivity(selectedDay, activity)}
                        style={{
                          display: 'flex', alignItems: 'center', gap: '12px',
                          padding: '12px 14px', borderRadius: '10px', cursor: 'pointer',
                          background: done ? 'rgba(63,185,80,0.08)' : '#0D1117',
                          border: `1px solid ${done ? '#3FB95044' : '#21262D'}`,
                          marginBottom: '8px', transition: 'all 0.2s ease'
                        }}>
                        <div style={{
                          width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
                          background: done ? '#3FB950' : '#21262D',
                          border: `2px solid ${done ? '#3FB950' : '#30363D'}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '12px', color: '#fff'
                        }}>
                          {done ? '✓' : ''}
                        </div>
                        <div style={{ color: done ? '#3FB950' : '#ccc', fontSize: '13px', textDecoration: done ? 'line-through' : 'none' }}>
                          {activity}
                        </div>
                      </div>
                    )
                  })}

                  {/* Progress bar */}
                  <div style={{ marginTop: '16px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ color: '#888', fontSize: '12px' }}>Day Progress</span>
                      <span style={{ color: '#3FB950', fontSize: '12px', fontWeight: '700' }}>
                        {Math.round((dayData.activities.filter(a => completedActivities[`${selectedDay}-${a}`]).length / dayData.activities.length) * 100)}%
                      </span>
                    </div>
                    <div style={{ height: '6px', background: '#21262D', borderRadius: '99px', overflow: 'hidden' }}>
                      <div style={{
                        height: '100%', borderRadius: '99px', background: '#3FB950',
                        width: `${(dayData.activities.filter(a => completedActivities[`${selectedDay}-${a}`]).length / dayData.activities.length) * 100}%`,
                        transition: 'width 0.5s ease'
                      }} />
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </>
      )}
    </div>
  )
}

export default Schedule