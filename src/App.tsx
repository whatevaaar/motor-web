import { useState, useCallback, useRef } from 'react'
import { iniciarGeneracion, conectarStream, type Evento } from './api'
import GeneratorForm from './components/GeneratorForm'
import ProgressBar from './components/ProgressBar'
import LogStream, { type LogEvento } from './components/LogStream'
import FrameViewer, { type IterFrames } from './components/FrameViewer'
import VideoPlayer from './components/VideoPlayer'

let _id = 0
const nextId = () => ++_id

export default function App() {
  const [corriendo, setCorriendo] = useState(false)
  const [eventos, setEventos] = useState<LogEvento[]>([])
  const [progreso, setProgreso] = useState({ iter: 0, maxIter: 4, fase: '' })
  const [iteraciones, setIteraciones] = useState<IterFrames[]>([])
  const [videoNombre, setVideoNombre] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const esRef = useRef<EventSource | null>(null)

  const pushLog = useCallback((ev: LogEvento) => {
    setEventos((prev) => [...prev.slice(-50), ev])
  }, [])

  const iniciar = useCallback(async (descripcion: string) => {
    esRef.current?.close()
    setCorriendo(true)
    setEventos([])
    setProgreso({ iter: 0, maxIter: 4, fase: '' })
    setIteraciones([])
    setVideoNombre(null)
    setError(null)

    try {
      const jobId = await iniciarGeneracion(descripcion)

      const es = conectarStream(jobId, (ev: Evento) => {
        switch (ev.type) {
          case 'log':
            pushLog({ tipo: 'log', texto: ev.mensaje, id: nextId() })
            break
          case 'progreso':
            setProgreso({ iter: ev.iter, maxIter: ev.max_iter, fase: ev.fase })
            pushLog({ tipo: 'fase', texto: faseLabel(ev.fase, ev.iter, ev.max_iter), id: nextId() })
            break
          case 'frames':
            setIteraciones((prev) => {
              const idx = prev.findIndex((it) => it.iter === ev.iter)
              const nuevo: IterFrames = { iter: ev.iter, inicio: ev.inicio, mitad: ev.mitad, final: ev.final }
              return idx >= 0 ? prev.map((it, i) => (i === idx ? { ...it, ...nuevo } : it)) : [...prev, nuevo]
            })
            break
          case 'critica':
            setIteraciones((prev) =>
              prev.map((it) =>
                it.iter === ev.iter
                  ? { ...it, score: ev.score, aprobado: ev.aprobado, feedback: ev.feedback }
                  : it,
              ),
            )
            pushLog({
              tipo: 'critica',
              texto: ev.feedback,
              score: ev.score,
              aprobado: ev.aprobado,
              id: nextId(),
            })
            break
          case 'error_render':
            pushLog({ tipo: 'error', texto: `Error render iter ${ev.iter}: ${ev.mensaje}`, id: nextId() })
            break
          case 'video':
            setVideoNombre(ev.nombre)
            break
          case 'error':
            setError(ev.mensaje)
            setCorriendo(false)
            es.close()
            break
          case 'fin':
            setCorriendo(false)
            es.close()
            break
        }
      })

      esRef.current = es
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setCorriendo(false)
    }
  }, [pushLog])

  return (
    <div
      style={{
        maxWidth: 520,
        margin: '0 auto',
        padding: '1.5rem 1rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.5rem',
      }}
    >
      <header>
        <h1 style={{ fontSize: '1.3rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Motor Studio</h1>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: 4 }}>
          Describe una escena. La IA la genera y la critica hasta que quede bien.
        </p>
      </header>

      <GeneratorForm onSubmit={iniciar} corriendo={corriendo} />

      {(corriendo || progreso.iter > 0) && (
        <ProgressBar
          iter={progreso.iter}
          maxIter={progreso.maxIter}
          fase={progreso.fase}
          corriendo={corriendo}
        />
      )}

      <LogStream eventos={eventos} />

      {error && (
        <div
          style={{
            background: '#2a0a0a',
            border: '1px solid var(--red)',
            color: 'var(--red)',
            borderRadius: 10,
            padding: '0.75rem 1rem',
            fontSize: '0.85rem',
          }}
        >
          {error}
        </div>
      )}

      <FrameViewer iteraciones={iteraciones} />
      <VideoPlayer nombre={videoNombre} />
    </div>
  )
}

function faseLabel(fase: string, iter: number, maxIter: number): string {
  const labels: Record<string, string> = {
    generando: `Iter ${iter}/${maxIter} — generando codigo`,
    renderizando: `Iter ${iter}/${maxIter} — renderizando`,
    evaluando: `Iter ${iter}/${maxIter} — el critico evalua`,
    render_final: 'Render final con efectos...',
  }
  return labels[fase] ?? fase
}
