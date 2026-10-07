/* Gold ticker strip — matches the mockup's "MOVE BETTER · RECOVER FASTER · PERFORM STRONGER" */
const WORDS = [
  'Move Better', '·', 'Recover Faster', '·', 'Perform Stronger', '·',
  'Move Better', '·', 'Recover Faster', '·', 'Perform Stronger', '·',
  'Move Better', '·', 'Recover Faster', '·', 'Perform Stronger', '·',
  'Move Better', '·', 'Recover Faster', '·', 'Perform Stronger', '·',
]

export default function Marquee() {
  return (
    <div style={{
      backgroundColor: '#C9A15B',
      overflow: 'hidden',
      padding: '1.1rem 0',
      userSelect: 'none',
    }} aria-hidden="true">
      <div className="marquee-inner">
        {WORDS.map((w, i) => (
          <span key={i} style={{
            fontFamily: 'Montserrat, sans-serif',
            fontSize: '0.55rem', fontWeight: 700,
            letterSpacing: '0.35em', textTransform: 'uppercase',
            color: '#171717',
          }}>{w}</span>
        ))}
      </div>
    </div>
  )
}
