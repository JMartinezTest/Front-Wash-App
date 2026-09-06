import React, { useState, useEffect, useMemo } from 'react';
import { FaChevronLeft, FaChevronRight, FaSearch, FaTimes } from 'react-icons/fa';
import './DataTable.css';

const OPCIONES_POR_PAGINA = [10, 25, 50, 100];

/** Minusculas y sin acentos, para que "Perez" encuentre "Pérez". */
const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Texto por el que se puede buscar una fila.
 *
 * Cada columna puede declarar `search` cuando su contenido no sale directo del
 * objeto (por ejemplo cuando resuelve un nombre a partir de un id). Si no lo
 * declara, se usa el valor crudo del campo.
 */
const textoBuscable = (item, columns) =>
  columns
    .map((c) => {
      if (typeof c.search === 'function') return c.search(item);
      const valor = item[c.key];
      return typeof valor === 'object' ? '' : valor;
    })
    .map(normalizar)
    .join(' ');

/** Numeros de pagina a mostrar, con elipsis cuando hay muchas: 1 … 8 9 10 … 20 */
const paginasVisibles = (actual, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const paginas = new Set([1, total, actual, actual - 1, actual + 1]);
  const ordenadas = [...paginas].filter((n) => n >= 1 && n <= total).sort((a, b) => a - b);

  const conHuecos = [];
  ordenadas.forEach((n, i) => {
    if (i > 0 && n - ordenadas[i - 1] > 1) conHuecos.push('…');
    conHuecos.push(n);
  });
  return conHuecos;
};

/**
 * Tabla de datos comun a todos los listados, con busqueda y paginacion.
 *
 * Ambas se resuelven en el navegador: los endpoints devuelven la coleccion
 * completa y aqui solo se filtra y se recorta lo que se muestra.
 */
