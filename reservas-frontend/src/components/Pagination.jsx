export default function Pagination({ page, totalPages, total, limit, onChange }) {
  if (totalPages <= 1) return null

  const from = (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  function pages() {
    const arr = []
    const delta = 2
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
      arr.push(i)
    }
    return arr
  }

  return (
    <div className="pagination">
      <span>Mostrando {from}–{to} de {total}</span>
      <div className="pagination-buttons">
        <button
          className="page-btn"
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
        >‹</button>

        {pages().map(p => (
          <button
            key={p}
            className={`page-btn${p === page ? ' active' : ''}`}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ))}

        <button
          className="page-btn"
          disabled={page >= totalPages}
          onClick={() => onChange(page + 1)}
        >›</button>
      </div>
    </div>
  )
}
