import { useEffect, useRef } from 'react';

/**
 * Aviso de que los datos del negocio han cambiado fuera de la pantalla que se está viendo.
 *
 * El asistente flota sobre cualquier pantalla, así que cuando registra, corrige o elimina
 * algo, la tabla que queda debajo sigue enseñando lo de antes. En vez de que el chat tenga
 * que conocer las pantallas, avisa por aquí y cada listado decide recargarse.
 */
const EVENTO = 'datos-del-negocio-actualizados';

/**
 * Las herramientas que escriben se llaman registrar_*, actualizar_* y eliminar_*, frente a
 * las de consulta (buscar_*, listar_*, consultar_*). Se mira el prefijo y no una lista
 * cerrada para que una herramienta nueva que siga la convención no haya que añadirla aquí.
 */
const PREFIJOS_QUE_ESCRIBEN = ['registrar_', 'actualizar_', 'eliminar_'];

export const huboEscritura = (acciones = []) =>
  acciones.some((accion) =>
    PREFIJOS_QUE_ESCRIBEN.some((prefijo) => accion.startsWith(prefijo))
  );

export const avisarDatosActualizados = () => {
  window.dispatchEvent(new Event(EVENTO));
};

/**
 * Recarga la pantalla cuando el asistente cambia algo.
 *
 * La función de recarga se guarda en una referencia para suscribirse una sola vez: las
 * pantallas la redefinen en cada render y si no, se ataría y desataría el oyente sin parar.
 */
export const useDatosActualizados = (recargar) => {
  const ultima = useRef(recargar);
  ultima.current = recargar;

  useEffect(() => {
    const manejar = () => ultima.current();
    window.addEventListener(EVENTO, manejar);
    return () => window.removeEventListener(EVENTO, manejar);
  }, []);
};