const DataTable = ({
  columns = [],
  data = [],
  emptyMessage = 'No hay datos disponibles',
  emptyHint,
  emptyAction,
  onDelete,
  onEdit,
  pageSize = 10,
  itemLabel = 'registros',
  searchPlaceholder = 'Buscar…',
  searchable = true,
  onRowClick,
}) => {
  const hayAcciones = Boolean(onDelete || onEdit);
  const totalColumnas = columns.length + (hayAcciones ? 1 : 0);
  const filas = useMemo(() => (Array.isArray(data) ? data : []), [data]);

  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);
  const [porPagina, setPorPagina] = useState(pageSize);

  const filtradas = useMemo(() => {
    const termino = normalizar(busqueda);
    if (!termino) return filas;
    // Cada palabra debe aparecer en algun campo: "juan abc" encuentra al cliente
    // Juan con el vehiculo ABC-123.
    const palabras = termino.split(/\s+/);
    return filas.filter((item) => {
      const texto = textoBuscable(item, columns);
      return palabras.every((palabra) => texto.includes(palabra));
    });
  }, [filas, busqueda, columns]);

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / porPagina));

  // Al filtrar o cambiar el tamanio, la pagina actual puede quedar fuera de rango.
  useEffect(() => {
    setPagina((actual) => Math.min(actual, totalPaginas));
  }, [totalPaginas]);

  const desde = (pagina - 1) * porPagina;
  const visibles = filtradas.slice(desde, desde + porPagina);
  const hayVariasPaginas = filtradas.length > porPagina;
  const buscando = busqueda.trim().length > 0;

  const irA = (n) => setPagina(Math.min(Math.max(1, n), totalPaginas));

  const limpiar = () => { setBusqueda(''); setPagina(1); };

  return (
    <div className="tabla-envoltura">
      {searchable && (
        <div className="tabla-barra">
          <div className="tabla-buscador">
            <FaSearch className="tabla-buscador__icono" />
            <input
              type="search"
              className="tabla-buscador__campo"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setPagina(1); }}
              placeholder={searchPlaceholder}
              aria-label={searchPlaceholder}
            />
            {buscando && (
              <button
                type="button"
                className="tabla-buscador__limpiar"
                onClick={limpiar}
                aria-label="Limpiar búsqueda"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {buscando && (
            <p className="tabla-barra__conteo">
              {filtradas.length} de {filas.length} {itemLabel}
            </p>
          )}
        </div>
      )}

      <div className="tabla-scroll">
        <table className="tabla">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column.key} className={column.numeric ? 'celda-numero' : undefined}>
                  {column.title}
                </th>
              ))}
              {hayAcciones && <th className="celda-acciones">Acciones</th>}
            </tr>
          </thead>
          <tbody>
            {visibles.length > 0 ? (
              visibles.map((item) => {
                const clave = item.id || item.licencePlate;
                return (
                  <tr
                    key={clave}
                    className={onRowClick ? 'fila-pulsable' : undefined}
                    onClick={onRowClick ? () => onRowClick(item) : undefined}
                  >
                    {columns.map((column) => (
                      <td
                        key={`${clave}-${column.key}`}
                        className={column.numeric ? 'celda-numero' : undefined}
                      >
                        {column.render ? column.render(item) : item[column.key]}
                      </td>
                    ))}
                    {hayAcciones && (
                      <td className="celda-acciones" onClick={(e) => e.stopPropagation()}>
                        {onEdit && (
                          <button onClick={() => onEdit(item)} className="btn btn--secondary btn--sm">
                            Editar
                          </button>
                        )}
                        {onDelete && (
                          <button onClick={() => onDelete(item)} className="btn btn--danger btn--sm">
                            Eliminar
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr className="tabla-vacia">
                <td colSpan={totalColumnas}>
                  {buscando ? (
                    <div className="state">
                      <span className="state__icon"><FaSearch /></span>
                      <p className="state__title">Sin resultados para «{busqueda.trim()}»</p>
                      <p className="state__text">Prueba con otro término o revisa la ortografía.</p>
                      <button type="button" className="btn btn--secondary" onClick={limpiar}>
                        Limpiar búsqueda
                      </button>
                    </div>
                  ) : (
                    <div className="state">
                      <p className="state__title">{emptyMessage}</p>
                      {emptyHint && <p className="state__text">{emptyHint}</p>}
                      {emptyAction}
                    </div>
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {filtradas.length > 0 && (
        <div className="paginacion">
          <p className="paginacion__resumen">
            Mostrando <strong>{desde + 1}</strong>–<strong>{Math.min(desde + porPagina, filtradas.length)}</strong>
            {' '}de <strong>{filtradas.length}</strong> {itemLabel}
          </p>

          <div className="paginacion__controles">
            {filtradas.length > OPCIONES_POR_PAGINA[0] && (
              <label className="paginacion__tamano">
                Filas
                <select
                  className="select"
                  value={porPagina}
                  onChange={(e) => { setPorPagina(Number(e.target.value)); setPagina(1); }}
                >
                  {OPCIONES_POR_PAGINA.map((n) => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
              </label>
            )}

            {hayVariasPaginas && (
              <nav className="paginacion__paginas" aria-label="Paginación">
                <button
                  className="paginacion__flecha"
                  onClick={() => irA(pagina - 1)}
                  disabled={pagina === 1}
                  aria-label="Página anterior"
                >
                  <FaChevronLeft />
                </button>

                {paginasVisibles(pagina, totalPaginas).map((n, i) =>
                  n === '…' ? (
                    <span key={`hueco-${i}`} className="paginacion__hueco">…</span>
                  ) : (
                    <button
                      key={n}
                      className={`paginacion__pagina ${n === pagina ? 'paginacion__pagina--activa' : ''}`}
                      onClick={() => irA(n)}
                      aria-current={n === pagina ? 'page' : undefined}
                    >
                      {n}
                    </button>
                  )
                )}

                <button
                  className="paginacion__flecha"
                  onClick={() => irA(pagina + 1)}
                  disabled={pagina === totalPaginas}
                  aria-label="Página siguiente"
                >
                  <FaChevronRight />
                </button>
              </nav>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
