import { useEffect, useRef } from 'react'

interface Props {
  logs: string[]
}

export default function LogStream({ logs }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight
  }, [logs])

  if (logs.length === 0) return null

  return (
    <div
      ref={ref}
      style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        padding: '0.75rem 1rem',
        fontFamily: 'var(--mono)',
        fontSize: '0.78rem',
        color: 'var(--text-dim)',
        maxHeight: 200,
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      {logs.map((l, i) => (
        <div key={i} style={{ lineHeight: 1.5 }}>
          {l}
        </div>
      ))}
    </div>
  )
}
