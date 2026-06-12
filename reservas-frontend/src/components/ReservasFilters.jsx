import { useState, useEffect } from 'react'
import { aulasService } from '../services/aulasService'

export default function ReservasFilters({ filtros, onChange, onReset }) {
  const [aulas, setAulas] = useState([])

  useEffect(() => {
    aulasService.listar().then(data => {
      setAulas(Array.isArray(data) ? data : data.aulas || [])
    }).catch(() => {})
  }, [])

  function handleChange(key, value) {
    onChange({ ...filtros, [key]: value, page: 1 })
  }

  return (
    <div className="filters-bar">
      <div className="filter-group">
        <span className="filter-label">Fecha</span>
        <input
          type="date"
          value={filtros.fecha || ''}
          onChange={e => handleChange('fecha', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <span className="filter-label">Estado</span>
        <select
          value={filtros.estado || ''}
          onChange={e => handleChange('estado', e.target.value)}
        >
          <option value="">Todos</option>
          <option value="pendiente">Pendiente</option>
          <option value="aprobada">Aprobada</option>
          <option value="cancelada">Cancelada</option>
          <option value="rechazada">Rechazada</option>
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">Aula</span>
        <select
          value={filtros.aulaId || ''}
          onChange={e => handleChange('aulaId', e.target.value)}
        >
          <option value="">Todas</option>
          {aulas.map(a => (
            <option key={a.id} value={a.id}>{a.nombre}</option>
          ))}
        </select>
      </div>

      <div className="filter-group" style={{ minWidth: 180 }}>
        <span className="filter-label">Buscar motivo</span>
        <input
          type="text"
          placeholder="Clase, reunión..."
          value={filtros.q || ''}
          onChange={e => handleChange('q', e.target.value)}
        />
      </div>

      <div className="filter-group">
        <span className="filter-label">Ordenar por</span>
        <select
          value={filtros.sortBy || 'createdAt'}
          onChange={e => handleChange('sortBy', e.target.value)}
        >
          <option value="createdAt">Fecha creación</option>
          <option value="fecha">Fecha reserva</option>
          <option value="estado">Estado</option>
        </select>
      </div>

      <div className="filter-group">
        <span className="filter-label">Orden</span>
        <select
          value={filtros.order || 'desc'}
          onChange={e => handleChange('order', e.target.value)}
        >
          <option value="desc">↓ Desc</option>
          <option value="asc">↑ Asc</option>
        </select>
      </div>

      <button className="btn btn-secondary btn-sm" onClick={onReset} style={{ alignSelf: 'flex-end' }}>
        Limpiar
      </button>
    </div>
  )
}
