const VARIANTS = {
  green: { bg: 'rgba(74,222,128,.1)',  bd: 'rgba(74,222,128,.22)', tx: '#4ade80', symbol: '●' },
  amber: { bg: 'rgba(255,140,0,.1)',  bd: 'rgba(255,140,0,.25)', tx: '#FF8C00', symbol: '◐' },
  red:   { bg: 'rgba(255,140,0,.1)',  bd: 'rgba(255,140,0,.25)', tx: '#FF8C00', symbol: '○' },
  blue:  { bg: 'rgba(96,165,250,.1)',  bd: 'rgba(96,165,250,.22)', tx: '#60a5fa', symbol: '◆' },
  grey:  { bg: 'rgba(118,117,117,.1)', bd: 'rgba(118,117,117,.2)', tx: '#adaaaa', symbol: '◌' },
};

export default function Pill({ children, variant = 'grey' }) {
  const s = VARIANTS[variant] ?? VARIANTS.grey;
  return (
    <span style={{
      background: s.bg, border: `1px solid ${s.bd}`, color: s.tx,
      padding: '2px 10px', borderRadius: 20, fontSize: 10,
      fontWeight: 700, letterSpacing: '0.06em', whiteSpace: 'nowrap',
      display: 'inline-flex', alignItems: 'center', gap: 5,
      textTransform: 'uppercase',
    }}>
      <span aria-hidden="true" style={{ fontSize: 7 }}>{s.symbol}</span>
      {children}
    </span>
  );
}
