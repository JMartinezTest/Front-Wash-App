import React from 'react';

/** Cabecera + estado de carga o error, para que todas las pantallas se vean igual mientras cargan. */
const PageState = ({ titulo, subtitulo, cargando, error }) => (
  <>
    <div className="page-header">
      <div className="page-header__titles">
        <h1>{titulo}</h1>
        {subtitulo && <p className="page-header__subtitle">{subtitulo}</p>}
      </div>
    </div>

    {cargando && (
      <div className="card">
        <div className="state">
          <span className="spinner" />
          <p className="state__text">Cargando…</p>
        </div>
      </div>
    )}

    {error && <div className="alert alert--error">{error}</div>}
  </>
);

export default PageState;
