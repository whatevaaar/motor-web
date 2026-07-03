export type Evento =
  | { type: 'log'; mensaje: string }
  | { type: 'progreso'; iter: number; max_iter: number; fase: string }
  | { type: 'frames'; iter: number; inicio: string; mitad: string; final: string }
  | { type: 'critica'; iter: number; score: number; aprobado: boolean; feedback: string }
  | { type: 'error_render'; iter: number; mensaje: string }
  | { type: 'video'; nombre: string }
  | { type: 'fin'; exito?: boolean }
  | { type: 'error'; mensaje: string }

export async function iniciarGeneracion(
  descripcion: string,
  opciones: { duracion?: number; max_iter?: number; umbral?: number } = {},
): Promise<string> {
  const res = await fetch('/api/generar', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ descripcion, duracion: 10, max_iter: 4, umbral: 7, ...opciones }),
  })
  if (!res.ok) throw new Error(`Error ${res.status}: ${await res.text()}`)
  const data = await res.json()
  return data.job_id as string
}

export function conectarStream(jobId: string, onEvento: (e: Evento) => void): EventSource {
  const es = new EventSource(`/api/stream/${jobId}`)
  es.onmessage = (e) => {
    try { onEvento(JSON.parse(e.data) as Evento) } catch { /* ignorar */ }
  }
  return es
}

export function urlArchivo(nombre: string): string {
  return `/api/archivo/${nombre}`
}
