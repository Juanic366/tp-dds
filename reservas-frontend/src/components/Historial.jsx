const ACTION_CONFIG = {
  creacion:   { color: 'var(--color-info)',    bg: 'var(--color-info-dim)',    icon: '✦' },
  edicion:    { color: 'var(--color-warning)',  bg: 'var(--color-warning-dim)', icon: '✎' },
  aprobacion: { color: 'var(--color-success)',  bg: 'var(--color-success-dim)', icon: '✓' },
  rechazo:    { color: 'var(--color-danger)',   bg: 'var(--color-danger-dim)',  icon: '✗' },
  cancelacion:{ color: 'var(--color-text-muted)', bg: 'rgba(139,144,168,0.15)', icon: '○' },
}

function formatDateTime(str) {
  if (!str) return ''
  return new Date(str).toLocaleString('es-AR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  })
}

export default function Historial({ items = [], loading }) {
  if (loading) {
    return <div className="loading-spinner"><div className="spinner" /></div>
  }

  if (!items.length) {
    return (
      <div className="empty-state" style={{ padding: '1.5rem' }}>
        <span className="empty-icon">📜</span>
        <span className="empty-title">Sin historial</span>
      </div>
    )
  }

  return (
    <div className="timeline">
      {items.map((item, idx) => {
        const cfg = ACTION_CONFIG[item.accion] || ACTION_CONFIG.edicion
        return (
          <div key={item.id || idx} className="timeline-item">
            <div className="timeline-line" />
            <div
              className="timeline-dot"
              style={{ background: cfg.bg, color: cfg.color }}
            >
              {cfg.icon}
            </div>
            <div className="timeline-content">
              <div className="timeline-action" style={{ color: cfg.color }}>
                {item.accion.charAt(0).toUpperCase() + item.accion.slice(1)}
              </div>
              <div className="timeline-meta">
                {item.usuario?.nombre || item.usuarioId} · {formatDateTime(item.fechaHora)}
              </div>
              {(item.valorAnterior || item.valorNuevo) && (
                <div className="timeline-values">
                  {item.valorAnterior && (
                    <div>
                      <span style={{ color: 'var(--color-danger)' }}>− Antes: </span>
                      {typeof item.valorAnterior === 'object'
                        ? JSON.stringify(item.valorAnterior)
                        : item.valorAnterior}
                    </div>
                  )}
                  {item.valorNuevo && (
                    <div>
                      <span style={{ color: 'var(--color-success)' }}>+ Ahora: </span>
                      {typeof item.valorNuevo === 'object'
                        ? JSON.stringify(item.valorNuevo)
                        : item.valorNuevo}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
