export default function GradientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden" style={{ background: '#0a0a1a' }}>
      {/* Base gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 120%, #1a1040 0%, #0a0a1a 70%)',
        }}
      />

      {/* Aurora layer 1 — wide pink/purple sweep */}
      <div
        className="absolute"
        style={{
          top: '5%',
          left: '-20%',
          width: '140%',
          height: '60%',
          background: 'radial-gradient(ellipse at 50% 50%, rgba(180, 100, 220, 0.15) 0%, rgba(120, 60, 200, 0.08) 40%, transparent 70%)',
          filter: 'blur(60px)',
          animation: 'aurora1 12s ease-in-out infinite',
        }}
      />

      {/* Aurora layer 2 — teal/green accent */}
      <div
        className="absolute"
        style={{
          top: '15%',
          left: '10%',
          width: '80%',
          height: '40%',
          background: 'radial-gradient(ellipse at 40% 50%, rgba(80, 180, 200, 0.1) 0%, rgba(60, 140, 180, 0.05) 40%, transparent 70%)',
          filter: 'blur(80px)',
          animation: 'aurora2 16s ease-in-out infinite',
        }}
      />

      {/* Aurora layer 3 — magenta ribbon */}
      <div
        className="absolute"
        style={{
          top: '10%',
          left: '20%',
          width: '60%',
          height: '35%',
          background: 'radial-gradient(ellipse at 60% 50%, rgba(200, 80, 180, 0.12) 0%, transparent 60%)',
          filter: 'blur(50px)',
          animation: 'aurora3 20s ease-in-out infinite',
        }}
      />

      {/* Stars — subtle dots */}
      <div
        className="absolute inset-0"
        style={{
          background: `
            radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 40% 70%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 60% 20%, rgba(255,255,255,0.35), transparent),
            radial-gradient(1px 1px at 80% 50%, rgba(255,255,255,0.25), transparent),
            radial-gradient(1px 1px at 15% 60%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1px 1px at 70% 80%, rgba(255,255,255,0.2), transparent),
            radial-gradient(1px 1px at 50% 10%, rgba(255,255,255,0.35), transparent),
            radial-gradient(1px 1px at 90% 35%, rgba(255,255,255,0.25), transparent),
            radial-gradient(1px 1px at 35% 90%, rgba(255,255,255,0.3), transparent),
            radial-gradient(1.5px 1.5px at 25% 45%, rgba(255,255,255,0.5), transparent),
            radial-gradient(1.5px 1.5px at 75% 15%, rgba(255,255,255,0.4), transparent),
            radial-gradient(1px 1px at 55% 55%, rgba(255,255,255,0.2), transparent)
          `,
        }}
      />

      <style>{`
        @keyframes aurora1 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.8; }
          33% { transform: translateX(5%) translateY(-3%) scale(1.05); opacity: 1; }
          66% { transform: translateX(-3%) translateY(2%) scale(0.95); opacity: 0.7; }
        }
        @keyframes aurora2 {
          0%, 100% { transform: translateX(0) translateY(0) scale(1); opacity: 0.6; }
          50% { transform: translateX(-8%) translateY(5%) scale(1.1); opacity: 0.9; }
        }
        @keyframes aurora3 {
          0%, 100% { transform: translateX(0) scale(1); opacity: 0.7; }
          40% { transform: translateX(10%) scale(1.08); opacity: 1; }
          70% { transform: translateX(-5%) scale(0.95); opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}
