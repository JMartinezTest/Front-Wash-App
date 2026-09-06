/** Formatos compartidos, para que las cifras y fechas se vean igual en toda la app. */

export const dinero = (valor) =>
  `$${Number(valor || 0).toFixed(2)}`;

export const fechaCorta = (valor) => {
  if (!valor) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleDateString('es-BO', { day: '2-digit', month: 'short', year: 'numeric' });
};

export const fechaHora = (valor) => {
  if (!valor) return null;
  const d = new Date(valor);
  return Number.isNaN(d.getTime())
    ? null
    : d.toLocaleString('es-BO', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export const esHoy = (valor) => {
  if (!valor) return false;
  const d = new Date(valor);
  const hoy = new Date();
  return d.getDate() === hoy.getDate()
    && d.getMonth() === hoy.getMonth()
    && d.getFullYear() === hoy.getFullYear();
};
