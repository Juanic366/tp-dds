const ESTADOS = {
  pendiente:  { label: 'Pendiente',  dot: '●' },
  aprobada:   { label: 'Aprobada',   dot: '●' },
  cancelada:  { label: 'Cancelada',  dot: '●' },
  rechazada:  { label: 'Rechazada',  dot: '●' },
}

export default function StatusBadge({ estado }) {
  const info = ESTADOS[estado] || { label: estado, dot: '●' }
  return (
    <span className={`badge badge-${estado}`}>
      {info.dot} {info.label}
    </span>
  )
}
