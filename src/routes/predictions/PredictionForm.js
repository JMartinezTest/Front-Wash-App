import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaChartLine, FaBookmark, FaCloudSun, FaCloudRain, FaCloud, FaHistory } from 'react-icons/fa';
import { apiService } from '../../api/apiService';
import PrevisionDia from '../../components/PrevisionDia';
import '../../components/PrevisionDia.css';
import './PredictionForm.css';

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado'];
const DIAS_VISIBLES = {
  Domingo: 'Domingo', Lunes: 'Lunes', Martes: 'Martes', Miercoles: 'Miércoles',
  Jueves: 'Jueves', Viernes: 'Viernes', Sabado: 'Sábado',
};
const CLIMAS = [
  { valor: 'Soleado', icono: <FaCloudSun /> },
  { valor: 'Nublado', icono: <FaCloud /> },
  { valor: 'Lluvioso', icono: <FaCloudRain /> },
];


const HORA_APERTURA = 8;
const HORA_CIERRE = 20;

const PredictionForm = () => {
  const ahora = new Date();

  // El formulario arranca con el momento actual: lo habitual es preguntar por hoy.
  const [condiciones, setCondiciones] = useState({
    diaSemana: DIAS[ahora.getDay()],
    clima: 'Soleado',
    temperatura: 22,
    historialVisitas: 5,
    promocionesActivas: 'No',
  });
  const [horaElegida, setHoraElegida] = useState(
    Math.min(Math.max(ahora.getHours(), HORA_APERTURA), HORA_CIERRE)
  );

  // El clima real del lavadero evita tener que adivinarlo a mano.
  const [climaReal, setClimaReal] = useState(null);
  const [prevision, setPrevision] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');

  useEffect(() => {
    apiService.getWeather()
      .then((c) => {
        setClimaReal(c);
        setCondiciones((p) => ({ ...p, clima: c.clima, temperatura: c.temperatura }));
      })
      .catch(() => setClimaReal(null));  // Sin clima se sigue pudiendo elegir a mano.
  }, []);

  const cambiar = (e) => {
    const { name, value } = e.target;
    setCondiciones((p) => ({ ...p, [name]: value }));
    setPrevision(null);
  };

  const calcular = async (e) => {
    e.preventDefault();
    setError(''); setAviso(''); setCargando(true);
    try {
      const datos = await apiService.forecastDay({
        ...condiciones,
        temperatura: Number(condiciones.temperatura),
        historialVisitas: Number(condiciones.historialVisitas),
        horaInicio: HORA_APERTURA,
        horaFin: HORA_CIERRE,
      });
      setPrevision(datos);
    } catch (err) {
      setError(err.message || 'No se pudo calcular la previsión.');
    } finally {
      setCargando(false);
    }
  };

  // La consulta puntual sí queda registrada, para poder revisarla después.
  const guardarConsulta = async () => {
    setError(''); setAviso(''); setGuardando(true);
    try {
      const r = await apiService.predictDemand({
        ...condiciones,
        hora: horaElegida,
        temperatura: Number(condiciones.temperatura),
        historialVisitas: Number(condiciones.historialVisitas),
      });
      setAviso(`Guardado: a las ${horaElegida}:00 se espera demanda `
        + `${r.prediccion === 'Si' ? 'alta' : 'normal'} (${r.confianza} de confianza). `
        + `Puedes consultarlo en «Historial de predicciones».`);
    } catch (err) {
      setError(err.message || 'No se pudo guardar la consulta.');
    } finally {
      setGuardando(false);
    }
  };

  const franjaElegida = prevision?.franjas.find((f) => f.hora === horaElegida);

  return (
    <>
      <div className="page-header">
        <div className="page-header__titles">
          <h1>Predicción de demanda</h1>
          <p className="page-header__subtitle">
            Estima en qué franjas del día habrá más afluencia, para reforzar personal o lanzar promociones.
          </p>
        </div>
        <div className="page-header__actions">
          <Link to="/prediction-history" className="btn btn--secondary">
            <FaHistory /> Ver historial
          </Link>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}
      {aviso && <div className="alert alert--success">{aviso}</div>}

      <div className="prediccion">
        <form className="card" onSubmit={calcular}>
          <div className="card__header"><h2>Condiciones</h2></div>
          <div className="card__body">
            <div className="form-grid">
              <div className="field">
                <label htmlFor="diaSemana">Día</label>
                <select id="diaSemana" name="diaSemana" value={condiciones.diaSemana} onChange={cambiar}>
                  {DIAS.map((d) => <option key={d} value={d}>{DIAS_VISIBLES[d]}</option>)}
                </select>
              </div>

              <div className="field">
                <label htmlFor="temperatura">Temperatura (°C)</label>
                {/* step="any": la temperatura del servicio meteorológico trae decimales
                    arbitrarios (30.2); con un paso fijo el navegador bloqueaba el envío. */}
                <input
                  id="temperatura" name="temperatura" type="number" min="-50" max="50" step="any"
                  value={condiciones.temperatura} onChange={cambiar} required
                />
              </div>

              <div className="field field--full">
                <span className="field-label">
                  Clima
                  {climaReal && condiciones.clima === climaReal.clima
                    && Number(condiciones.temperatura) === climaReal.temperatura && (
                    <span className="field-opcional">ahora mismo en el lavadero</span>
                  )}
                </span>
                <div className="opciones">
                  {CLIMAS.map((c) => (
                    <button
                      type="button" key={c.valor}
                      className={`opcion ${condiciones.clima === c.valor ? 'opcion--activa' : ''}`}
                      onClick={() => { setCondiciones((p) => ({ ...p, clima: c.valor })); setPrevision(null); }}
                    >
                      {c.icono} {c.valor}
                    </button>
                  ))}
                </div>
              </div>

              <div className="field">
                <label htmlFor="historialVisitas">Visitas previas del cliente</label>
                <input
                  id="historialVisitas" name="historialVisitas" type="number" min="0"
                  value={condiciones.historialVisitas} onChange={cambiar} required
                />
                <span className="field-hint">Cuántas veces ha venido antes.</span>
              </div>

              <div className="field">
                <span className="field-label">¿Hay promoción activa?</span>
                <div className="opciones">
                  {['Si', 'No'].map((v) => (
                    <button
                      type="button" key={v}
                      className={`opcion ${condiciones.promocionesActivas === v ? 'opcion--activa' : ''}`}
                      onClick={() => { setCondiciones((p) => ({ ...p, promocionesActivas: v })); setPrevision(null); }}
                    >
                      {v === 'Si' ? 'Sí' : 'No'}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn--primary" disabled={cargando}>
                <FaChartLine /> {cargando ? 'Calculando…' : 'Ver previsión del día'}
              </button>
            </div>
          </div>
        </form>

        <section className="card">
          <div className="card__header">
            <h2>Previsión de {DIAS_VISIBLES[condiciones.diaSemana]}</h2>
            <p className="page-header__subtitle">De {HORA_APERTURA}:00 a {HORA_CIERRE}:00</p>
          </div>
          <div className="card__body">
            {!prevision ? (
              <div className="state">
                <span className="state__icon"><FaChartLine /></span>
                <p className="state__title">Sin previsión todavía</p>
                <p className="state__text">
                  Ajusta las condiciones y pulsa «Ver previsión del día» para saber en qué
                  horas se espera más afluencia.
                </p>
              </div>
            ) : (
              <>
                <PrevisionDia
                  franjas={prevision.franjas}
                  horaDestacada={horaElegida}
                  onElegirHora={setHoraElegida}
                />

                {franjaElegida && (
                  <div className={`detalle ${franjaElegida.demandaAlta ? 'detalle--alta' : ''}`}>
                    <div>
                      <p className="detalle__hora">{franjaElegida.hora}:00</p>
                      <p className="detalle__texto">
                        Demanda <strong>{franjaElegida.demandaAlta ? 'alta' : 'normal'}</strong>
                        {' '}· {franjaElegida.confianza}% de confianza
                      </p>
                    </div>
                    <button
                      type="button" className="btn btn--secondary btn--sm"
                      onClick={guardarConsulta} disabled={guardando}
                    >
                      <FaBookmark /> {guardando ? 'Guardando…' : 'Guardar en el historial'}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </>
  );
};

export default PredictionForm;
