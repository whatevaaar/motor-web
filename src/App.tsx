import { useState, useCallback, useRef } from 'react'
import { iniciarGeneracion, conectarStream, type Evento } from './api'
import GeneratorForm from './components/GeneratorForm'
import ProgressBar from './components/ProgressBar'
import LogStream from './components/LogStream'
import FrameViewer, { type IterFrames } from './components/FrameViewer'
import VideoPlayer from './components/VideoPlayer'

export default function App() {
  const [corriendo, setCorriendo] = useState(false)
  const [logs, setLogs] = useState<string[]>([])
  const [progreso, setProgreso] = useState({ iter: 0, maxIter: 4, fase: '' })
  const [iteraciones, setIteraciones] = useState<IterFrames[]>([])
  const [videoNombre, setVideoNombre] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const esRef = useRef<EventSource | null>(null)

  const agregarLog = useCallback((msg: string) => {
    setLogs((prev) => [...prev.slice(-200), msg])
  }, [])

  const iniciar = useCallback(async (descripcion: string) => {
    esRef.current?.close()
    setCorriendo(true)
    setLogs([])
    setProgreso({ iter: 0, maxIter: 4, fase: '' })
    setIteraciones([])
    setVideoNombre(null)
    setError(null)

    try {
      const jobId = await iniciarGeneracion(descripcion)

      const es = conectarStream(jobId, (ev: Evento) => {
        switch (ev.type) {
          case 'log':
            agregarLog(ev.mensaje)
            break
          case 'progreso':
            setProgreso({ iter: ev.iter, maxIter: ev.max_iter, fase: ev.fase })
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
                it.iter === ev.iter ? { ...it, score: ev.score, aprobado: ev.aprobado, feedback: ev.feedback } : it,
              ),
            )
            agregarLog(`[critica iter ${ev.iter}] Score ${ev.score}/10 — ${ev.feedback}`)
            break
          case 'error_render':
            agregarLog(`[error render iter ${ev.iter}] ${ev.mensaje}`)
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
  }, [agregarLog])

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

      <LogStream logs={logs} />

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
