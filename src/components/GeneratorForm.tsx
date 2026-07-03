import { useState } from 'react'

interface Props {
  onSubmit: (descripcion: string) => void
  corriendo: boolean
}

export default function GeneratorForm({ onSubmit, corriendo }: Props) {
  const [texto, setTexto] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (texto.trim() && !corriendo) onSubmit(texto.trim())
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <textarea
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        placeholder="Describe lo que quieres ver... un pato en el mar durante tormenta eléctrica"
        rows={3}
        style={{ width: '100%' }}
        disabled={corriendo}
      />
      <button
        type="submit"
        disabled={corriendo || !texto.trim()}
        style={{ background: 'var(--accent)', color: '#fff', alignSelf: 'flex-end' }}
      >
        {corriendo ? 'Generando...' : 'Generar'}
      </button>
    </form>
  )
}
