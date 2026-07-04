import { useEffect, useState } from 'react'

interface Props {
  iter: number
  maxIter: number
  fase: string
  corriendo: boolean
}

const FASES_ORDEN = ['generando', 'renderizando', 'evaluando', 'render_final']
const FASES_LABEL: Record<string, string> = {
  generando: 'Generando codigo...',
  renderizando: 'Renderizando (esto tarda un poco)',
  evaluando: 'El critico observa la pieza...',
  render_final: 'Render final con efectos',
}

const SHIMMER_CSS = `
@keyframes shimmer {
  0%   { background-position: -200% center; }
  100% { background-position: 200% center; }
}
`

export default function ProgressBar({ iter, maxIter, fase, corriendo }: Props) {
  const [segundos, setSegundos] = useState(0)

  useEffect(() => {
    setSegundos(0)
    if (!corriendo) return
    const id = setInterval(() => setSegundos((s) => s + 1), 1000)
    return () => clearInterval(id)
  }, [fase, corriendo])

  if (!corriendo && iter === 0) return null

  const pctMacro = maxIter > 0 ? Math.min((iter / maxIter) * 100, 100) : 0

  const idxFase = FASES_ORDEN.indexOf(fase)
  const pctFase = idxFase >= 0 ? Math.round(((idxFase + 1) / FASES_ORDEN.length) * 100) : 0

  const shimmerBg = corriendo
    ? 'linear-gradient(90deg, var(--accent) 0%, #a78bfa 40%, var(--accent) 60%, var(--accent-dim) 100%)'
    : 'var(--accent)'

  return (
    <>
      <style>{SHIMMER_CSS}</style>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
        {/* Línea de estado */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{ fontSize: '0.9rem', color: 'var(--text)', fontWeight: 500 }}>
            {FASES_LABEL[fase] ?? fase}
          </span>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
            {corriendo && segundos > 0 ? `${segundos}s` : ''} · iter {iter}/{maxIter}
          </span>
        </div>

        {/* Barra macro: progreso global */}
        <div style={{ background: 'var(--border)', borderRadius: 6, height: 8, overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${pctMacro}%`,
              background: shimmerBg,
              backgroundSize: '200% auto',
              borderRadius: 6,
              transition: 'width 0.5s ease',
              animation: corriendo ? 'shimmer 2s linear infinite' : 'none',
            }}
          />
        </div>

        {/* Barra de fase: progreso dentro de la iteración */}
        {corriendo && (
          <div style={{ background: 'var(--border)', borderRadius: 4, height: 4, overflow: 'hidden', opacity: 0.7 }}>
            <div
              style={{
                height: '100%',
                width: `${pctFase}%`,
                background: 'var(--accent)',
                borderRadius: 4,
                transition: 'width 0.4s ease',
              }}
            />
          </div>
        )}
      </div>
    </>
  )
}
