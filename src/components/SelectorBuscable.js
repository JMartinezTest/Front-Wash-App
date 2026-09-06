import React, { useState, useRef, useEffect, useMemo } from 'react';
import { FaSearch, FaChevronDown, FaPlus, FaCheck } from 'react-icons/fa';
import './SelectorBuscable.css';

const normalizar = (valor) =>
  String(valor ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();

/**
 * Selector con busqueda para listas largas.
 *
 * Sustituye al <select> nativo, donde encontrar un cliente entre cientos obliga a
 * recorrer la lista a ojo. Ademas ofrece crear el registro que falta sin salir del
 * formulario, mediante `onCrear`.
 *
 * `opciones`: [{ valor, etiqueta, detalle }]
 */
const SelectorBuscable = ({
  id,
  opciones = [],
  valor,
  onChange,
  placeholder = 'Selecciona…',
  buscarPlaceholder = 'Escribe para buscar…',
  onCrear,
  textoCrear = 'Crear',
  vacio = 'No hay opciones disponibles',
  deshabilitado = false,
  deshabilitadoPista,
}) => {
  const [abierto, setAbierto] = useState(false);
  const [busqueda, setBusqueda] = useState('');
  const [resaltada, setResaltada] = useState(0);
  const contenedor = useRef(null);
  const campo = useRef(null);

  const seleccionada = opciones.find((o) => o.valor === valor);

  const filtradas = useMemo(() => {
    const termino = normalizar(busqueda);
    if (!termino) return opciones;
    const palabras = termino.split(/\s+/);
    return opciones.filter((o) => {
      const texto = normalizar(`${o.etiqueta} ${o.detalle || ''}`);
      return palabras.every((p) => texto.includes(p));
    });
  }, [opciones, busqueda]);

  // Cerrar al pulsar fuera
  useEffect(() => {
    if (!abierto) return undefined;
    const alPulsarFuera = (e) => {
      if (contenedor.current && !contenedor.current.contains(e.target)) setAbierto(false);
    };
    document.addEventListener('mousedown', alPulsarFuera);
    return () => document.removeEventListener('mousedown', alPulsarFuera);
  }, [abierto]);

  useEffect(() => {
    if (abierto) {
      setBusqueda('');
      setResaltada(0);
      campo.current?.focus();
    }
  }, [abierto]);

  const elegir = (opcion) => {
    onChange(opcion.valor);
    setAbierto(false);
  };

  const alTeclear = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setResaltada((i) => Math.min(i + 1, filtradas.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setResaltada((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtradas[resaltada]) elegir(filtradas[resaltada]);
      else if (onCrear && busqueda.trim()) { setAbierto(false); onCrear(busqueda.trim()); }
    } else if (e.key === 'Escape') {
      setAbierto(false);
    }
  };

  return (
    <div className="selector" ref={contenedor}>
      <button
        type="button"
        id={id}
        className={`selector__control ${abierto ? 'selector__control--abierto' : ''}`}
        onClick={() => !deshabilitado && setAbierto((a) => !a)}
        disabled={deshabilitado}
        aria-haspopup="listbox"
        aria-expanded={abierto}
      >
        <span className={`selector__valor ${seleccionada ? '' : 'selector__valor--vacio'}`}>
          {seleccionada ? (
            <>
              {seleccionada.etiqueta}
              {seleccionada.detalle && <span className="selector__detalle">{seleccionada.detalle}</span>}
            </>
          ) : (
            deshabilitado && deshabilitadoPista ? deshabilitadoPista : placeholder
          )}
        </span>
        <FaChevronDown className="selector__flecha" />
      </button>

      {abierto && (
        <div className="selector__panel">
          <div className="selector__buscador">
            <FaSearch className="selector__buscador-icono" />
            <input
              ref={campo}
              type="text"
              className="selector__buscador-campo"
              value={busqueda}
              onChange={(e) => { setBusqueda(e.target.value); setResaltada(0); }}
              onKeyDown={alTeclear}
              placeholder={buscarPlaceholder}
            />
          </div>

          <ul className="selector__lista" role="listbox">
            {filtradas.length > 0 ? (
              filtradas.map((o, i) => (
                <li key={o.valor}>
                  <button
                    type="button"
                    className={`selector__opcion ${i === resaltada ? 'selector__opcion--resaltada' : ''}`}
                    onClick={() => elegir(o)}
                    onMouseEnter={() => setResaltada(i)}
                    role="option"
                    aria-selected={o.valor === valor}
                  >
                    <span className="selector__opcion-texto">
                      <span className="selector__opcion-etiqueta">{o.etiqueta}</span>
                      {o.detalle && <span className="selector__opcion-detalle">{o.detalle}</span>}
                    </span>
                    {o.valor === valor && <FaCheck className="selector__marca" />}
                  </button>
                </li>
              ))
            ) : (
              <li className="selector__sin-resultados">
                {opciones.length === 0 ? vacio : `Sin coincidencias para «${busqueda}»`}
              </li>
            )}
          </ul>

          {onCrear && (
            <button
              type="button"
              className="selector__crear"
              onClick={() => { setAbierto(false); onCrear(busqueda.trim()); }}
            >
              <FaPlus />
              {busqueda.trim() ? `${textoCrear} «${busqueda.trim()}»` : textoCrear}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default SelectorBuscable;
