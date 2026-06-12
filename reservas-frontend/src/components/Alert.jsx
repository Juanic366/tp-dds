export default function Alert({ type = 'error', message, onClose }) {
  if (!message) return null

  const icons = {
    error: '✗',
    success: '✓',
    warning: '⚠',
    info: 'ℹ',
  }

  return (
    <div className={`alert alert-${type}`} style={{ marginBottom: '1rem' }}>
      <span>{icons[type]}</span>
      <span style={{ flex: 1 }}>{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          style={{ background: 'none', color: 'inherit', padding: 0, cursor: 'pointer', fontSize: '1rem' }}
        >
          ×
        </button>
      )}
    </div>
  )
}
