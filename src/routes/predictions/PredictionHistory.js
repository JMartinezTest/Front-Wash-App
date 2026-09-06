import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Link } from 'react-router-dom';
import { FaFileExcel, FaChartLine } from 'react-icons/fa';
import DataTable from '../../components/DataTable';
import Modal from '../../components/Modal';
import PrevisionDia from '../../components/PrevisionDia';
import '../../components/PrevisionDia.css';
import PageState from '../../components/PageState';
import { apiService } from '../../api/apiService';
import { fechaHora } from '../../utils/formato';
import './PredictionHistory.css';

const PredictionHistory = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  // Registro abierto y previsión del día recalculada con sus mismas condiciones.
  const [detalle, setDetalle] = useState(null);
  const [franjas, setFranjas] = useState(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiService.getPredictionHistory();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err.message || 'No se pudo cargar el historial.');
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  /**
   * Al abrir un registro se vuelve a pasar el modelo por todas las horas con las
   * condiciones que se guardaron: así se ve la predicción en su contexto, no como
   * un dato suelto de una sola hora.
   */
  const abrirDetalle = async (registro) => {
    setDetalle(registro);
    setFranjas(null);
    setCargandoDetalle(true);
    try {
      const datos = await apiService.forecastDay({
        diaSemana: registro.diaSemana,
        clima: registro.clima,
        temperatura: registro.temperatura,
        historialVisitas: registro.historialVisitas,
        promocionesActivas: registro.promocionesActivas,
        horaInicio: 8,
        horaFin: 20,
      });
      setFranjas(datos.franjas);
    } catch (err) {
      setError(err.message || 'No se pudo recuperar la previsión de ese día.');
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarDetalle = () => { setDetalle(null); setFranjas(null); };

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(history);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Historial');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    saveAs(new Blob([excelBuffer], { type: 'application/octet-stream' }), 'historial_predicciones.xlsx');
  };

  // Los valores llegan como los espera el modelo (Sabado, Basico): se muestran con tilde.
  const conTilde = (valor) => ({
    Miercoles: 'Miércoles', Sabado: 'Sábado', Basico: 'Básico', Si: 'Sí',
  }[valor] || valor || '—');

  const columns = [
    {
      key: 'creadoEn',
      title: 'Consultada',
      search: (r) => fechaHora(r.creadoEn) || '',
      render: (r) => fechaHora(r.creadoEn) || <span className="dato-ausente">sin fecha</span>,
    },
    { key: 'diaSemana', title: 'Día previsto', render: (r) => conTilde(r.diaSemana) },
    {
      key: 'hora',
      title: 'Hora',
      numeric: true,
      search: (r) => (r.hora == null ? '' : `${r.hora}:00`),
      render: (r) => (r.hora == null ? '—' : `${Math.round(r.hora)}:00`),
    },
    { key: 'clima', title: 'Clima' },
    { key: 'temperatura', title: 'Temp.', numeric: true, render: (r) => `${r.temperatura}°C` },
    { key: 'historialVisitas', title: 'Visitas', numeric: true },
    { key: 'promocionesActivas', title: 'Promoción', render: (r) => conTilde(r.promocionesActivas) },
    {
      // El backend guarda el campo como `prediccion` (Si/No), no como clientesEstimados.
      key: 'prediccion',
      title: 'Demanda',
      search: (r) => (r.prediccion === 'Si' ? 'alta' : 'normal'),
      render: (r) => (
        <span className={`estimacion ${r.prediccion === 'Si' ? 'estimacion--alta' : ''}`}>
          {r.prediccion === 'Si' ? 'Alta' : 'Normal'}
        </span>
      ),
    },
    {
      key: 'confianza',
      title: 'Confianza',
      render: (r) => (
        <div className="confianza">
          <span className="confianza__cifra">{r.confianza}</span>
          <span className="confianza__barra">
            <span className="confianza__relleno" style={{ width: String(r.confianza || '0').replace(',', '.') }} />
          </span>
        </div>
      ),
    },
  ];

  if (loading) return <PageState titulo="Historial de predicciones" cargando />;

  return (
    <>
      <div className="page-header">
        <div className="page-header__titles">
          <h1>Historial de predicciones</h1>
          <p className="page-header__subtitle">
            {history.length} {history.length === 1 ? 'predicción registrada' : 'predicciones registradas'}
          </p>
        </div>
        <div className="page-header__actions">
          {history.length > 0 && (
            <button className="btn btn--secondary" onClick={exportToExcel}>
              <FaFileExcel /> Exportar a Excel
            </button>
          )}
          <Link to="/predictions" className="btn btn--primary">
            <FaChartLine /> Nueva predicción
          </Link>
        </div>
      </div>

      {error && <div className="alert alert--error">{error}</div>}

      <DataTable
        onRowClick={abrirDetalle}
        searchPlaceholder="Buscar por fecha, día o clima…"
        itemLabel="predicciones"
        pageSize={10}
        columns={columns}
        data={history}
        emptyMessage="Todavía no hay predicciones"
        emptyHint="Cuando ejecutes una predicción de demanda quedará registrada aquí."
      />
      {detalle && (
        <Modal
          titulo={`${conTilde(detalle.diaSemana)} · ${detalle.clima} ${Math.round(detalle.temperatura)}°C`}
          subtitulo={`Previsión completa del día con las condiciones que se guardaron`}
          onCerrar={cerrarDetalle}
        >
          <dl className="detalle-condiciones">
            <div><dt>Consultada el</dt><dd>{fechaHora(detalle.creadoEn) || '—'}</dd></div>
            <div><dt>Hora prevista</dt><dd>{Math.round(detalle.hora)}:00</dd></div>
            <div><dt>Resultado</dt><dd>{detalle.prediccion === 'Si' ? 'Demanda alta' : 'Demanda normal'}</dd></div>
            <div><dt>Confianza</dt><dd>{detalle.confianza}</dd></div>
            <div><dt>Visitas previas</dt><dd>{detalle.historialVisitas}</dd></div>
            <div><dt>Promoción</dt><dd>{conTilde(detalle.promocionesActivas)}</dd></div>
          </dl>

          {cargandoDetalle ? (
            <div className="state"><span className="spinner" /><p className="state__text">Calculando el día…</p></div>
          ) : franjas ? (
            <PrevisionDia franjas={franjas} horaDestacada={Math.round(detalle.hora)} />
          ) : (
            <p className="state__text">No se pudo recuperar la previsión del día.</p>
          )}
        </Modal>
      )}
    </>
  );
};

export default PredictionHistory;
