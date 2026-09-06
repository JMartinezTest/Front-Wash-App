import React from 'react';
import { Link } from 'react-router-dom';
import './Form.css';

/**
 * Formulario de alta y edicion comun a los catalogos.
 *
 * Los campos se declaran como datos; aqui solo se decide como se ven, para que
 * clientes, vehiculos, empleados y servicios se comporten igual.
 */
const Form = ({
  title,
  subtitle,
  fields,
  onSubmit,
  error,
  successMessage,
  submitText = 'Guardar',
  cancelTo,
  submitting = false,
}) => (
  <>
    {title && (
      <div className="page-header">
        <div className="page-header__titles">
          <h1>{title}</h1>
          {subtitle && <p className="page-header__subtitle">{subtitle}</p>}
        </div>
      </div>
    )}

    {error && <div className="alert alert--error">{error}</div>}
    {successMessage && <div className="alert alert--success">{successMessage}</div>}

    <div className="card form-card">
      <form onSubmit={onSubmit} className="card__body">
        <div className="form-grid">
          {fields.map((field) => (
            <div
              key={field.name}
              className={`field ${field.full ? 'field--full' : ''}`}
            >
              <label htmlFor={field.name}>
                {field.label}
                {!field.required && <span className="field-opcional">opcional</span>}
              </label>

              {field.type === 'select' ? (
                <select
                  id={field.name}
                  name={field.name}
                  value={field.value || ''}
                  onChange={field.onChange}
                  required={field.required}
                >
                  <option value="">Seleccione…</option>
                  {(field.options || []).map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              ) : field.type === 'textarea' ? (
                <textarea
                  id={field.name}
                  name={field.name}
                  rows={field.rows || 3}
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder={field.placeholder}
                  required={field.required}
                />
              ) : (
                <input
                  id={field.name}
                  type={field.type || 'text'}
                  name={field.name}
                  placeholder={field.placeholder}
                  value={field.value ?? ''}
                  onChange={field.onChange}
                  required={field.required}
                  readOnly={field.readOnly}
                  step={field.step}
                  min={field.min}
                />
              )}

              {field.hint && <span className="field-hint">{field.hint}</span>}
            </div>
          ))}
        </div>

        <div className="form-actions">
          {cancelTo && (
            <Link to={cancelTo} className="btn btn--ghost">Cancelar</Link>
          )}
          <button type="submit" className="btn btn--primary" disabled={submitting}>
            {submitting ? 'Guardando…' : submitText}
          </button>
        </div>
      </form>
    </div>
  </>
);

export default Form;
