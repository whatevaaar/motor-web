import { urlArchivo } from '../api'

export interface IterFrames {
  iter: number
  inicio: string
  mitad: string
  final: string
  score?: number
  aprobado?: boolean
  feedback?: string
}

interface Props {
  iteraciones: IterFrames[]
}

export default function FrameViewer({ iteraciones }: Props) {
  if (iteraciones.length === 0) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      {iteraciones.map((it) => (
        <div key={it.iter} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '0.8rem',
            }}
          >
            <span style={{ color: 'var(--text-dim)' }}>Iter {it.iter}</span>
            {it.score !== undefined && (
              <span
                style={{
                  color: it.aprobado ? 'var(--green)' : 'var(--yellow)',
                  fontWeight: 600,
                }}
              >
                {it.score}/10 {it.aprobado ? 'Aprobado' : 'Rechazado'}
              </span>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.4rem' }}>
            {[it.inicio, it.mitad, it.final].map((nombre, i) => (
              <img
                key={i}
                src={urlArchivo(nombre)}
                alt={['Inicio', 'Mitad', 'Final'][i]}
                style={{ width: '100%', borderRadius: 8, display: 'block', background: 'var(--surface)' }}
              />
            ))}
          </div>

          {it.feedback && (
            <p
              style={{
                fontSize: '0.8rem',
                color: 'var(--text-dim)',
                fontStyle: 'italic',
                lineHeight: 1.5,
                margin: 0,
              }}
            >
              "{it.feedback}"
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
