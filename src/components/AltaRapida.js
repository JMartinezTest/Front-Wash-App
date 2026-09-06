import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import SelectorBuscable from './SelectorBuscable';
import { apiService } from '../api/apiService';

/** Parte un texto libre en nombre y apellido: "Pedro Ramírez" -> ["Pedro", "Ramírez"] */
const partirNombre = (texto = '') => {
  const partes = texto.trim().split(/\s+/);
  return [partes[0] || '', partes.slice(1).join(' ')];
};

/**
 * Altas rapidas desde el formulario de lavado.
 *
 * Solo piden lo imprescindible; el resto de datos se completa despues desde la
 * pantalla del catalogo. Al guardar devuelven el registro creado para dejarlo
 * seleccionado sin perder lo que ya habia en el formulario.
 */

export const AltaCliente = ({ textoInicial = '', onCreado, onCerrar }) => {
  const [nombreIni, apellidoIni] = partirNombre(textoInicial);
  const [datos, setDatos] = useState({
    name: nombreIni, lastName: apellidoIni, nit: '', phoneNumber: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cambiar = (e) => setDatos((p) => ({ ...p, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError(''); setGuardando(true);
    try {
      onCreado(await apiService.registerClient(datos));
    } catch (err) {
      setError(err.message || 'No se pudo crear el cliente.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo="Nuevo cliente" subtitulo="Se seleccionará al guardarlo." onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="ac-name">Nombre</label>
            <input id="ac-name" name="name" value={datos.name} onChange={cambiar} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="ac-lastName">Apellido</label>
            <input id="ac-lastName" name="lastName" value={datos.lastName} onChange={cambiar} required />
          </div>
          <div className="field">
            <label htmlFor="ac-nit">NIT <span className="field-opcional">opcional</span></label>
            <input id="ac-nit" name="nit" value={datos.nit} onChange={cambiar} />
          </div>
          <div className="field">
            <label htmlFor="ac-phone">Teléfono <span className="field-opcional">opcional</span></label>
            <input id="ac-phone" name="phoneNumber" type="tel" value={datos.phoneNumber} onChange={cambiar} />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear cliente'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

/**
 * Alta de vehiculo. Si se le pasa `cliente` queda fijado (asi ocurre al crearlo
 * desde el formulario de lavado); si no, se elige dentro de la propia ventana.
 */
export const AltaVehiculo = ({ textoInicial = '', cliente, onCreado, onCerrar }) => {
  const [datos, setDatos] = useState({
    licencePlate: textoInicial.toUpperCase(), make: '', color: '',
    clientId: cliente?.id || '',
  });
  const [clientes, setClientes] = useState(cliente ? [cliente] : []);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  // Solo hace falta la lista cuando el propietario aun no esta decidido.
  useEffect(() => {
    if (cliente) return;
    apiService.getClients()
      .then((d) => setClientes(Array.isArray(d) ? d : []))
      .catch(() => setError('No se pudieron cargar los clientes.'));
  }, [cliente]);

  const cambiar = (e) => setDatos((p) => ({ ...p, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    if (!datos.clientId) { setError('Elige el cliente propietario.'); return; }
    setError(''); setGuardando(true);
    try {
      onCreado(await apiService.registerCar(datos));
    } catch (err) {
      setError(err.message || 'No se pudo crear el vehículo.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal
      titulo="Nuevo vehículo"
      subtitulo={cliente
        ? `Se registrará a nombre de ${cliente.name} ${cliente.lastName}.`
        : 'Cada vehículo pertenece a un cliente.'}
      onCerrar={onCerrar}
    >
      <form onSubmit={enviar}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-grid">
            {!cliente && (
            <div className="field">
              <label htmlFor="av-cliente">Cliente propietario</label>
              <SelectorBuscable
                id="av-cliente"
                opciones={clientes.map((c) => ({
                  valor: c.id,
                  etiqueta: `${c.name} ${c.lastName}`,
                  detalle: c.nit ? `NIT ${c.nit}` : undefined,
                }))}
                valor={datos.clientId}
                onChange={(v) => setDatos((p) => ({ ...p, clientId: v }))}
                placeholder="Selecciona un cliente"
                buscarPlaceholder="Buscar por nombre o NIT…"
                vacio="Todavía no hay clientes"
              />
            </div>
          )}
          <div className="field">
            <label htmlFor="av-placa">Placa</label>
            <input id="av-placa" name="licencePlate" value={datos.licencePlate} onChange={cambiar} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="av-marca">Marca</label>
            <input id="av-marca" name="make" value={datos.make} onChange={cambiar} required />
          </div>
          <div className="field">
            <label htmlFor="av-color">Color <span className="field-opcional">opcional</span></label>
            <input id="av-color" name="color" value={datos.color} onChange={cambiar} />
          </div>
        
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear vehículo'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const AltaEmpleado = ({ textoInicial = '', onCreado, onCerrar }) => {
  const [nombreIni, apellidoIni] = partirNombre(textoInicial);
  const [datos, setDatos] = useState({
    name: nombreIni, lastName: apellidoIni, position: '', phoneNumber: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cambiar = (e) => setDatos((p) => ({ ...p, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError(''); setGuardando(true);
    try {
      onCreado(await apiService.registerEmployee(datos));
    } catch (err) {
      setError(err.message || 'No se pudo crear el empleado.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo="Nuevo empleado" subtitulo="Se seleccionará al guardarlo." onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="ae-name">Nombre</label>
            <input id="ae-name" name="name" value={datos.name} onChange={cambiar} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="ae-lastName">Apellido</label>
            <input id="ae-lastName" name="lastName" value={datos.lastName} onChange={cambiar} required />
          </div>
          <div className="field">
            <label htmlFor="ae-position">Cargo <span className="field-opcional">opcional</span></label>
            <input id="ae-position" name="position" value={datos.position} onChange={cambiar} />
          </div>
          <div className="field">
            <label htmlFor="ae-phone">Teléfono <span className="field-opcional">opcional</span></label>
            <input id="ae-phone" name="phoneNumber" type="tel" value={datos.phoneNumber} onChange={cambiar} />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear empleado'}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export const AltaServicio = ({ textoInicial = '', onCreado, onCerrar }) => {
  const [datos, setDatos] = useState({
    name: textoInicial, description: '', price: '', duration: '',
  });
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');

  const cambiar = (e) => setDatos((p) => ({ ...p, [e.target.name]: e.target.value }));

  const enviar = async (e) => {
    e.preventDefault();
    setError(''); setGuardando(true);
    try {
      onCreado(await apiService.registerService({ ...datos, price: Number(datos.price) || 0 }));
    } catch (err) {
      setError(err.message || 'No se pudo crear el servicio.');
    } finally {
      setGuardando(false);
    }
  };

  return (
    <Modal titulo="Nuevo servicio" subtitulo="Define su precio y duración." onCerrar={onCerrar}>
      <form onSubmit={enviar}>
        {error && <div className="alert alert--error">{error}</div>}
        <div className="form-grid">
          <div className="field">
            <label htmlFor="as-name">Nombre</label>
            <input id="as-name" name="name" value={datos.name} onChange={cambiar} required autoFocus />
          </div>
          <div className="field">
            <label htmlFor="as-price">Precio</label>
            <input id="as-price" name="price" type="number" min="0" step="0.01"
                   value={datos.price} onChange={cambiar} required />
          </div>
          <div className="field">
            <label htmlFor="as-duration">Duración <span className="field-opcional">opcional</span></label>
            <input id="as-duration" name="duration" value={datos.duration} onChange={cambiar}
                   placeholder="Ej. 30 min" />
          </div>
          <div className="field field--full">
            <label htmlFor="as-desc">Descripción <span className="field-opcional">opcional</span></label>
            <textarea id="as-desc" name="description" rows={2} value={datos.description} onChange={cambiar} />
          </div>
        </div>
        <div className="form-actions">
          <button type="button" className="btn btn--ghost" onClick={onCerrar}>Cancelar</button>
          <button type="submit" className="btn btn--primary" disabled={guardando}>
            {guardando ? 'Creando…' : 'Crear servicio'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
