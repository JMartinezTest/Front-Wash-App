import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import './PredictionHistory.css';
import { apiService } from '../../api/apiService';

const PredictionHistory = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const data = await apiService.getPredictionHistory();
        setHistory(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
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
      
      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}
      
      {loading ? (
        <div className="loading-spinner"></div>
      ) : history.length === 0 ? (
        <p>No hay predicciones registradas.</p>
      ) : (
        <>
          <button className="export-button" onClick={exportToExcel}>
            <span className="button-icon">📊</span>
            Exportar a Excel
          </button>
          
          <div className="table-wrapper">
            <table className="prediction-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Día</th>
                  <th>Jornada</th>
                  <th>Clima</th>
                  <th>Temperatura</th>
                  <th>Servicio</th>
                  <th>Visitas</th>
                  <th>Promociones</th>
                  <th>Clientes Estimados</th>
                  <th>Confianza</th>
                </tr>
              </thead>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id}>
                    <td>{record.id}</td>
                    <td>{record.diaSemana}</td>
                    <td>{record.jornada}</td>
                    <td>{record.clima}</td>
                    <td>{record.temperatura}°C</td>
                    <td>{record.tipoServicio}</td>
                    <td>{record.historialVisitas}</td>
                    <td>{record.promocionesActivas}</td>
                    <td className={`prediction-cell ${record.clientesEstimados?.toLowerCase()}`}>
                      {record.clientesEstimados}
                    </td>
                    <td>
                      <div className="confidence-display">
                        {record.confianza}%
                        <div className="confidence-bar">
                          <div 
                            className="confidence-fill" 
                            style={{ width: `${record.confianza}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
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