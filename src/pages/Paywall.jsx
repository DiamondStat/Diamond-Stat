function Paywall({ uses, onClose }) {
  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: '2rem'
    }}>
      <div style={{
        background: '#161B22', borderRadius: '16px', padding: '2.5rem',
        maxWidth: '480px', width: '100%', border: '1px solid #21262D',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>💎</div>
        <h2 style={{ color: '#fff', fontSize: '28px', marginBottom: '8px' }}>
          You've used your 5 free analyses
        </h2>
        <p style={{ color: '#888', fontSize: '14px', lineHeight: '1.7', marginBottom: '2rem' }}>
          Upgrade to DiamondStat Pro to get unlimited AI swing, pitch, fielding and catching analysis, unlimited training plans, and full access to all features.
        </p>

        {/* Pricing card */}
        <div style={{
          background: 'linear-gradient(135deg, #E85D24, #FF7F4F)',
          borderRadius: '12px', padding: '1.5rem', marginBottom: '1.5rem'
        }}>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginBottom: '4px' }}>DiamondStat Pro</div>
          <div style={{ color: '#fff', fontSize: '42px', fontWeight: '800', fontFamily: 'Barlow Condensed, sans-serif' }}>
            $9.99<span style={{ fontSize: '16px', fontWeight: '400' }}>/month</span>
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: '13px', marginTop: '8px' }}>
            Cancel anytime · Powered by Ko-fi
          </div>
        </div>

        {/* Features */}
        <div style={{ marginBottom: '2rem', textAlign: 'left' }}>
          {[
            '✅ Unlimited AI swing, pitch, fielding & catching analysis',
            '✅ Unlimited personalized training plans',
            '✅ Full progress tracking and benchmarks',
            '✅ Leaderboard access',
            '✅ Recruiting profile generator',
            '✅ Priority AI coaching tips',
          ].map((f, i) => (
            <div key={i} style={{ color: '#ccc', fontSize: '13px', marginBottom: '8px' }}>{f}</div>
          ))}
        </div>

        {/* Steps */}
        <div style={{
          background: '#0D1117', borderRadius: '10px', padding: '1rem',
          marginBottom: '1.5rem', textAlign: 'left', border: '1px solid #21262D'
        }}>
          <div style={{ color: '#888', fontSize: '12px', fontWeight: '700', textTransform: 'uppercase', marginBottom: '8px' }}>
            How it works
          </div>
          <div style={{ color: '#ccc', fontSize: '13px', marginBottom: '6px' }}>1. Click Upgrade and subscribe on Ko-fi</div>
          <div style={{ color: '#ccc', fontSize: '13px', marginBottom: '6px' }}>2. Email <span style={{ color: '#E85D24' }}>diamondstatapp@gmail.com</span> with your DiamondStat account email</div>
          <div style={{ color: '#ccc', fontSize: '13px' }}>3. We activate your Pro account within 24 hours</div>
        </div>

        {/* Buttons */}
        <button
          onClick={() => window.open('https://ko-fi.com/diamondstat/membership', '_blank')}
          style={{
            width: '100%', padding: '14px', background: '#E85D24',
            border: 'none', borderRadius: '10px', color: 'white',
            fontSize: '16px', fontWeight: '700', cursor: 'pointer',
            fontFamily: 'Barlow, sans-serif', marginBottom: '10px'
          }}>
          Upgrade to Pro — $9.99/month ⚾
        </button>

        <button onClick={onClose}
          style={{
            width: '100%', padding: '12px', background: 'transparent',
            border: '1px solid #21262D', borderRadius: '10px', color: '#888',
            fontSize: '14px', fontWeight: '600', cursor: 'pointer',
            fontFamily: 'Barlow, sans-serif'
          }}>
          Maybe later
        </button>

        <div style={{ color: '#555', fontSize: '12px', marginTop: '1rem' }}>
          You have used {uses}/5 free analyses
        </div>
      </div>
    </div>
  )
}

export default Paywall