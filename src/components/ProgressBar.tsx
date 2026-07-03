interface Props {
  iter: number
  maxIter: number
  fase: string
  corriendo: boolean
}

const FASES: Record<string, string> = {
  generando: 'Generando codigo',
  renderizando: 'Renderizando',
  evaluando: 'Evaluando',
  render_final: 'Render final',
}

export default function ProgressBar({ iter, maxIter, fase, corriendo }: Props) {
  if (!corriendo && iter === 0) return null

  const pct = maxIter > 0 ? Math.round((iter / maxIter) * 100) : 0

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-dim)' }}>
        <span>{FASES[fase] ?? fase}</span>
        <span>iter {iter}/{maxIter}</span>
      </div>
      <div style={{ background: 'var(--border)', borderRadius: 4, height: 6, overflow: 'hidden' }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: 'var(--accent)',
            borderRadius: 4,
            transition: 'width 0.4s ease',
          }}
        />
      </div>
    </div>
  )
}
