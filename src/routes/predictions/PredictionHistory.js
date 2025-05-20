import React, { useState, useEffect } from 'react';
import { apiService } from '../api/apiService';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './PredictionHistory.css';

const PredictionHistory = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await apiService.getPredictionHistory();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchHistory();
  }, []);

  const exportToExcel = () => {
    const worksheet = XLSX.utils.json_to_sheet(history);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Historial");

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(file, 'historial_predicciones.xlsx');
  };

  return (
    <div className="prediction-history-container">
      <h2>Historial de Predicciones</h2>
      {error && <p className="error">Error: {error}</p>}
      {history.length === 0 ? (
        <p>No hay predicciones registradas.</p>
      ) : (
        <>
          <button className="export-button" onClick={exportToExcel}>Exportar a Excel</button>
          <div className="table-wrapper">
            <table className="prediction-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Cliente</th>
                  <th>Día</th>
                  <th>Hora</th>
                  <th>Clima</th>
                  <th>Temperatura</th>
                  <th>Servicio</th>
                  <th>Visitas</th>
                  <th>Promociones</th>
                  <th>Predicción</th>
                  <th>Confianza</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.idCliente}</td>
                    <td>{record.diaSemana}</td>
                    <td>{record.hora}</td>
                    <td>{record.clima}</td>
                    <td>{record.temperatura}</td>
                    <td>{record.tipoServicio}</td>
                    <td>{record.historialVisitas}</td>
                    <td>{record.promocionesActivas}</td>
                    <td>{record.prediccion}</td>
                    <td>{record.confianza}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default PredictionHistory;