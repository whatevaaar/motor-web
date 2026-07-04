import { useEffect, useRef, useState } from 'react'

export interface LogEvento {
  tipo: 'log' | 'fase' | 'critica' | 'error'
  texto: string
  score?: number
  aprobado?: boolean
  id: number
}

interface Props {
  eventos: LogEvento[]
}

const SPIN = ['|', '/', '-', '\\']

function SpinnerFase({ texto }: { texto: string }) {
  const [frame, setFrame] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setFrame((f) => (f + 1) % 4), 200)
    return () => clearInterval(id)
  }, [])
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
      <span style={{ fontFamily: 'monospace', color: 'var(--accent)', fontWeight: 700, fontSize: '1.1rem', minWidth: 14 }}>
        {SPIN[frame]}
      </span>
      <span style={{ color: 'var(--text)', fontSize: '0.95rem' }}>{texto}</span>
    </div>
  )
}

function CriticaCard({ score, aprobado, texto }: { score: number; aprobado: boolean; texto: string }) {
  const color = aprobado ? 'var(--green)' : score >= 5 ? 'var(--yellow)' : 'var(--red)'
  const bg = aprobado ? '#0d2b1a' : score >= 5 ? '#2b1f0a' : '#2a0a0a'
  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${color}`,
        borderRadius: 12,
        padding: '0.9rem 1rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.4rem',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: '0.75rem', color, fontWeight: 600 }}>/ 10 · {aprobado ? 'APROBADO' : 'RECHAZADO'}</span>
      </div>
      <p style={{ fontSize: '0.88rem', color: 'var(--text-dim)', fontStyle: 'italic', margin: 0, lineHeight: 1.5 }}>
        "{texto}"
      </p>
    </div>
  )
}

const SLIDE_CSS = `
@keyframes slideIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}
.log-card { animation: slideIn 0.2s ease; }
`

export default function LogStream({ eventos }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [eventos])

  if (eventos.length === 0) return null

  const visibles = eventos.slice(-6)

  return (
    <>
      <style>{SLIDE_CSS}</style>
      <div ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxHeight: 360, overflowY: 'auto' }}>
        {visibles.map((ev) => {
          if (ev.tipo === 'critica') {
            return (
              <div key={ev.id} className="log-card">
                <CriticaCard score={ev.score!} aprobado={ev.aprobado!} texto={ev.texto} />
              </div>
            )
          }
          if (ev.tipo === 'fase') {
            return (
              <div key={ev.id} className="log-card" style={{ padding: '0.5rem 0' }}>
                <SpinnerFase texto={ev.texto} />
              </div>
            )
          }
          if (ev.tipo === 'error') {
            return (
              <div
                key={ev.id}
                className="log-card"
                style={{ background: '#2a0a0a', border: '1px solid var(--red)', borderRadius: 10, padding: '0.75rem 1rem', fontSize: '0.88rem', color: 'var(--red)' }}
              >
                {ev.texto}
              </div>
            )
          }
          return (
            <div key={ev.id} className="log-card" style={{ fontSize: '0.9rem', color: 'var(--text-dim)', paddingLeft: '0.25rem' }}>
              {ev.texto}
            </div>
          )
        })}
      </div>
    </>
  )
}
