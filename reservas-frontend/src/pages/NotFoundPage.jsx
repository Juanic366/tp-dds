import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="not-found-page">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Página no encontrada</h1>
      <p className="not-found-desc">
        La ruta que estás buscando no existe o fue movida.
      </p>
      <Link to="/reservas" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
        Ir al inicio
      </Link>
    </div>
  )
}
