import { urlArchivo } from '../api'

interface Props {
  nombre: string | null
}

export default function VideoPlayer({ nombre }: Props) {
  if (!nombre) return null

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <h2 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text)' }}>Video final</h2>
      <video
        src={urlArchivo(nombre)}
        controls
        autoPlay
        loop
        playsInline
        style={{ width: '100%', borderRadius: 12, background: '#000', display: 'block' }}
      />
      <a
        href={urlArchivo(nombre)}
        download
        style={{
          display: 'inline-block',
          textAlign: 'center',
          padding: '0.6rem 1rem',
          background: 'var(--accent-dim)',
          color: 'var(--accent)',
          borderRadius: 8,
          fontSize: '0.9rem',
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Descargar video
      </a>
    </div>
  )
}
