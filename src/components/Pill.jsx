const VARIANTS = {
  green: { bg: '#0d2918', bd: '#1a5c30', tx: '#4ade80', symbol: '●' },
  amber: { bg: '#2a1e00', bd: '#5a3e00', tx: '#fbbf24', symbol: '◐' },
  red:   { bg: '#2a0d0d', bd: '#5a1a1a', tx: '#f87171', symbol: '○' },
  blue:  { bg: '#0d1d2e', bd: '#1a3a5c', tx: '#60a5fa', symbol: '◆' },
  grey:  { bg: '#181818', bd: '#2a2a2a', tx: '#777',    symbol: '◌' },
};

export default function Pill({ children, variant = 'grey' }) {
  const s = VARIANTS[variant] ?? VARIANTS.grey;
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.bd}`, color: s.tx,
      padding: '2px 10px', borderRadius: 20, fontSize: 11,
      fontWeight: 600, letterSpacing: '0.03em', whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 5,
    }}>
      <span aria-hidden="true" style={{ fontSize: 8 }}>{s.symbol}</span>
      {children}
    </span>
  );
}
