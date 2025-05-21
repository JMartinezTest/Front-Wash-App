import React, { useState } from 'react';
import './PredictionForm.css';
import { apiService } from '../../api/apiService';

const PredictionForm = () => {
  const [formData, setFormData] = useState({
    diaSemana: '',
    jornada: '',
    clima: '',
    temperatura: '',
    tipoServicio: '',
    historialVisitas: '',
    promocionesActivas: '',
  });
  const [predictionResult, setPredictionResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setPredictionResult(null);
    setLoading(true);

    try {
      // Prepare and validate data
      const data = {
        diaSemana: formData.diaSemana || '', // Nominal
        jornada: formData.jornada || '', // Nominal
        clima: formData.clima || '', // Nominal
        temperatura: Number(formData.temperatura) || 0.0, // Numeric
        tipoServicio: formData.tipoServicio || '', // Nominal
        historialVisitas: parseInt(formData.historialVisitas) || 0, // Numeric
        promocionesActivas: formData.promocionesActivas || '', // Nominal
      };

      // Define valid nominal values
      const validDiaSemana = ['Lunes', 'Martes', 'Miercoles', 'Jueves', 'Viernes', 'Sabado', 'Domingo'];
      const validJornada = ['Mañana', 'Tarde', 'Noche'];
      const validClima = ['Soleado', 'Lluvioso', 'Nublado'];
      const validTipoServicio = ['Basico', 'Completo', 'Premium'];
      const validPromocionesActivas = ['Si', 'No'];

      // Validate nominal attributes
      if (!validDiaSemana.includes(data.diaSemana)) {
        throw new Error('Día de la semana inválido. Seleccione un valor válido.');
      }
      if (!validJornada.includes(data.jornada)) {
        throw new Error('Jornada inválida. Seleccione un valor válido.');
      }
      if (!validClima.includes(data.clima)) {
        throw new Error('Clima inválido. Seleccione un valor válido.');
      }
      if (!validTipoServicio.includes(data.tipoServicio)) {
        throw new Error('Tipo de servicio inválido. Seleccione un valor válido.');
      }
      if (!validPromocionesActivas.includes(data.promocionesActivas)) {
        throw new Error('Promociones activas inválido. Seleccione un valor válido.');
      }

      // Validate numeric attributes
      if (data.temperatura < -50 || data.temperatura > 50) {
        throw new Error('Temperatura debe estar entre -50 y 50 °C.');
      }
      if (data.historialVisitas < 0) {
        throw new Error('Historial de visitas no puede ser negativo.');
      }

      const response = await apiService.predictDemand(data);
      setPredictionResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="prediction-form-container">
      <div className="form-header">
        <h2>Predicción de Demanda</h2>
        <p className="form-subtitle">Complete el formulario para predecir la demanda del servicio de lavado</p>
      </div>
      
      <form onSubmit={handleSubmit} className="prediction-form">
        <div className="form-grid">
          <div className="form-column">
            <div className="form-field">
              <label htmlFor="diaSemana">
                <span className="field-icon">📅</span>
                Día de la Semana
              </label>
              <select 
                id="diaSemana"
                name="diaSemana" 
                value={formData.diaSemana} 
                onChange={handleChange} 
                required
              >
                <option value="">Seleccione un día</option>
                <option value="Lunes">Lunes</option>
                <option value="Martes">Martes</option>
                <option value="Miercoles">Miércoles</option>
                <option value="Jueves">Jueves</option>
                <option value="Viernes">Viernes</option>
                <option value="Sabado">Sábado</option>
                <option value="Domingo">Domingo</option>
              </select>
            </div>
            
            <div className="form-field">
              <label htmlFor="jornada">
                <span className="field-icon">🕒</span>
                Jornada
              </label>
              <select 
                id="jornada"
                name="jornada" 
                value={formData.jornada} 
                onChange={handleChange} 
                required
              >
                <option value="">Seleccione la jornada</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Noche">Noche</option>
              </select>
            </div>
            
            <div className="form-field">
              <label htmlFor="temperatura">
                <span className="field-icon">🌡️</span>
                Temperatura (°C)
              </label>
              <input 
                type="number" 
                id="temperatura"
                name="temperatura" 
                value={formData.temperatura} 
                onChange={handleChange} 
                step="0.1" 
                placeholder="Temperatura en grados Celsius"
                required 
              />
            </div>
          </div>

          <div className="form-column">
            <div className="form-field">
              <label htmlFor="clima">
                <span className="field-icon">🌤️</span>
                Clima
              </label>
              <select 
                id="clima"
                name="clima" 
                value={formData.clima} 
                onChange={handleChange} 
                required
              >
                <option value="">Seleccione el clima</option>
                <option value="Soleado">Soleado</option>
                <option value="Lluvioso">Lluvioso</option>
                <option value="Nublado">Nublado</option>
              </select>
            </div>
            
            <div className="form-field">
              <label htmlFor="tipoServicio">
                <span className="field-icon">🚿</span>
                Tipo de Servicio
              </label>
              <select 
                id="tipoServicio"
                name="tipoServicio" 
                value={formData.tipoServicio} 
                onChange={handleChange} 
                required
              >
                <option value="">Seleccione el servicio</option>
                <option value="Basico">Básico</option>
                <option value="Completo">Completo</option>
                <option value="Premium">Premium</option>
              </select>
            </div>
            
            <div className="form-field">
              <label htmlFor="historialVisitas">
                <span className="field-icon">📊</span>
                Historial de Visitas
              </label>
              <input 
                type="number" 
                id="historialVisitas"
                name="historialVisitas" 
                value={formData.historialVisitas} 
                onChange={handleChange} 
                min="0" 
                step="1" 
                placeholder="Número de visitas previas"
                required 
              />
            </div>
            
            <div className="form-field">
              <label htmlFor="promocionesActivas">
                <span className="field-icon">🏷️</span>
                Promociones Activas
              </label>
              <select 
                id="promocionesActivas"
                name="promocionesActivas" 
                value={formData.promocionesActivas} 
                onChange={handleChange} 
                required
              >
                <option value="">Seleccione una opción</option>
                <option value="Si">Sí</option>
                <option value="No">No</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? (
              <span className="loading-spinner"></span>
            ) : (
              <>
                <span className="button-icon">🔮</span>
                Predecir Demanda
              </>
            )}
          </button>
        </div>
      </form>

      {predictionResult && (
        <div className="prediction-result">
          <div className="result-header">
            <span className="result-icon">✅</span>
            <h3>Resultado de la Predicción</h3>
          </div>
          <div className="result-content">
            <div className="result-item">
              <span className="result-label">Clientes Estimados:</span>
              <span className="result-value">{predictionResult.clientesEstimados}</span>
            </div>
            <div className="result-item">
              <span className="result-label">Confianza:</span>
              <span className="result-value">{predictionResult.confianza}%</span>
              <div className="confidence-bar">
                <div 
                  className="confidence-fill" 
                  style={{ width: `${predictionResult.confianza}%` }}
                ></div>
              </div>
            </div>
            <div className="result-item">
              <span className="result-label">ID de Registro:</span>
              <span className="result-value">{predictionResult.id}</span>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="error-message">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default PredictionForm;