import React from 'react';

/** Agrupa horas consecutivas en rangos legibles: [8,9,10,18,19] -> "8:00–10:00 y 18:00–19:00". */
export const agruparHoras = (horas) => {
  const rangos = [];
  horas.forEach((h) => {
    const ultimo = rangos[rangos.length - 1];
    if (ultimo && h === ultimo[1] + 1) ultimo[1] = h;
    else rangos.push([h, h]);
  });
  const textos = rangos.map(([a, b]) => (a === b ? `${a}:00` : `${a}:00–${b}:00`));
  if (textos.length <= 1) return textos.join('');
  return `${textos.slice(0, -1).join(', ')} y ${textos[textos.length - 1]}`;
};

/**
 * Previsión de un día en barras: una por franja horaria.
 *
 * El color indica si se espera demanda alta y la altura, la confianza del modelo.
 * Se usa tanto al calcular una predicción como al revisar una guardada.
 */
const PrevisionDia = ({ franjas = [], horaDestacada, onElegirHora, resumen = true }) => {
  const horasAltas = franjas.filter((f) => f.demandaAlta).map((f) => f.hora);

  return (
    <>
      {resumen && (
        <p className="prevision__resumen">
          {horasAltas.length === 0
            ? 'No se espera demanda alta en ninguna franja.'
            : <>Se espera <strong>demanda alta en {horasAltas.length} de {franjas.length} franjas</strong>: {agruparHoras(horasAltas)}.</>}
        </p>
      )}

      <ul className="prevision__franjas">
        {franjas.map((f) => (
          <li key={f.hora}>
            <button
              type="button"
              className={`franja ${f.demandaAlta ? 'franja--alta' : ''} ${f.hora === horaDestacada ? 'franja--elegida' : ''}`}
              onClick={() => onElegirHora?.(f.hora)}
              disabled={!onElegirHora}
              title={`${f.hora}:00 · ${f.demandaAlta ? 'demanda alta' : 'demanda normal'} · ${f.confianza}% de confianza`}
            >
              <span className="franja__barra" style={{ height: `${Math.max(12, f.confianza)}%` }} />
              <span className="franja__hora">{f.hora}</span>
            </button>
          </li>
        ))}
      </ul>

      <div className="prevision__leyenda">
        <span><i className="punto punto--alta" /> Demanda alta</span>
        <span><i className="punto" /> Demanda normal</span>
        <span className="prevision__nota">La altura indica la confianza del modelo.</span>
      </div>
    </>
  );
};

export default PrevisionDia;
